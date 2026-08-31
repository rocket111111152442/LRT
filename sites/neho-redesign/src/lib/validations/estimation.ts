import { z } from "zod";

export const estimationSchema = z.object({
  address: z.string().trim().min(3, "Adresse ou commune requise").max(200),
  propertyType: z.enum(["appartement", "maison", "villa", "immeuble", "terrain"]),
  surface: z.coerce.number().int().min(10).max(2000),
  rooms: z.coerce.number().min(1).max(30),
  yearBuilt: z.coerce
    .number()
    .int()
    .min(1800)
    .max(new Date().getFullYear() + 2),
  condition: z.enum(["neuf", "bon", "a-rafraichir", "travaux"]),
  landSurface: z.coerce.number().min(0).max(100000).optional(),
  parkingSpaces: z.coerce.number().int().min(0).max(20),
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(180),
  phone: z.string().trim().min(6).max(30),
  appointmentPreference: z.enum(["matin", "apres-midi", "soir", "email"]),
  website: z.string().max(0).optional().or(z.literal("")),
  renderedAt: z.number().optional(),
});

export type EstimationInput = z.infer<typeof estimationSchema>;

/** Un seul schéma par étape, pour valider progressivement l'assistant. */
export const estimationStepSchemas = [
  estimationSchema.pick({ address: true }),
  estimationSchema.pick({ propertyType: true }),
  estimationSchema.pick({ surface: true }),
  estimationSchema.pick({ rooms: true }),
  estimationSchema.pick({ yearBuilt: true }),
  estimationSchema.pick({ condition: true }),
  estimationSchema.pick({ landSurface: true, parkingSpaces: true }),
  estimationSchema.pick({ fullName: true, email: true, phone: true }),
  estimationSchema.pick({ appointmentPreference: true }),
] as const;
