import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(180),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  subject: z.string().trim().min(2).max(120),
  message: z.string().trim().min(10).max(4000),
  // Champ honeypot : doit rester vide. Rempli => probablement un robot.
  website: z.string().max(0).optional().or(z.literal("")),
  // Horodatage d'affichage du formulaire, pour détecter une soumission trop rapide.
  renderedAt: z.number().optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
