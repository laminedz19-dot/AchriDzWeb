import { describe, expect, it } from "vitest";
import { getAdminDestination } from "../client/src/pages/AdminLogin";

describe("admin login routing", () => {
  it("sends admins to the dashboard", () => {
    expect(getAdminDestination({ role: "admin" })).toBe("/admin");
  });

  it("keeps regular users out of admin", () => {
    expect(getAdminDestination({ role: "user" })).toBe("/");
  });

  it("keeps guests on the admin login page", () => {
    expect(getAdminDestination(null)).toBe("/admin/login");
  });
});
