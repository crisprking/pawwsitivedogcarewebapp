import {
  users,
  dogs,
  healthRecords,
  medications,
  medicationLogs,
  appointments,
  weightRecords,
  vaccinations,
  type User,
  type UpsertUser,
  type Dog,
  type InsertDog,
  type HealthRecord,
  type InsertHealthRecord,
  type Medication,
  type InsertMedication,
  type MedicationLog,
  type InsertMedicationLog,
  type Appointment,
  type InsertAppointment,
  type WeightRecord,
  type InsertWeightRecord,
  type Vaccination,
  type InsertVaccination,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User>;
  
  // Dog operations
  getUserDogs(userId: string): Promise<Dog[]>;
  getDog(id: string): Promise<Dog | undefined>;
  createDog(dog: InsertDog): Promise<Dog>;
  updateDog(id: string, updates: Partial<InsertDog>): Promise<Dog>;
  deleteDog(id: string): Promise<void>;
  
  // Health record operations
  getDogHealthRecords(dogId: string): Promise<HealthRecord[]>;
  createHealthRecord(record: InsertHealthRecord): Promise<HealthRecord>;
  getHealthRecord(id: string): Promise<HealthRecord | undefined>;
  
  // Medication operations
  getDogMedications(dogId: string): Promise<Medication[]>;
  createMedication(medication: InsertMedication): Promise<Medication>;
  updateMedication(id: string, updates: Partial<InsertMedication>): Promise<Medication>;
  logMedicationTaken(log: InsertMedicationLog): Promise<MedicationLog>;
  
  // Appointment operations
  getDogAppointments(dogId: string): Promise<Appointment[]>;
  getUserUpcomingAppointments(userId: string): Promise<(Appointment & { dogName: string })[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: string, updates: Partial<InsertAppointment>): Promise<Appointment>;
  
  // Weight tracking operations
  getDogWeightRecords(dogId: string, startDate?: Date, endDate?: Date): Promise<WeightRecord[]>;
  createWeightRecord(record: InsertWeightRecord): Promise<WeightRecord>;
  
  // Vaccination operations
  getDogVaccinations(dogId: string): Promise<Vaccination[]>;
  createVaccination(vaccination: InsertVaccination): Promise<Vaccination>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId,
        stripeSubscriptionId,
        isPremium: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Dog operations
  async getUserDogs(userId: string): Promise<Dog[]> {
    return await db.select().from(dogs).where(and(eq(dogs.userId, userId), eq(dogs.isActive, true)));
  }

  async getDog(id: string): Promise<Dog | undefined> {
    const [dog] = await db.select().from(dogs).where(eq(dogs.id, id));
    return dog;
  }

  async createDog(dog: InsertDog): Promise<Dog> {
    const [newDog] = await db.insert(dogs).values(dog).returning();
    return newDog;
  }

  async updateDog(id: string, updates: Partial<InsertDog>): Promise<Dog> {
    const [updatedDog] = await db
      .update(dogs)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(dogs.id, id))
      .returning();
    return updatedDog;
  }

  async deleteDog(id: string): Promise<void> {
    await db.update(dogs).set({ isActive: false }).where(eq(dogs.id, id));
  }

  // Health record operations
  async getDogHealthRecords(dogId: string): Promise<HealthRecord[]> {
    return await db
      .select()
      .from(healthRecords)
      .where(eq(healthRecords.dogId, dogId))
      .orderBy(desc(healthRecords.recordedAt));
  }

  async createHealthRecord(record: InsertHealthRecord): Promise<HealthRecord> {
    const [newRecord] = await db.insert(healthRecords).values(record).returning();
    return newRecord;
  }

  async getHealthRecord(id: string): Promise<HealthRecord | undefined> {
    const [record] = await db.select().from(healthRecords).where(eq(healthRecords.id, id));
    return record;
  }

  // Medication operations
  async getDogMedications(dogId: string): Promise<Medication[]> {
    return await db
      .select()
      .from(medications)
      .where(and(eq(medications.dogId, dogId), eq(medications.isActive, true)))
      .orderBy(desc(medications.nextDueDate));
  }

  async createMedication(medication: InsertMedication): Promise<Medication> {
    const [newMedication] = await db.insert(medications).values(medication).returning();
    return newMedication;
  }

  async updateMedication(id: string, updates: Partial<InsertMedication>): Promise<Medication> {
    const [updatedMedication] = await db
      .update(medications)
      .set(updates)
      .where(eq(medications.id, id))
      .returning();
    return updatedMedication;
  }

  async logMedicationTaken(log: InsertMedicationLog): Promise<MedicationLog> {
    const [newLog] = await db.insert(medicationLogs).values(log).returning();
    return newLog;
  }

  // Appointment operations
  async getDogAppointments(dogId: string): Promise<Appointment[]> {
    return await db
      .select()
      .from(appointments)
      .where(eq(appointments.dogId, dogId))
      .orderBy(desc(appointments.scheduledAt));
  }

  async getUserUpcomingAppointments(userId: string): Promise<(Appointment & { dogName: string })[]> {
    const result = await db
      .select({
        id: appointments.id,
        dogId: appointments.dogId,
        vetName: appointments.vetName,
        clinicName: appointments.clinicName,
        clinicAddress: appointments.clinicAddress,
        clinicPhone: appointments.clinicPhone,
        appointmentType: appointments.appointmentType,
        scheduledAt: appointments.scheduledAt,
        status: appointments.status,
        notes: appointments.notes,
        createdAt: appointments.createdAt,
        dogName: dogs.name,
      })
      .from(appointments)
      .innerJoin(dogs, eq(appointments.dogId, dogs.id))
      .where(
        and(
          eq(dogs.userId, userId),
          eq(appointments.status, "scheduled"),
          gte(appointments.scheduledAt, new Date())
        )
      )
      .orderBy(appointments.scheduledAt);

    return result;
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const [newAppointment] = await db.insert(appointments).values(appointment).returning();
    return newAppointment;
  }

  async updateAppointment(id: string, updates: Partial<InsertAppointment>): Promise<Appointment> {
    const [updatedAppointment] = await db
      .update(appointments)
      .set(updates)
      .where(eq(appointments.id, id))
      .returning();
    return updatedAppointment;
  }

  // Weight tracking operations
  async getDogWeightRecords(dogId: string, startDate?: Date, endDate?: Date): Promise<WeightRecord[]> {
    let whereConditions = [eq(weightRecords.dogId, dogId)];
    
    if (startDate && endDate) {
      whereConditions.push(
        gte(weightRecords.recordedAt, startDate),
        lte(weightRecords.recordedAt, endDate)
      );
    }
    
    return await db
      .select()
      .from(weightRecords)
      .where(and(...whereConditions))
      .orderBy(desc(weightRecords.recordedAt));
  }

  async createWeightRecord(record: InsertWeightRecord): Promise<WeightRecord> {
    const [newRecord] = await db.insert(weightRecords).values(record).returning();
    return newRecord;
  }

  // Vaccination operations
  async getDogVaccinations(dogId: string): Promise<Vaccination[]> {
    return await db
      .select()
      .from(vaccinations)
      .where(eq(vaccinations.dogId, dogId))
      .orderBy(desc(vaccinations.administeredAt));
  }

  async createVaccination(vaccination: InsertVaccination): Promise<Vaccination> {
    const [newVaccination] = await db.insert(vaccinations).values(vaccination).returning();
    return newVaccination;
  }
}

export const storage = new DatabaseStorage();
