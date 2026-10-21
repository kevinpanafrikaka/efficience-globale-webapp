import { Fraunces, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import "./buttons.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata = {
  applicationName: "Efficience Globale",
  appleWebApp: { title: "Efficience Globale" },
  title: {
    default: "Efficience Globale — Cabinet de conseil en stratégie, Conakry",
    template: "%s — Efficience Globale",
  },
  description:
    "Efficience Globale accompagne institutions publiques, bailleurs internationaux et entreprises en Afrique de l'Ouest à travers la gouvernance, la digitalisation et l'intelligence artificielle.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#16211a" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="fr"
      className={`${fraunces.variable} ${sourceSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
