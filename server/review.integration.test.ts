import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createListing: vi.fn(async () => 44),
  getApprovedListingById: vi.fn(),
  getApprovedListings: vi.fn(async () => []),
  getListingsBySeller: vi.fn(async () => []),
  getPendingListings: vi.fn(async () => []),
  reviewListing: vi.fn(),
  verifyListingPayment: vi.fn(),
}));

vi.mock("./db", () => mocks);

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("listing review state transitions", () => {
  const context = (role: "admin" | "user"): TrpcContext => ({
    user: { id: role === "admin" ? 7 : 8, openId: `${role}-review`, name: role, email: `${role}@example.com`, loginMethod: "test", role, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  });

  it("records approved status and reviewer", async () => {
    mocks.getApprovedListingById.mockResolvedValueOnce({ id: 12, status: "pending", paymentStatus: "verified" });
    let state: Record<string, unknown> = { status: "pending" };
    mocks.reviewListing.mockImplementationOnce(async (id, reviewerId, status, rejectionReason) => { state = { id, reviewerId, status, rejectionReason: rejectionReason ?? null }; });
    await appRouter.createCaller(context("admin")).listings.review({ id: 12, status: "approved" });
    expect(state).toMatchObject({ id: 12, reviewerId: 7, status: "approved", rejectionReason: null });
  });

  it("creates a listing with pending payment verification", async () => {
    await appRouter.createCaller(context("user")).listings.create({ title: "طاولة", description: "وصف إعلان صالح هنا", price: 3000, city: "الجزائر", category: "أثاث", condition: "جيدة", paymentReference: "REF-300", paymentProofUrl: "https://storage.example.com/proof.webp", imageUrl: "https://example.com/image.webp" });
    expect(mocks.createListing).toHaveBeenCalledWith(expect.objectContaining({ sellerId: 8, paymentReference: "REF-300", paymentProofUrl: "https://storage.example.com/proof.webp", paymentStatus: "pending_verification" }));
  });

  it("records verified payment by an admin", async () => {
    await appRouter.createCaller(context("admin")).listings.verifyPayment({ id: 14, paymentStatus: "verified" });
    expect(mocks.verifyListingPayment).toHaveBeenCalledWith(14, 7, "verified");
  });

  it("records rejected status and rejection reason", async () => {
    let state: Record<string, unknown> = { status: "pending" };
    mocks.reviewListing.mockImplementationOnce(async (id, reviewerId, status, rejectionReason) => { state = { id, reviewerId, status, rejectionReason }; });
    await appRouter.createCaller(context("admin")).listings.review({ id: 13, status: "rejected", rejectionReason: "المعلومات ناقصة" });
    expect(state).toMatchObject({ id: 13, reviewerId: 7, status: "rejected", rejectionReason: "المعلومات ناقصة" });
  });
});
