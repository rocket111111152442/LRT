import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Indiquez votre nom.").max(120),
  email: z.string().trim().email("Adresse e-mail invalide."),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  subject: z.string().trim().min(2).max(160),
  message: z.string().trim().min(10, "Votre message est un peu court.").max(4000),
  agency: z.enum(["lausanne", "rolle", "lonay"]).optional(),
  website: z.string().max(0, "Champ invalide.").optional().or(z.literal("")),
  renderedAt: z.number().optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
