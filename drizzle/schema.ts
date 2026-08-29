import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const listings = mysqlTable("listings", {
  id: int("id").autoincrement().primaryKey(),
  sellerId: int("sellerId").notNull().references(() => users.id),
  title: varchar("title", { length: 180 }).notNull(),
  description: text("description").notNull(),
  price: int("price").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  condition: varchar("condition", { length: 100 }).notNull(),
  imageUrl: text("imageUrl"),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["unpaid", "pending_verification", "verified", "rejected"]).default("unpaid").notNull(),
  paymentReference: varchar("paymentReference", { length: 120 }),
  paymentProofUrl: text("paymentProofUrl"),
  paymentVerifiedBy: int("paymentVerifiedBy").references(() => users.id),
  paymentVerifiedAt: timestamp("paymentVerifiedAt"),
  rejectionReason: text("rejectionReason"),
  reviewedBy: int("reviewedBy").references(() => users.id),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Listing = typeof listings.$inferSelect;
export type InsertListing = typeof listings.$inferInsert;