import { Archivo, Newsreader } from "next/font/google";

export const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-sans-family",
  display: "swap",
});

export const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-serif-family",
  display: "swap",
});
