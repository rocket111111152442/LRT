import { z } from "zod";

export const estimationSchema = z.object({
  propertyType: z.enum(["maison", "appartement", "immeuble", "terrain", "autre"]),
  method: z.enum(["en-vrai", "en-visio", "en-ligne"]),
  locality: z.string().trim().min(2, "Indiquez une localité.").max(120),
  rooms: z.string().trim().max(20).optional().or(z.literal("")),
  surface: z.string().trim().max(20).optional().or(z.literal("")),
  projectTiming: z.enum(["moins-3-mois", "3-6-mois", "6-12-mois", "sans-projet-precis"]),
  name: z.string().trim().min(2, "Indiquez votre nom.").max(120),
  email: z.string().trim().email("Adresse e-mail invalide."),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  website: z.string().max(0, "Champ invalide.").optional().or(z.literal("")),
  renderedAt: z.number().optional(),
});

export type EstimationInput = z.infer<typeof estimationSchema>;
