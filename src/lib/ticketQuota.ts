// Limit ulaznica partnera definiran je NJEGOVIM benefitima (sponsor_benefits),
// ne globalno po paketu. Benefit se računa kao "ulaznički" ako naziv sadrži
// ulaznic/kotizacij/ticket; broj = prva znamenka u nazivu (bez broja = 1);
// VIP u nazivu → VIP kvota, inače standard. Primjeri: "2 VIP ulaznice",
// "5 kotizacija", "3 regular tickets". null = partner nema taj tip u benefitima.

export type TicketQuota = { vip: number | null; standard: number | null };

const TICKET_BENEFIT_RE = /ulaznic|kotizacij|ticket/i;

export function parseTicketQuota(
  benefitNames: (string | null | undefined)[]
): TicketQuota {
  let vip: number | null = null;
  let standard: number | null = null;

  benefitNames.forEach((raw) => {
    const name = raw ?? "";
    if (!TICKET_BENEFIT_RE.test(name)) return;
    const numMatch = name.match(/\d+/);
    const count = numMatch ? parseInt(numMatch[0], 10) : 1;
    if (/vip/i.test(name)) vip = (vip ?? 0) + count;
    else standard = (standard ?? 0) + count;
  });

  return { vip, standard };
}
