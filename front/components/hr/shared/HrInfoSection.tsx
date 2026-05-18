import type { HrInfoSectionProps } from "@/types/hr-ui";

export default function HrInfoSection({
  title,
  eyebrow,
  eyebrowIcon,
  children,
  className = "",
}: HrInfoSectionProps) {
  return (
    <section
      className={`rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5 ${className}`}
    >
      <header className="mb-4 border-b border-slate-100 pb-3">
        {eyebrow ? (
          <p className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-indigo-500">
            {eyebrowIcon ? (
              <i className={`bx bx-${eyebrowIcon} text-sm`} />
            ) : null}
            {eyebrow}
          </p>
        ) : null}
        <h3
          className={`text-sm font-black text-slate-900 ${
            eyebrow ? "mt-1" : ""
          }`}
        >
          {title}
        </h3>
      </header>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
