import { Lexend, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: ["500", "700", "800"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata = {
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

export default function RootLayout({ children, modal }) {
  return (
    <html
      lang="fr"
      className={`${lexend.variable} ${sourceSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        {modal}
      </body>
    </html>
  );
}
