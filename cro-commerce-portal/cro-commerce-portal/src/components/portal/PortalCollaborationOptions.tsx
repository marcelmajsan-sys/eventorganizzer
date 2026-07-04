import { Check, X, Mail } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import type { TRANSLATIONS } from "@/lib/i18n/portal";

type TKey = keyof typeof TRANSLATIONS["hr"];

type Cell = true | false | TKey; // cell is either bool or a translation key

interface PackageDef {
  name: string;      // izvorni HR naziv — za usporedbu s currentPackage iz baze
  nameKey: TKey;    // prijevod naziva
  slots: string;
  price: string;
}

const PACKAGES: PackageDef[] = [
  { name: "Brončani", nameKey: "pkg.Brončani", slots: "max 30",           price: "2.500 €"  },
  { name: "Srebrni",  nameKey: "pkg.Srebrni",  slots: "max 8",            price: "6.000 €"  },
  { name: "Zlatni",   nameKey: "pkg.Zlatni",   slots: "max 4",            price: "10.000 €" },
  { name: "Glavni",   nameKey: "pkg.Glavni",   slots: "options.reserved", price: "16.500 €" },
];

interface CategoryDef {
  labelKey: TKey;
  rows: { labelKey: TKey; values: Cell[] }[];
}

const CATEGORIES: CategoryDef[] = [
  {
    labelKey: "cat.tickets",
    rows: [
      { labelKey: "row.vipTickets", values: ["cell.vip2", "cell.vip3", "cell.vip5", "cell.vip10"] },
    ],
  },
  {
    labelKey: "cat.expo",
    rows: [
      { labelKey: "row.standardStand", values: [true,  false, false, false] },
      { labelKey: "row.largeStand",    values: [false, true,  true,  true]  },
      { labelKey: "row.lightbox",      values: [false, false, false, true]  },
      { labelKey: "row.rollup",        values: [true,  true,  true,  true]  },
    ],
  },
  {
    labelKey: "cat.branding",
    rows: [
      { labelKey: "row.logoPromo",  values: [true,              true, true, true] },
      { labelKey: "row.goodieBag",  values: ["cell.goodiePlus", true, true, true] },
      { labelKey: "row.logoPhoto",  values: [false, true, true, true] },
      { labelKey: "row.logoAccred", values: [false, true, true, true] },
    ],
  },
  {
    labelKey: "cat.digital",
    rows: [
      { labelKey: "row.prArticle",   values: [false, true,           true,           true]                  },
      { labelKey: "row.newsletter",  values: [false, false,          true,           true]                  },
      { labelKey: "row.magazineAd",  values: [false, "cell.page1",   "cell.page3",   "cell.page3cover"]     },
    ],
  },
  {
    labelKey: "cat.stage",
    rows: [
      { labelKey: "row.videoMain",      values: [false, false, true,  true]              },
      { labelKey: "row.presentSecond",  values: [false, true,  false, true]              },
      { labelKey: "row.presentMain",    values: [false, false, true,  "cell.keynote"]    },
      { labelKey: "row.premiumMember",  values: [false, false, false, true]              },
      { labelKey: "row.poweredBy",      values: [false, false, false, true]              },
    ],
  },
];

function CellContent({
  value,
  isCurrent,
  t,
}: {
  value: Cell;
  isCurrent: boolean;
  t: (key: TKey) => string;
}) {
  if (value === true) {
    return (
      <span className="flex justify-center">
        <Check size={17} className="text-green-500" strokeWidth={2.5} />
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="flex justify-center">
        <X size={15} className="text-gray-300" strokeWidth={2} />
      </span>
    );
  }
  return (
    <span className={`text-xs font-medium leading-snug ${isCurrent ? "text-green-700" : "text-gray-600"}`}>
      {t(value)}
    </span>
  );
}

interface Props {
  currentPackage?: string;
}

export default function PortalCollaborationOptions({ currentPackage }: Props = {}) {
  const { t } = useLang();

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 text-base mb-0.5">
          {t("options.title")}
        </h3>
        <p className="text-sm text-gray-500 mb-5 whitespace-pre-line">
          {t("options.subtitle")}
        </p>

        <div className="overflow-x-auto -mx-5 px-5">
          <div className="min-w-[580px]">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="w-[38%] pb-3 pr-4 text-left align-bottom">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                      {t("options.benefit")}
                    </span>
                  </th>

                  {PACKAGES.map((pkg) => {
                    const isCurrent = !!currentPackage && pkg.name === currentPackage;
                    const slotsText = pkg.slots.startsWith("options.") ? t(pkg.slots as TKey) : pkg.slots;
                    return (
                      <th key={pkg.name} className="w-[15.5%] pb-3 px-1.5 text-center align-bottom">
                        <div className={`rounded-xl p-2.5 ${
                          isCurrent
                            ? "border-2 border-green-500 bg-green-50"
                            : "border border-gray-100 bg-gray-50"
                        }`}>
                          {isCurrent && (
                            <span className="inline-block mb-1.5 text-[9px] font-bold uppercase tracking-widest bg-green-500 text-white rounded-full px-2 py-0.5">
                              {t("options.yourPackage")}
                            </span>
                          )}
                          <p className={`font-bold text-sm leading-tight ${isCurrent ? "text-green-700" : "text-gray-800"}`}>
                            {t(pkg.nameKey)}
                          </p>
                          <p className={`text-[10px] mt-0.5 font-semibold uppercase tracking-wide ${isCurrent ? "text-green-500" : "text-gray-400"}`}>
                            {slotsText}
                          </p>
                          <p className={`text-sm font-bold mt-1.5 ${isCurrent ? "text-green-700" : "text-gray-700"}`}>
                            {pkg.price}
                          </p>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody>
                {CATEGORIES.map((cat) => (
                  <>
                    <tr key={`cat-${cat.labelKey}`} className="bg-gray-50">
                      <td colSpan={5} className="py-2 px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-t border-gray-100">
                        {t(cat.labelKey)}
                      </td>
                    </tr>

                    {cat.rows.map((row, ri) => (
                      <tr key={`${cat.labelKey}-${ri}`} className="border-t border-gray-100 hover:bg-gray-50/60 transition-colors">
                        <td className="py-3 pr-4 text-gray-700 text-sm leading-snug">
                          {t(row.labelKey)}
                        </td>
                        {row.values.map((val, vi) => {
                          const isCurrent = !!currentPackage && PACKAGES[vi].name === currentPackage;
                          return (
                            <td
                              key={vi}
                              className={`py-3 px-1.5 text-center align-middle ${isCurrent ? "bg-green-50/50" : ""}`}
                            >
                              <CellContent value={val} isCurrent={isCurrent} t={t} />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card p-6 text-center">
        <p className="text-sm font-medium text-gray-700 mb-3">
          {t("options.ctaText")}
        </p>
        <a
          href="mailto:konferencija@ecommerce.hr?subject=Upit%20za%20nadogradnju%20paketa"
          className="inline-flex items-center gap-2 btn-primary text-sm"
        >
          <Mail size={14} />
          konferencija@ecommerce.hr
        </a>
      </div>
    </div>
  );
}
