import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import multer from "multer";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import { insertDogSchema, insertHealthRecordSchema, insertMedicationSchema, insertAppointmentSchema, insertWeightRecordSchema, insertVaccinationSchema } from "@shared/schema";
import { z } from "zod";
import { analyzeSymptoms, analyzeHealthPhoto, performEmergencyAssessment, generateHealthSummary } from "./geminiService";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

if (!process.env.STRIPE_PRICE_ID && process.env.NODE_ENV === 'production') {
  throw new Error('Missing required Stripe secret: STRIPE_PRICE_ID');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {

  // Auth middleware
  await setupAuth(app);

  // Object storage routes for serving uploaded files
  app.get("/objects/:objectPath(*)", isAuthenticated, async (req: any, res) => {
    const userId = req.user?.claims?.sub;
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
        requestedPermission: ObjectPermission.READ,
      });
      if (!canAccess) {
        return res.sendStatus(401);
      }
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // File upload endpoint for health record photos
  app.post('/api/upload/health-photos', isAuthenticated, upload.array('photos', 5), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const objectStorageService = new ObjectStorageService();
      const uploadedPhotos: string[] = [];

      for (const file of files) {
        // Upload file to object storage
        const objectPath = await objectStorageService.uploadFile(
          file.buffer,
          file.originalname,
          file.mimetype
        );

        // Set ACL policy for the uploaded photo
        const finalPath = await objectStorageService.trySetObjectEntityAclPolicy(
          objectPath,
          {
            owner: userId,
            visibility: "private", // Health photos should be private
          }
        );

        uploadedPhotos.push(finalPath);
      }

      res.json({ photoUrls: uploadedPhotos });
    } catch (error) {
      console.error('Error uploading photos:', error);
      res.status(500).json({ error: 'Failed to upload photos' });
    }
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dog management routes
  app.get('/api/dogs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const dogs = await storage.getUserDogs(userId);
      res.json(dogs);
    } catch (error) {
      console.error("Error fetching dogs:", error);
      res.status(500).json({ message: "Failed to fetch dogs" });
    }
  });

  app.post('/api/dogs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const dogData = insertDogSchema.parse({ ...req.body, userId });
      const dog = await storage.createDog(dogData);
      res.json(dog);
    } catch (error) {
      console.error("Error creating dog:", error);
      res.status(400).json({ message: "Invalid dog data" });
    }
  });

  app.put('/api/dogs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = insertDogSchema.partial().parse(req.body);
      const dog = await storage.updateDog(id, updates);
      res.json(dog);
    } catch (error) {
      console.error("Error updating dog:", error);
      res.status(400).json({ message: "Invalid update data" });
    }
  });

  app.delete('/api/dogs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteDog(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting dog:", error);
      res.status(500).json({ message: "Failed to delete dog" });
    }
  });

  // Health records routes
  app.get('/api/dogs/:dogId/health-records', isAuthenticated, async (req, res) => {
    try {
      const { dogId } = req.params;
      const records = await storage.getDogHealthRecords(dogId);
      res.json(records);
    } catch (error) {
      console.error("Error fetching health records:", error);
      res.status(500).json({ message: "Failed to fetch health records" });
    }
  });

  app.post('/api/dogs/:dogId/health-records', isAuthenticated, async (req, res) => {
    try {
      const { dogId } = req.params;
      const recordData = insertHealthRecordSchema.parse({ ...req.body, dogId });
      const record = await storage.createHealthRecord(recordData);
      res.json(record);
    } catch (error) {
      console.error("Error creating health record:", error);
      res.status(400).json({ message: "Invalid health record data" });
    }
  });

  // Medication routes
  app.get('/api/dogs/:dogId/medications', isAuthenticated, async (req, res) => {
    try {
      const { dogId } = req.params;
      const medications = await storage.getDogMedications(dogId);
      res.json(medications);
    } catch (error) {
      console.error("Error fetching medications:", error);
      res.status(500).json({ message: "Failed to fetch medications" });
    }
  });

  app.post('/api/dogs/:dogId/medications', isAuthenticated, async (req, res) => {
    try {
      const { dogId } = req.params;
      const medicationData = insertMedicationSchema.parse({ ...req.body, dogId });
      const medication = await storage.createMedication(medicationData);
      res.json(medication);
    } catch (error) {
      console.error("Error creating medication:", error);
      res.status(400).json({ message: "Invalid medication data" });
    }
  });

  app.post('/api/medications/:id/log', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const log = await storage.logMedicationTaken({
        medicationId: id,
        notes: req.body.notes,
      });
      res.json(log);
    } catch (error) {
      console.error("Error logging medication:", error);
      res.status(500).json({ message: "Failed to log medication" });
    }
  });

  // Appointment routes
  app.get('/api/appointments/upcoming', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const appointments = await storage.getUserUpcomingAppointments(userId);
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.post('/api/dogs/:dogId/appointments', isAuthenticated, async (req, res) => {
    try {
      const { dogId } = req.params;
      const appointmentData = insertAppointmentSchema.parse({ ...req.body, dogId });
      const appointment = await storage.createAppointment(appointmentData);
      res.json(appointment);
    } catch (error) {
      console.error("Error creating appointment:", error);
      res.status(400).json({ message: "Invalid appointment data" });
    }
  });

  // Weight tracking routes
  app.get('/api/dogs/:dogId/weight-records', isAuthenticated, async (req, res) => {
    try {
      const { dogId } = req.params;
      const { startDate, endDate } = req.query;
      
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      
      const records = await storage.getDogWeightRecords(dogId, start, end);
      res.json(records);
    } catch (error) {
      console.error("Error fetching weight records:", error);
      res.status(500).json({ message: "Failed to fetch weight records" });
    }
  });

  app.post('/api/dogs/:dogId/weight-records', isAuthenticated, async (req, res) => {
    try {
      const { dogId } = req.params;
      const recordData = insertWeightRecordSchema.parse({ ...req.body, dogId });
      const record = await storage.createWeightRecord(recordData);
      res.json(record);
    } catch (error) {
      console.error("Error creating weight record:", error);
      res.status(400).json({ message: "Invalid weight record data" });
    }
  });

  // Vaccination routes
  app.get('/api/dogs/:dogId/vaccinations', isAuthenticated, async (req, res) => {
    try {
      const { dogId } = req.params;
      const vaccinations = await storage.getDogVaccinations(dogId);
      res.json(vaccinations);
    } catch (error) {
      console.error("Error fetching vaccinations:", error);
      res.status(500).json({ message: "Failed to fetch vaccinations" });
    }
  });

  app.post('/api/dogs/:dogId/vaccinations', isAuthenticated, async (req, res) => {
    try {
      const { dogId } = req.params;
      const vaccinationData = insertVaccinationSchema.parse({ ...req.body, dogId });
      const vaccination = await storage.createVaccination(vaccinationData);
      res.json(vaccination);
    } catch (error) {
      console.error("Error creating vaccination:", error);
      res.status(400).json({ message: "Invalid vaccination data" });
    }
  });

  // AI-powered analysis endpoints
  app.post('/api/ai/analyze-symptoms', isAuthenticated, async (req, res) => {
    try {
      const { dogId, symptomData } = req.body;
      
      // Validate required fields
      if (!dogId || !symptomData) {
        return res.status(400).json({ error: 'Missing required fields: dogId and symptomData' });
      }

      // Get dog information to provide context
      const dog = await storage.getDog(dogId);
      if (!dog) {
        return res.status(404).json({ error: 'Dog not found' });
      }

      // Calculate age from birthDate if available
      const age = dog.birthDate ? 
        Math.floor((Date.now() - new Date(dog.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365)) : 
        undefined;

      const analysisData = {
        ...symptomData,
        breed: dog.breed,
        age: age,
        weight: dog.weight ? parseFloat(dog.weight) : undefined,
      };

      const analysis = await analyzeSymptoms(analysisData);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing symptoms:", error);
      res.status(500).json({ error: 'Failed to analyze symptoms' });
    }
  });

  app.post('/api/ai/analyze-photo', isAuthenticated, upload.single('photo'), async (req: any, res) => {
    try {
      const file = req.file as Express.Multer.File;
      const { context } = req.body;
      
      if (!file) {
        return res.status(400).json({ error: 'No photo uploaded' });
      }

      const analysis = await analyzeHealthPhoto(file.buffer, file.mimetype, context);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing photo:", error);
      res.status(500).json({ error: 'Failed to analyze photo' });
    }
  });

  app.post('/api/ai/emergency-assessment', isAuthenticated, async (req, res) => {
    try {
      const { dogId, assessmentData } = req.body;
      
      if (!dogId || !assessmentData) {
        return res.status(400).json({ error: 'Missing required fields: dogId and assessmentData' });
      }

      // Get dog information for context
      const dog = await storage.getDog(dogId);
      if (!dog) {
        return res.status(404).json({ error: 'Dog not found' });
      }

      // Get recent health records for medical history
      const recentRecords = await storage.getDogHealthRecords(dogId);
      const medicalHistory = recentRecords
        .slice(0, 5) // Last 5 records
        .map(record => `${record.type}: ${record.title}`);

      const age = dog.birthDate ? 
        Math.floor((Date.now() - new Date(dog.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365)) : 
        undefined;

      const fullAssessmentData = {
        ...assessmentData,
        dogInfo: {
          breed: dog.breed,
          age: age,
          weight: dog.weight ? parseFloat(dog.weight) : undefined,
          medicalHistory: medicalHistory,
        },
      };

      const assessment = await performEmergencyAssessment(fullAssessmentData);
      res.json(assessment);
    } catch (error) {
      console.error("Error performing emergency assessment:", error);
      res.status(500).json({ error: 'Failed to perform emergency assessment' });
    }
  });

  app.post('/api/ai/generate-health-summary', isAuthenticated, async (req, res) => {
    try {
      const { dogId } = req.body;
      
      if (!dogId) {
        return res.status(400).json({ error: 'Missing required field: dogId' });
      }

      // Get dog information
      const dog = await storage.getDog(dogId);
      if (!dog) {
        return res.status(404).json({ error: 'Dog not found' });
      }

      // Get recent health records
      const healthRecords = await storage.getDogHealthRecords(dogId);
      const recentRecords = healthRecords.slice(0, 10); // Last 10 records

      const age = dog.birthDate ? 
        Math.floor((Date.now() - new Date(dog.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365)) : 
        undefined;

      const dogData = {
        name: dog.name,
        breed: dog.breed,
        age: age,
        weight: dog.weight ? parseFloat(dog.weight) : undefined,
      };

      const formattedRecords = recentRecords.map(record => ({
        type: record.type,
        title: record.title,
        description: record.description || undefined,
        severity: record.severity || undefined,
        recordedAt: record.recordedAt || new Date(),
      }));

      const summary = await generateHealthSummary(dogData, formattedRecords);
      res.json({ summary });
    } catch (error) {
      console.error("Error generating health summary:", error);
      res.status(500).json({ error: 'Failed to generate health summary' });
    }
  });

  // Stripe subscription route
  app.post('/api/get-or-create-subscription', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const userId = user.claims.sub;
      const userEmail = user.claims.email;

      if (!userEmail) {
        return res.status(400).json({ error: { message: 'No user email on file' } });
      }

      let userData = await storage.getUser(userId);
      
      if (userData?.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(userData.stripeSubscriptionId, {
          expand: ['latest_invoice.payment_intent']
        });
        const invoice = subscription.latest_invoice as any;
        return res.json({
          subscriptionId: subscription.id,
          clientSecret: invoice?.payment_intent?.client_secret,
        });
      }

      const customer = await stripe.customers.create({
        email: userEmail,
        name: `${user.claims.first_name || ''} ${user.claims.last_name || ''}`.trim() || undefined,
      });

      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{
          price: process.env.STRIPE_PRICE_ID || 'price_development_testing',
        }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      await storage.updateUserStripeInfo(userId, customer.id, subscription.id);
      
      const invoice = subscription.latest_invoice as any;
      res.json({
        subscriptionId: subscription.id,
        clientSecret: invoice?.payment_intent?.client_secret,
      });
    } catch (error: any) {
      console.error("Stripe subscription error:", error);
      res.status(400).json({ error: { message: error.message } });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
