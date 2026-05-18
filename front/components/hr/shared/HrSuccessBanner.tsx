import type { HrSuccessBannerProps } from "@/types/hr-ui";

const TONE_CLASS = {
  indigo: {
    wrap: "border-indigo-200 bg-indigo-50",
    title: "text-indigo-800",
    body: "text-indigo-700",
    icon: "bg-indigo-100 text-indigo-600",
  },
  emerald: {
    wrap: "border-emerald-200 bg-emerald-50",
    title: "text-emerald-800",
    body: "text-emerald-700",
    icon: "bg-emerald-100 text-emerald-600",
  },
} as const;

export default function HrSuccessBanner({
  title,
  description,
  icon = "check-circle",
  tone = "indigo",
  className = "",
}: HrSuccessBannerProps) {
  const styles = TONE_CLASS[tone];

  return (
    <aside
      className={`flex gap-3 rounded-2xl border px-4 py-3.5 sm:px-5 ${styles.wrap} ${className}`}
      role="status"
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}
      >
        <i className={`bx bx-${icon} text-xl`} />
      </span>
      <span className="min-w-0 block">
        <p className={`text-sm font-black ${styles.title}`}>{title}</p>
        {description ? (
          <span className={`mt-1 block text-sm font-semibold leading-6 ${styles.body}`}>
            {description}
          </span>
        ) : null}
      </span>
    </aside>
  );
}
