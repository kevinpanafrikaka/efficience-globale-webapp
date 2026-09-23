export default function ContactForm({ compact = false }) {
  return (
    <form className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
          <label htmlFor="nom" className="text-[13px] font-semibold text-dark">
            Nom
          </label>
          <input
            id="nom"
            name="nom"
            type="text"
            autoComplete="name"
            required
            className="rounded-lg border border-line px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-lime"
          />
        </div>
        <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
          <label htmlFor="email" className="text-[13px] font-semibold text-dark">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="rounded-lg border border-line px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-lime"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="sujet" className="text-[13px] font-semibold text-dark">
          Sujet
        </label>
        <input
          id="sujet"
          name="sujet"
          type="text"
          className="rounded-lg border border-line px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-lime"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-[13px] font-semibold text-dark">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={compact ? 4 : 5}
          required
          className="rounded-lg border border-line px-3.5 py-2.5 text-[15px] resize-none focus:outline-none focus:ring-2 focus:ring-lime"
        />
      </div>
      <button
        type="submit"
        className="mt-1 inline-flex items-center justify-center rounded bg-lime px-6 py-3.5 text-[15px] font-semibold text-ink active:scale-[0.97] transition-transform"
      >
        Envoyer le message
      </button>
      <p className="text-[12.5px] text-ink-faint">
        Vous pouvez aussi écrire directement à{" "}
        <a href="mailto:oumar.camara@efficienceglobale.com" className="text-dark-2 font-medium">
          oumar.camara@efficienceglobale.com
        </a>
      </p>
    </form>
  );
}
