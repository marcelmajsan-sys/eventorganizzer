// Kodovi za popust na ulaznice (20%) koje partneri dijele svojim klijentima.
// Hardkodirana tablica (rujan 2026) — matching po podstringu naziva partnera
// (case-insensitive), jer se nazivi u bazi razlikuju od marketinških naziva
// (npr. "Pickpack (euShipments Croatia)" → EUSHIPMENTS20).
const DISCOUNT_CODES: { code: string; match: string[] }[] = [
  { code: "2FORGE20", match: ["2forge"] },
  { code: "AGILO20", match: ["agilo"] },
  { code: "ALEPH20", match: ["aleph"] },
  { code: "BES20", match: ["balkan ecommerce"] },
  { code: "BOXNOW20", match: ["boxnow"] },
  { code: "CEWE20", match: ["cewe"] },
  { code: "CHATNAV20", match: ["chatnav"] },
  { code: "COCACOLA20", match: ["coca cola", "cocacola"] },
  { code: "FASTSERVER20", match: ["fastserver", "impero"] },
  { code: "HISENSE20", match: ["hisense"] },
  { code: "INFONETWORK20", match: ["info network", "infonetwork"] },
  { code: "INTIME20", match: ["in time", "intime"] },
  { code: "LESNINA20", match: ["lesnina"] },
  { code: "LOVIN20", match: ["lovin"] },
  { code: "LUMER20", match: ["lumer"] },
  // NE samo "mall" — dovoljno specifično samo s ".hr"
  { code: "MALL20", match: ["mall.hr"] },
  { code: "METAKOCKA20", match: ["metakocka"] },
  { code: "NOCAPP20", match: ["nocapp"] },
  { code: "SALESSNAP20", match: ["sales snap", "salessnap"] },
  { code: "SIRVIS20", match: ["sirvis"] },
  // "viva" NE smije uhvatiti "Vivnetworks" — vivnetworks ne sadrži "viva", ali
  // VIVNETWORKS20 unos dolazi prije po specifičnosti radi sigurnosti
  { code: "VIVNETWORKS20", match: ["vivnetworks"] },
  { code: "VIVA20", match: ["viva"] },
  { code: "WOLT20", match: ["wolt"] },
  { code: "XEXPRESS20", match: ["x express", "x-express", "xexpress"] },
  { code: "DECTA20", match: ["decta"] },
  { code: "DHL20", match: ["dhl"] },
  { code: "DPD20", match: ["dpd"] },
  { code: "ECOMMSERBIA20", match: ["ecommserbia", "asocijacija srbije"] },
  { code: "EUSHIPMENTS20", match: ["eushipments"] },
  { code: "GLS20", match: ["gls"] },
  { code: "HEROFACTORY20", match: ["herofactory", "hero factory"] },
  { code: "INCHOO20", match: ["inchoo"] },
  { code: "JEFTINIJE20", match: ["jeftinije"] },
  { code: "LLOYDS20", match: ["lloyds"] },
  { code: "MANAGOAI20", match: ["manago"] },
  { code: "MARKER20", match: ["marker"] },
  // NE samo "mbe" — hvatalo bi i "Bloomberg Adria" (Bloo-mbe-rg)
  { code: "MBE20", match: ["mbe hrvatska"] },
  { code: "MERAXES20", match: ["meraxes"] },
  { code: "MONRI20", match: ["monri"] },
  { code: "PLUS20", match: ["plus.hr"] },
  { code: "SELECTBOX20", match: ["selectbox"] },
  { code: "SEYFOR20", match: ["seyfor"] },
  { code: "SHIPSHAPE20", match: ["shipshape"] },
  { code: "ZOYYA20", match: ["zoyya"] },
];

/** Vrati kod za popust za partnera po nazivu, ili null ako partner nema kod. */
export function getTicketDiscountCode(sponsorName: string | null | undefined): string | null {
  const n = (sponsorName || "").toLowerCase();
  if (!n) return null;
  for (const entry of DISCOUNT_CODES) {
    if (entry.match.some((m) => n.includes(m))) return entry.code;
  }
  return null;
}
