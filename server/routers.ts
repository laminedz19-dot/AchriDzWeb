import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createListing, getApprovedListingById, getApprovedListings, getListingsBySeller, getPendingListings, reviewListing, verifyListingPayment } from "./db";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  return next({ ctx });
});

const listingInput = z.object({
  title: z.string().min(3).max(180),
  description: z.string().min(10),
  price: z.number().int().nonnegative(),
  city: z.string().min(2).max(100),
  category: z.string().min(2).max(100),
  condition: z.string().min(2).max(100),
  imageUrl: z.string().url().optional(),
  paymentReference: z.string().min(3).max(120),
  paymentProofUrl: z.string().url(),
});

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  listings: router({
    approved: publicProcedure.query(() => getApprovedListings()),
    detail: publicProcedure.input(z.object({ id: z.number().int().positive() })).query(async ({ input }) => {
      const listing = await getApprovedListingById(input.id);
      return listing?.status === "approved" ? listing : null;
    }),
    mine: protectedProcedure.query(({ ctx }) => getListingsBySeller(ctx.user.id)),
    create: protectedProcedure.input(listingInput).mutation(({ ctx, input }) => createListing({ ...input, sellerId: ctx.user.id, imageUrl: input.imageUrl ?? null, paymentStatus: "pending_verification" })),
    pending: adminProcedure.query(() => getPendingListings()),
    verifyPayment: adminProcedure.input(z.object({ id: z.number().int().positive(), paymentStatus: z.enum(["verified", "rejected"]) })).mutation(({ ctx, input }) => verifyListingPayment(input.id, ctx.user.id, input.paymentStatus)),
    review: adminProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["approved", "rejected"]), rejectionReason: z.string().max(500).optional() }).superRefine((value, ctx) => { if (value.status === "rejected" && !value.rejectionReason?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["rejectionReason"], message: "Rejection reason is required" }); })).mutation(async ({ ctx, input }) => { if (input.status === "approved") { const listing = await getApprovedListingById(input.id); if (listing?.paymentStatus !== "verified") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Verify payment before approving this listing" }); } return reviewListing(input.id, ctx.user.id, input.status, input.rejectionReason); }),
  }),
});

export type AppRouter = typeof appRouter;
