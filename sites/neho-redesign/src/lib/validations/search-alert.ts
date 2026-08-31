import { z } from "zod";

export const searchAlertSchema = z.object({
  email: z.string().trim().email().max(180),
  website: z.string().max(0).optional().or(z.literal("")),
});

export type SearchAlertInput = z.infer<typeof searchAlertSchema>;

export const visitRequestSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(180),
  phone: z.string().trim().min(6).max(30),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
  propertySlug: z.string().trim().min(1).max(200),
  website: z.string().max(0).optional().or(z.literal("")),
});

export type VisitRequestInput = z.infer<typeof visitRequestSchema>;
