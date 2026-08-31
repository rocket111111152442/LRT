import { z } from "zod";

export const visitRequestSchema = z.object({
  propertySlug: z.string().trim().min(1).max(160),
  propertyTitle: z.string().trim().min(1).max(200),
  name: z.string().trim().min(2, "Indiquez votre nom.").max(120),
  email: z.string().trim().email("Adresse e-mail invalide."),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  website: z.string().max(0, "Champ invalide.").optional().or(z.literal("")),
  renderedAt: z.number().optional(),
});

export type VisitRequestInput = z.infer<typeof visitRequestSchema>;
