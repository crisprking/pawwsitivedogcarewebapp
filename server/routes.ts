import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertDogSchema, insertHealthRecordSchema, insertMedicationSchema, insertAppointmentSchema, insertWeightRecordSchema, insertVaccinationSchema } from "@shared/schema";
import { z } from "zod";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27.basil",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

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
          price: process.env.STRIPE_PRICE_ID || 'price_1234567890', // Default price ID
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
