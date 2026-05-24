"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, AlertCircle, FileText, Loader2 } from "lucide-react";
import { acceptContract } from "@/app/actions/contractActions";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Props {
  sponsorId: string;
  sponsorName: string;
  packageType: string;
  iznos: number | null;
  contactName: string | null;
  acceptedAt: string | null;
  acceptedBy: string | null;
  userEmail: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatHrDate(date: Date): string {
  const months = [
    "siječnja", "veljače", "ožujka", "travnja", "svibnja", "lipnja",
    "srpnja", "kolovoza", "rujna", "listopada", "studenog", "prosinca",
  ];
  return `${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()}. godine`;
}

function formatEur(amount: number): string {
  return (
    amount.toLocaleString("hr-HR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " €"
  );
}

// ─── Benefits per package ───────────────────────────────────────────────────

function getBenefits(packageType: string): string[] {
  switch (packageType) {
    case "Brončani":
      return [
        "Isticanje logotipa ili naziva Partnera na promotivnim materijalima Konferencije. Promotivni materijali uključit će web stranicu konferencije u sekciji Brončani sponzori.",
        "Mogućnost korištenja standardnog izlagačkog štanda na konferenciji. Dimenzije štanda su 100 (d) × 50 (š) cm. Letke i promotivne materijale za štand dužan je osigurati Partner. Organizator se obavezuje poslati upute za pripremu materijala do 1.9.2026., a Partner se obavezuje informacije dostaviti do 14.9.2026. godine.",
        "Rollup u prostoru EXPO (dimenzije 85 × 200 cm, osigurava Partner).",
        "Mogućnost korištenja do 2 (dvije) VIP kotizacije za potrebe Partnera. Točnu informaciju o tome tko će koristiti kotizacije, ugovorne strane će se naknadno usuglasiti putem emaila.",
      ];
    case "Srebrni":
      return [
        "Isticanje logotipa ili naziva Partnera na promotivnim materijalima Konferencije. Promotivni materijali uključit će: photowall, akreditacije (minimalna naklada 400 kom), web stranica konferencije u sekciji Srebrni sponzori.",
        "Uvodno predavanje na drugoj pozornici u trajanju od 25 minuta.",
        "Mogućnost korištenja velikog promotivnog štanda na konferenciji. Dimenzije štanda su 200 (d) × 100 (v) × 50 (š) cm, a Partner ima 4 kvadratna metra prostora. Dvije stolice i izlagački stol dužan je osigurati Organizator. Letke i promotivne materijale za štand dužan je osigurati Partner. Organizator se obavezuje poslati upute za pripremu materijala za izlagački štand do 1.9.2026., a Partner se obavezuje informacije dostaviti do 14.9.2026. godine.",
        "Isticanje logotipa Partnera ili logotipa usluge Partnera na photowallu izloženom na Konferenciji, za cijelo vrijeme trajanja Konferencije.",
        "Isticanje logotipa Partnera na akreditacijama konferencije (minimalna naklada 400 kom).",
        "Mogućnost korištenja do 3 (tri) VIP kotizacije za potrebe Partnera. Točnu informaciju o tome tko će koristiti kotizacije, ugovorne strane će se naknadno usuglasiti putem emaila.",
        "Mogućnost dodavanja letaka i/ili sličnog promotivnog materijala za uslugu Partnera u goodie bag vrećice. Minimalni broj letaka i/ili sličnog promotivnog materijala koje Partner treba osigurati je 400 komada.",
        "PR članak na web stranici konferencije.",
        "Promocija u eCommerce Magazinu koji će se dijeliti na konferenciji (1 stranica u Magazinu).",
      ];
    case "Zlatni":
      return [
        "Isticanje logotipa ili naziva Partnera na svim promotivnim materijalima Konferencije. Promotivni materijali uključit će: photowall, akreditacije (minimalna naklada 400 kom), web stranica konferencije u sekciji Zlatni sponzori.",
        "Video promocija na glavnoj pozornici Konferencije.",
        "Prezentacija ili korištenje VIP prostora na glavnoj pozornici.",
        "Mogućnost korištenja velikog promotivnog štanda na konferenciji. Dimenzije štanda su 200 (d) × 100 (v) × 50 (š) cm, a Partner ima 4 kvadratna metra prostora. Dvije stolice i izlagački stol dužan je osigurati Organizator. Letke i promotivne materijale za štand dužan je osigurati Partner. Organizator se obavezuje poslati upute za pripremu materijala za izlagački štand do 1.9.2026., a Partner se obavezuje informacije dostaviti do 14.9.2026. godine.",
        "Isticanje logotipa Partnera ili logotipa usluge Partnera na photowallu izloženom na Konferenciji, za cijelo vrijeme trajanja Konferencije.",
        "Isticanje logotipa Partnera na akreditacijama konferencije (minimalna naklada 400 kom).",
        "Mogućnost korištenja do 4 (četiri) VIP kotizacije za potrebe Partnera. Točnu informaciju o tome tko će koristiti kotizacije, ugovorne strane će se naknadno usuglasiti putem emaila.",
        "Mogućnost dodavanja letaka i/ili sličnog promotivnog materijala za uslugu Partnera u goodie bag vrećice. Minimalni broj letaka i/ili sličnog promotivnog materijala koje Partner treba osigurati je 400 komada.",
        "PR članak na web stranici konferencije.",
        "Promocija u newsletteru eCommerce Hrvatska.",
        "Promocija u eCommerce Magazinu koji će se dijeliti na konferenciji (3 stranice u Magazinu).",
      ];
    case "Glavni":
      return [
        "Naziv „Powered by“ na Konferenciji – ekskluzivno pozicioniranje brenda Partnera kao glavnog pokrovitelja CRO COMMERCE 2026.",
        "Isticanje logotipa ili naziva Partnera na svim promotivnim materijalima Konferencije. Promotivni materijali uključit će: photowall, akreditacije (minimalna naklada 400 kom), web stranica konferencije u sekciji Glavni sponzor.",
        "Keynote izlaganje na glavnoj pozornici Konferencije.",
        "Video promocija na glavnoj pozornici konferencije.",
        "Mogućnost korištenja velikog promotivnog štanda s osvjetljenim lightboxom na konferenciji. Dimenzije štanda su 200 (d) × 100 (v) × 50 (š) cm, a Partner ima 4 kvadratna metra prostora. Dvije stolice i izlagački stol dužan je osigurati Organizator. Letke i promotivne materijale za štand dužan je osigurati Partner. Organizator se obavezuje poslati upute za pripremu materijala za izlagački štand do 1.9.2026., a Partner se obavezuje informacije dostaviti do 14.9.2026. godine.",
        "Rollup u prostoru EXPO.",
        "Isticanje logotipa Partnera na photowallu, za cijelo vrijeme trajanja Konferencije.",
        "Isticanje logotipa Partnera na akreditacijama konferencije (minimalna naklada 400 kom).",
        "Mogućnost korištenja do 6 (šest) VIP kotizacija za potrebe Partnera. Točnu informaciju o tome tko će koristiti kotizacije, ugovorne strane će se naknadno usuglasiti putem emaila.",
        "Mogućnost dodavanja letaka i/ili sličnog promotivnog materijala u goodie bag vrećice. Minimalni broj letaka koje Partner treba osigurati je 400 komada.",
        "PR članak na web stranici konferencije.",
        "Promocija u newsletteru eCommerce Hrvatska.",
        "Promocija u eCommerce Magazinu koji će se dijeliti na konferenciji (3 stranice + naslovnica Magazina).",
        "Premium članstvo u Udruzi eCommerce Hrvatska za 2026. godinu (vrijednost 1.500 € uključena u paket).",
      ];
    default:
      return [
        "Benefiti i uvjeti suradnje definirani su posebnim dogovorom između Partnera i Organizatora.",
      ];
  }
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function PortalContractView({
  sponsorId,
  sponsorName,
  packageType,
  iznos,
  contactName,
  acceptedAt,
  acceptedBy,
  userEmail,
}: Props) {
  const router = useRouter();
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localAcceptedAt, setLocalAcceptedAt] = useState(acceptedAt);
  const [localAcceptedBy, setLocalAcceptedBy] = useState(acceptedBy);

  const isAccepted = !!localAcceptedAt;
  const acceptedDate = localAcceptedAt ? new Date(localAcceptedAt) : null;
  const halfAmount = iznos ? iznos / 2 : null;
  const benefits = getBenefits(packageType);

  async function handleAccept() {
    setAccepting(true);
    setError(null);
    const { error: err } = await acceptContract(sponsorId);
    if (err) {
      setError(err);
      setAccepting(false);
      return;
    }
    const now = new Date().toISOString();
    setLocalAcceptedAt(now);
    setLocalAcceptedBy(userEmail);
    setAccepting(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {/* ── Status banner ── */}
      {isAccepted ? (
        <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-800 text-sm">Ugovor prihvaćen</p>
            <p className="text-xs text-green-700 mt-0.5">
              Prihvatio/la:{" "}
              <strong>{localAcceptedBy}</strong>
              {acceptedDate && (
                <>
                  {" "}·{" "}
                  {acceptedDate.toLocaleDateString("hr-HR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  u{" "}
                  {acceptedDate.toLocaleTimeString("hr-HR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </>
              )}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertCircle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 text-sm">Ugovor čeka prihvaćanje</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Molimo pročitajte ugovor u nastavku i potvrdite prihvaćanje klikom na gumb na dnu stranice.
            </p>
          </div>
        </div>
      )}

      {/* ── Contract document ── */}
      <div className="card overflow-hidden">
        {/* Document header */}
        <div className="bg-gray-50 border-b border-gray-100 px-6 py-6 text-center">
          <FileText size={28} className="text-gray-300 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-900 tracking-widest uppercase">Ugovor</h2>
          <h3 className="text-base font-semibold text-gray-500 mt-0.5 tracking-wide uppercase">
            o suradnji
          </h3>
        </div>

        {/* Contract body */}
        <div className="px-6 py-6 space-y-6 text-sm text-gray-700 leading-relaxed">
          {/* Parties */}
          <section className="space-y-4">
            <p className="text-center font-medium text-gray-600">sklopljen između:</p>

            <div className="space-y-4 bg-gray-50 rounded-xl p-4">
              <p>
                <strong>{sponsorName}</strong>
                {contactName ? (
                  <span>
                    {" "}(dalje u tekstu: „<strong>Partner</strong>"), kojeg zastupa {contactName}.
                  </span>
                ) : (
                  <span> (dalje u tekstu: „<strong>Partner</strong>")</span>
                )}
              </p>

              <p className="text-center text-gray-400 text-xs font-semibold uppercase tracking-widest">
                i
              </p>

              <p>
                <strong>ECOMMERCE d.o.o.</strong> sa sjedištem u Murskom Središću, Selska 1,
                osobni identifikacijski broj (OIB): 09726338816 (dalje u tekstu:{" "}
                „<strong>Organizator</strong>"), kojeg zastupa direktor Marcel Majsan.
              </p>
            </div>

            <p className="text-center text-xs text-gray-400">
              (Partner i Organizator dalje u tekstu zajedno: „Ugovorne strane")
            </p>

            {isAccepted && acceptedDate && (
              <p className="text-center text-gray-600">
                u Zagrebu, {formatHrDate(acceptedDate)}
              </p>
            )}
          </section>

          <hr className="border-gray-100" />

          {/* Article 1 — Predmet */}
          <section className="space-y-3">
            <div className="text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Predmet ugovora
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">Članak 1.</p>
            </div>

            <p>
              <strong>1.1</strong> Ugovorne strane suglasno utvrđuju da se ovaj Ugovor o
              sponzorstvu sklapa radi sponzoriranja konferencije pod nazivom{" "}
              <strong>CRO COMMERCE 2026</strong> koja će se održati{" "}
              <strong>13.10.2026. godine</strong> u Zagrebu, Mozaik Event Centar (u daljnjem
              tekstu: Konferencija), u organizaciji Organizatora.
            </p>

            <p>
              <strong>1.2.</strong> Potpisom ovog Ugovora Partner se obvezuje Organizatoru:
            </p>

            {halfAmount ? (
              <ul className="space-y-3 pl-2">
                <li className="flex gap-2.5">
                  <span className="text-gray-400 flex-shrink-0">—</span>
                  <span>
                    po dospijeću prvog računa (14 dana) izdanog u{" "}
                    <strong>veljači 2026.</strong> od strane Organizatora uplatiti iznos od{" "}
                    <strong>{formatEur(halfAmount)} + PDV</strong> na račun Organizatora
                    broj: <strong>HR6723400091111116175</strong>, otvoren u Privrednoj banci
                    Zagreb d.d.
                  </span>
                </li>
                <li className="flex gap-2.5">
                  <span className="text-gray-400 flex-shrink-0">—</span>
                  <span>
                    po dospijeću drugog računa (14 dana) izdanog u{" "}
                    <strong>rujnu 2026.</strong> od strane Organizatora uplatiti iznos od{" "}
                    <strong>{formatEur(halfAmount)} + PDV</strong> na račun Organizatora
                    broj: <strong>HR6723400091111116175</strong>, otvoren u Privrednoj banci
                    Zagreb d.d.
                  </span>
                </li>
              </ul>
            ) : (
              <p className="pl-4 text-gray-400 italic text-xs">
                Iznos sponzorstva nije definiran — kontaktirajte Organizatora na{" "}
                <a
                  href="mailto:konferencija@ecommerce.hr"
                  className="text-brand-600 hover:underline"
                >
                  konferencija@ecommerce.hr
                </a>
                .
              </p>
            )}
          </section>

          <hr className="border-gray-100" />

          {/* Article 2 — Obveze Organizatora */}
          <section className="space-y-3">
            <div className="text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Obveze Organizatora
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">Članak 2.</p>
            </div>

            <p>
              <strong>2.1</strong> U realizaciji predmeta Ugovora iz članka 1. ovog Ugovora,
              Organizator se obvezuje Partneru kroz Konferenciju omogućiti:
            </p>

            <ul className="space-y-2.5 pl-1">
              {benefits.map((benefit, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="text-brand-400 flex-shrink-0 mt-0.5">•</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </section>

          <hr className="border-gray-100" />

          {/* Article 3 — Stupanje na snagu */}
          <section className="space-y-3">
            <div className="text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Stupanje na snagu
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">Članak 3.</p>
            </div>
            <p>
              <strong>3.1.</strong> U znak prihvata prava i obveza iz ovog Ugovora, Partner
              potvrđuje prihvaćanje digitalnim putem.
            </p>
            <p>
              <strong>3.2.</strong> Ugovor stupa na snagu danom digitalnog prihvaćanja od
              strane Partnera.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* Article 4 — Sporovi */}
          <section className="space-y-3">
            <div className="text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Rješavanje sporova
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">Članak 4.</p>
            </div>
            <p>
              <strong>4.1.</strong> Ovaj ugovor Ugovorne strane sklapaju u dobroj vjeri i
              nastojat će sve sporove riješiti mirnim putem.
            </p>
            <p>
              <strong>4.2.</strong> U slučaju da Ugovorne strane ne uspiju mirnim putem
              riješiti spor, ugovaraju nadležnost stvarno nadležnog suda u Zagrebu.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* Article 5 — Završne odredbe */}
          <section className="space-y-3">
            <div className="text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Završne odredbe
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">Članak 5.</p>
            </div>
            <p>
              <strong>5.1.</strong> Ugovorne strane su ovaj Ugovor pročitale i razumjele te
              ga kao izraz svoje stvarne i prave volje prihvaćaju.
            </p>
            <p>
              <strong>5.2.</strong> Digitalno prihvaćanje ugovora od strane ovlaštene osobe
              Partnera ima jednaku pravnu snagu kao i vlastoručni potpis.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* Signature area */}
          <div className="grid grid-cols-2 gap-6 pt-2">
            {/* Partner */}
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
                {sponsorName}
              </p>
              {isAccepted && acceptedDate ? (
                <div>
                  <div className="border-b-2 border-green-400 pb-2 mb-2 flex items-center gap-1.5">
                    <CheckCircle size={13} className="text-green-500" />
                    <span className="text-sm font-semibold text-green-700">
                      Digitalno prihvaćeno
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{localAcceptedBy}</p>
                  <p className="text-xs text-gray-400">
                    {acceptedDate.toLocaleDateString("hr-HR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              ) : (
                <div className="border-b-2 border-dashed border-gray-200 pb-5">
                  <p className="text-xs text-gray-400 italic">Čeka prihvaćanje</p>
                </div>
              )}
            </div>

            {/* Organizer */}
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
                ECOMMERCE d.o.o.
              </p>
              <div className="border-b-2 border-gray-200 pb-2 mb-2">
                <p className="text-sm font-semibold text-gray-700">Marcel Majsan</p>
              </div>
              <p className="text-xs text-gray-500">direktor</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Accept button ── */}
      {!isAccepted && (
        <div className="card p-5 space-y-3">
          <p className="text-sm text-gray-600">
            Potvrdom prihvaćate sve uvjete ugovora navedene gore. Vaš email (
            <strong>{userEmail}</strong>) i datum prihvaćanja bit će trajno zabilježeni.
          </p>
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              <AlertCircle size={13} />
              {error}
            </div>
          )}
          <button
            onClick={handleAccept}
            disabled={accepting}
            className="btn-primary w-full justify-center"
          >
            {accepting ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Potvrđivanje…
              </>
            ) : (
              <>
                <CheckCircle size={15} /> Prihvaćam ugovor o suradnji
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
