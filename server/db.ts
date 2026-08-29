import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertListing, InsertUser, listings, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export const ADMIN_EMAIL = "laminedz.19@gmail.com";

export function ownerShouldBeAdmin(openId: string, ownerOpenId?: string) {
  return Boolean(ownerOpenId) && openId === ownerOpenId;
}

export function isAuthorizedAdmin(user: { openId: string; email?: string | null }) {
  return user.email?.trim().toLowerCase() === ADMIN_EMAIL;
}

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (isAuthorizedAdmin(user)) {
      values.role = "admin";
      updateSet.role = "admin";
    } else {
      values.role = "user";
      updateSet.role = "user";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createListing(input: InsertListing) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(listings).values(input);
  return result[0].insertId;
}

export async function getApprovedListingById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(listings).where(eq(listings.id, id)).limit(1);
  return result[0];
}

export async function getApprovedListings() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(listings).where(eq(listings.status, "approved")).orderBy(desc(listings.createdAt));
}

export async function getListingsBySeller(sellerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(listings).where(eq(listings.sellerId, sellerId)).orderBy(desc(listings.createdAt));
}

export async function getPendingListings() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(listings).where(eq(listings.status, "pending")).orderBy(desc(listings.createdAt));
}

export async function verifyListingPayment(id: number, reviewerId: number, paymentStatus: "verified" | "rejected") {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(listings).set({ paymentStatus, paymentVerifiedBy: reviewerId, paymentVerifiedAt: new Date() }).where(eq(listings.id, id));
}

export async function reviewListing(id: number, reviewerId: number, status: "approved" | "rejected", rejectionReason?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(listings).set({ status, reviewedBy: reviewerId, reviewedAt: new Date(), rejectionReason: status === "rejected" ? rejectionReason ?? null : null }).where(eq(listings.id, id));
}
