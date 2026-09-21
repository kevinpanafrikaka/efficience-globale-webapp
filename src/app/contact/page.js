import ContactForm from "@/components/ContactForm";

export const metadata = {
  title: "Contact",
  description: "Discutons de votre prochain projet avec Efficience Globale — gouvernance, digitalisation, intelligence artificielle.",
};

// Page complète, affichée quand /contact est ouvert directement (lien partagé,
// résultat de recherche, rechargement de page) plutôt qu'intercepté depuis
// une navigation interne — voir src/app/@modal/(.)contact pour la version modale.
export default function ContactPage() {
  return (
    <section className="max-w-lg mx-auto px-5 md:px-8 py-16 md:py-20">
      <div className="text-lime text-[12.5px] font-bold tracking-wide mb-3.5">CONTACT</div>
      <h1 className="text-[28px] md:text-[34px] mb-4">Discutons de votre prochain projet</h1>
      <p className="text-[15.5px] text-ink-soft mb-9">
        Gouvernance, digitalisation, intelligence artificielle ou renforcement de capacités — parlons de vos
        objectifs.
      </p>
      <ContactForm />
    </section>
  );
}
