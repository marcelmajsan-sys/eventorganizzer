import { Check, X, Mail } from "lucide-react";

type Cell = true | false | string;

interface PackageDef {
  name: string;
  slots: string;
  price: string;
  highlight: boolean;
}

const PACKAGES: PackageDef[] = [
  { name: "Brončani", slots: "max 30",       price: "2.500 €",  highlight: false },
  { name: "Srebrni",  slots: "max 8",        price: "6.000 €",  highlight: false },
  { name: "Zlatni",   slots: "max 4",        price: "10.000 €", highlight: false },
  { name: "Glavni",   slots: "REZERVIRANO",  price: "16.500 €", highlight: true  },
];

interface CategoryDef {
  label: string;
  rows: { label: string; values: Cell[] }[];
}

const CATEGORIES: CategoryDef[] = [
  {
    label: "Ulaznice i prisutnost",
    rows: [
      {
        label: "VIP konferencijske ulaznice",
        values: ["2 VIP ulaznice", "3 VIP ulaznice", "4 VIP ulaznice", "6 VIP ulaznica"],
      },
    ],
  },
  {
    label: "EXPO štand",
    rows: [
      { label: "Standardni štand (100×50 cm)",   values: [true,  false, false, false] },
      { label: "Veliki promo štand (200×50 cm)", values: [false, true,  true,  true]  },
      { label: "Osvjetljeni lightbox",            values: [false, false, false, true]  },
      { label: "Rollup u prostoru EXPO",          values: [true,  true,  true,  true]  },
    ],
  },
  {
    label: "Brendiranje i promocija",
    rows: [
      { label: "Logo na promotivnim materijalima", values: [true,          true, true, true] },
      { label: "Goodie bag promocija",             values: ["+500 € opcija", true, true, true] },
      { label: "Logo na foto zidu",                values: [false, true, true, true] },
      { label: "Logo na akreditacijama",           values: [false, true, true, true] },
    ],
  },
  {
    label: "Digitalna i medijska vidljivost",
    rows: [
      { label: "PR članak na webu",        values: [false, true,         true,         true]               },
      { label: "Newsletter promocija",     values: [false, false,        true,         true]               },
      { label: "eCommerce magazin oglas",  values: [false, "1 stranica", "3 stranice", "3 str. + naslovnica"] },
    ],
  },
  {
    label: "Pozornica i premium",
    rows: [
      { label: "Video promocija na glavnoj pozornici",         values: [false, false, true,  true]           },
      { label: "Prezentacija na sekundarnoj pozornici",        values: [false, true,  false, false]          },
      { label: "Prezentacija / VIP prostor (glavna pozornica)",values: [false, false, true,  "keynote slot"] },
      { label: "Premium članstvo Udruge (1.500 €)",           values: [false, false, false, true]           },
      { label: "Naziv \"Powered by\" na konferenciji",         values: [false, false, false, true]           },
    ],
  },
];

function CellContent({
  value,
  isCurrent,
  isBlue,
}: {
  value: Cell;
  isCurrent: boolean;
  isBlue: boolean;
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
    <span
      className={`text-xs font-medium leading-snug ${
        isCurrent ? "text-green-700" : isBlue ? "text-blue-700" : "text-gray-600"
      }`}
    >
      {value}
    </span>
  );
}

interface Props {
  currentPackage?: string;
}

export default function PortalCollaborationOptions({ currentPackage }: Props = {}) {
  return (
    <div className="space-y-5">
      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 text-base mb-0.5">
          Usporedba paketa sponzorstva
        </h3>
        <p className="text-sm text-gray-500 mb-5">
          Pregled benefita po paketima. Kontaktiraj nas za prilagodbu ili nadogradnju.
        </p>

        {/* Horizontally scrollable wrapper */}
        <div className="overflow-x-auto -mx-5 px-5">
          <div className="min-w-[580px]">
            <table className="w-full border-collapse text-sm">
              {/* ─── Package headers ─── */}
              <thead>
                <tr>
                  {/* Empty label column header */}
                  <th className="w-[38%] pb-3 pr-4 text-left align-bottom">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                      Benefit
                    </span>
                  </th>

                  {PACKAGES.map((pkg) => {
                    const isCurrent = !!currentPackage && pkg.name === currentPackage;
                    return (
                      <th
                        key={pkg.name}
                        className="w-[15.5%] pb-3 px-1.5 text-center align-bottom"
                      >
                        <div
                          className={`rounded-xl p-2.5 ${
                            isCurrent
                              ? "border-2 border-green-500 bg-green-50"
                              : pkg.highlight
                              ? "border-2 border-blue-400 bg-blue-50"
                              : "border border-gray-100 bg-gray-50"
                          }`}
                        >
                          {isCurrent && (
                            <span className="inline-block mb-1.5 text-[9px] font-bold uppercase tracking-widest bg-green-500 text-white rounded-full px-2 py-0.5">
                              Vaš paket
                            </span>
                          )}
                          <p
                            className={`font-bold text-sm leading-tight ${
                              isCurrent
                                ? "text-green-700"
                                : pkg.highlight
                                ? "text-blue-700"
                                : "text-gray-800"
                            }`}
                          >
                            {pkg.name}
                          </p>
                          <p
                            className={`text-[10px] mt-0.5 font-semibold uppercase tracking-wide ${
                              isCurrent
                                ? "text-green-500"
                                : pkg.highlight
                                ? "text-blue-400"
                                : "text-gray-400"
                            }`}
                          >
                            {pkg.slots}
                          </p>
                          <p
                            className={`text-sm font-bold mt-1.5 ${
                              isCurrent
                                ? "text-green-700"
                                : pkg.highlight
                                ? "text-blue-700"
                                : "text-gray-700"
                            }`}
                          >
                            {pkg.price}
                          </p>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {/* ─── Body ─── */}
              <tbody>
                {CATEGORIES.map((cat) => (
                  <>
                    {/* Category separator row */}
                    <tr key={`cat-${cat.label}`} className="bg-gray-50">
                      <td
                        colSpan={5}
                        className="py-2 px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-t border-gray-100"
                      >
                        {cat.label}
                      </td>
                    </tr>

                    {/* Feature rows */}
                    {cat.rows.map((row, ri) => (
                      <tr
                        key={`${cat.label}-${ri}`}
                        className="border-t border-gray-100 hover:bg-gray-50/60 transition-colors"
                      >
                        <td className="py-3 pr-4 text-gray-700 text-sm leading-snug">
                          {row.label}
                        </td>
                        {row.values.map((val, vi) => {
                          const isCurrent =
                            !!currentPackage && PACKAGES[vi].name === currentPackage;
                          const isBlue = PACKAGES[vi].highlight;
                          return (
                            <td
                              key={vi}
                              className={`py-3 px-1.5 text-center align-middle ${
                                isCurrent
                                  ? "bg-green-50/50"
                                  : isBlue
                                  ? "bg-blue-50/40"
                                  : ""
                              }`}
                            >
                              <CellContent
                                value={val}
                                isCurrent={isCurrent}
                                isBlue={isBlue}
                              />
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

      {/* ─── Footer CTA ─── */}
      <div className="card p-6 text-center">
        <p className="text-sm font-medium text-gray-700 mb-3">
          Želiš nadograditi svoje benefite? Kontaktiraj nas!
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
