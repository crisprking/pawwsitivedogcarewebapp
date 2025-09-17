import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  decimal,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  isPremium: boolean("is_premium").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Dog profiles
export const dogs = pgTable("dogs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  breed: varchar("breed").notNull(),
  birthDate: date("birth_date"),
  weight: decimal("weight", { precision: 5, scale: 2 }),
  gender: varchar("gender"),
  profileImageUrl: varchar("profile_image_url"),
  microchipId: varchar("microchip_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Health records
export const healthRecords = pgTable("health_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dogId: varchar("dog_id").notNull().references(() => dogs.id, { onDelete: "cascade" }),
  type: varchar("type").notNull(), // symptom, weight, vaccination, checkup
  title: varchar("title").notNull(),
  description: text("description"),
  severity: varchar("severity"), // mild, moderate, severe
  photoUrls: text("photo_urls").array(),
  vetNotes: text("vet_notes"),
  recordedAt: timestamp("recorded_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Medications
export const medications = pgTable("medications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dogId: varchar("dog_id").notNull().references(() => dogs.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  dosage: varchar("dosage").notNull(),
  frequency: varchar("frequency").notNull(), // daily, weekly, monthly, as-needed
  instructions: text("instructions"),
  refillCount: integer("refill_count").default(0),
  isActive: boolean("is_active").default(true),
  startDate: date("start_date"),
  endDate: date("end_date"),
  nextDueDate: timestamp("next_due_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Medication logs
export const medicationLogs = pgTable("medication_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  medicationId: varchar("medication_id").notNull().references(() => medications.id, { onDelete: "cascade" }),
  givenAt: timestamp("given_at").defaultNow(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Veterinary appointments
export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dogId: varchar("dog_id").notNull().references(() => dogs.id, { onDelete: "cascade" }),
  vetName: varchar("vet_name").notNull(),
  clinicName: varchar("clinic_name").notNull(),
  clinicAddress: text("clinic_address"),
  clinicPhone: varchar("clinic_phone"),
  appointmentType: varchar("appointment_type").notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  status: varchar("status").default("scheduled"), // scheduled, completed, cancelled
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Weight tracking
export const weightRecords = pgTable("weight_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dogId: varchar("dog_id").notNull().references(() => dogs.id, { onDelete: "cascade" }),
  weight: decimal("weight", { precision: 5, scale: 2 }).notNull(),
  recordedAt: timestamp("recorded_at").defaultNow(),
  notes: text("notes"),
});

// Vaccinations
export const vaccinations = pgTable("vaccinations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dogId: varchar("dog_id").notNull().references(() => dogs.id, { onDelete: "cascade" }),
  vaccineName: varchar("vaccine_name").notNull(),
  administeredAt: timestamp("administered_at").notNull(),
  nextDueDate: date("next_due_date"),
  vetName: varchar("vet_name"),
  batchNumber: varchar("batch_number"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  dogs: many(dogs),
}));

export const dogsRelations = relations(dogs, ({ one, many }) => ({
  user: one(users, {
    fields: [dogs.userId],
    references: [users.id],
  }),
  healthRecords: many(healthRecords),
  medications: many(medications),
  appointments: many(appointments),
  weightRecords: many(weightRecords),
  vaccinations: many(vaccinations),
}));

export const healthRecordsRelations = relations(healthRecords, ({ one }) => ({
  dog: one(dogs, {
    fields: [healthRecords.dogId],
    references: [dogs.id],
  }),
}));

export const medicationsRelations = relations(medications, ({ one, many }) => ({
  dog: one(dogs, {
    fields: [medications.dogId],
    references: [dogs.id],
  }),
  logs: many(medicationLogs),
}));

export const medicationLogsRelations = relations(medicationLogs, ({ one }) => ({
  medication: one(medications, {
    fields: [medicationLogs.medicationId],
    references: [medications.id],
  }),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  dog: one(dogs, {
    fields: [appointments.dogId],
    references: [dogs.id],
  }),
}));

export const weightRecordsRelations = relations(weightRecords, ({ one }) => ({
  dog: one(dogs, {
    fields: [weightRecords.dogId],
    references: [dogs.id],
  }),
}));

export const vaccinationsRelations = relations(vaccinations, ({ one }) => ({
  dog: one(dogs, {
    fields: [vaccinations.dogId],
    references: [dogs.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertDogSchema = createInsertSchema(dogs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHealthRecordSchema = createInsertSchema(healthRecords).omit({
  id: true,
  createdAt: true,
});

export const insertMedicationSchema = createInsertSchema(medications).omit({
  id: true,
  createdAt: true,
});

export const insertMedicationLogSchema = createInsertSchema(medicationLogs).omit({
  id: true,
  createdAt: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
});

export const insertWeightRecordSchema = createInsertSchema(weightRecords).omit({
  id: true,
});

export const insertVaccinationSchema = createInsertSchema(vaccinations).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertDog = z.infer<typeof insertDogSchema>;
export type Dog = typeof dogs.$inferSelect;
export type InsertHealthRecord = z.infer<typeof insertHealthRecordSchema>;
export type HealthRecord = typeof healthRecords.$inferSelect;
export type InsertMedication = z.infer<typeof insertMedicationSchema>;
export type Medication = typeof medications.$inferSelect;
export type InsertMedicationLog = z.infer<typeof insertMedicationLogSchema>;
export type MedicationLog = typeof medicationLogs.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertWeightRecord = z.infer<typeof insertWeightRecordSchema>;
export type WeightRecord = typeof weightRecords.$inferSelect;
export type InsertVaccination = z.infer<typeof insertVaccinationSchema>;
export type Vaccination = typeof vaccinations.$inferSelect;
