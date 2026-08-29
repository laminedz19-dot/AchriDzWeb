import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { isAuthorizedAdmin, ownerShouldBeAdmin } from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function contextWithRole(role: "admin" | "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: role === "admin" ? 1 : 2,
    openId: `${role}-test-user`,
    email: `${role}@example.com`,
    name: role === "admin" ? "Admin" : "User",
    loginMethod: "test",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("listings admin access", () => {
  it("denies pending listings to regular users", async () => {
    const caller = appRouter.createCaller(contextWithRole("user"));
    await expect(caller.listings.pending()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("allows admins to access the moderation queue", async () => {
    const caller = appRouter.createCaller(contextWithRole("admin"));
    await expect(caller.listings.pending()).resolves.toEqual([]);
  });

  it("requires a reason when rejecting an ad", async () => {
    const caller = appRouter.createCaller(contextWithRole("admin"));
    await expect(caller.listings.review({ id: 999999, status: "rejected" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("blocks approval until payment is verified and allows rejection", async () => {
    const caller = appRouter.createCaller(contextWithRole("admin"));
    await expect(caller.listings.review({ id: 999999, status: "approved" })).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
    await expect(caller.listings.review({ id: 999999, status: "rejected", rejectionReason: "صورة الإعلان غير واضحة" })).resolves.toBeUndefined();
  });

  it("promotes only the configured owner openId", () => {
    expect(ownerShouldBeAdmin("owner-123", "owner-123")).toBe(true);
    expect(ownerShouldBeAdmin("user-123", "owner-123")).toBe(false);
    expect(ownerShouldBeAdmin("owner-123", undefined)).toBe(false);
  });

  it("allows only the configured admin email or owner identity", () => {
    expect(isAuthorizedAdmin({ openId: "other", email: "laminedz.19@gmail.com" })).toBe(true);
    expect(isAuthorizedAdmin({ openId: "other", email: "other@example.com" })).toBe(false);
    expect(isAuthorizedAdmin({ openId: "owner-123", email: "other@example.com" })).toBe(false);
  });
});
