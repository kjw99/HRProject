import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

/** ??? ?? ?? ?? ? ?? */
export const MAIL_COMPOSER = {
  shell: "flex flex-col gap-4 bg-slate-50/80 p-4 sm:p-5",
  grid: "grid gap-4 lg:grid-cols-2 lg:items-start",
  panel:
    "flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/[0.03]",
  panelHeader:
    "flex items-center gap-2.5 border-b border-slate-100 bg-slate-50/80 px-4 py-3 sm:px-5",
  panelBody: "flex min-h-0 flex-1 flex-col gap-4 p-4 sm:p-5",
  panelFooter:
    "mt-auto border-t border-slate-100 bg-slate-50/50 px-4 py-3 sm:px-5",
  label: "text-[11px] font-black uppercase tracking-[0.14em] text-slate-500",
  hint: "text-xs font-medium leading-relaxed text-slate-500",
  field:
    "w-full rounded-xl border border-slate-200 bg-slate-50/90 px-3.5 py-2.5 text-sm font-semibold text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] transition placeholder:font-medium placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20",
  fieldMono:
    "w-full resize-y rounded-xl border border-slate-200 bg-slate-100/80 px-3.5 py-3 font-mono text-xs leading-6 text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20",
  card: "rounded-xl border border-slate-200/90 bg-slate-50/50 p-3.5 sm:p-4",
  primaryBtn:
    "inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50",
  alert:
    "rounded-xl border border-amber-200/90 bg-amber-50 px-3.5 py-2.5 text-xs font-semibold leading-5 text-amber-900",
  tip: "rounded-xl border border-indigo-100 bg-indigo-50/60 px-3.5 py-3 text-xs font-medium leading-5 text-indigo-900/90",
} as const;

interface MailComposerPanelProps {
  icon: string;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function MailComposerPanel({
  icon,
  title,
  description,
  children,
  footer,
}: MailComposerPanelProps) {
  return (
    <section className={MAIL_COMPOSER.panel}>
      <header className={MAIL_COMPOSER.panelHeader}>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
          <i className={`bx bx-${icon} text-lg`} />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-black text-slate-900">{title}</h3>
          {description ? (
            <p className="mt-0.5 text-xs font-medium text-slate-500">
              {description}
            </p>
          ) : null}
        </div>
      </header>
      <div className={MAIL_COMPOSER.panelBody}>{children}</div>
      {footer ? (
        <footer className={MAIL_COMPOSER.panelFooter}>{footer}</footer>
      ) : null}
    </section>
  );
}

interface MailComposerFieldProps {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
}

export function MailComposerField({
  label,
  hint,
  htmlFor,
  children,
}: MailComposerFieldProps) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={htmlFor} className={MAIL_COMPOSER.label}>
        {label}
      </label>
      {children}
      {hint ? <p className={MAIL_COMPOSER.hint}>{hint}</p> : null}
    </div>
  );
}

interface MailComposerSelectProps {
  id?: string;
  value: string | number;
  onChange: (value: string) => void;
  disabled?: boolean;
  children: ReactNode;
}

export function MailComposerSelect({
  id,
  value,
  onChange,
  disabled,
  children,
}: MailComposerSelectProps) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`${MAIL_COMPOSER.field} appearance-none pr-10 disabled:opacity-60`}
      >
        {children}
      </select>
      <i className="bx bx-chevron-down pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-lg text-slate-400" />
    </div>
  );
}

export function MailComposerInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return (
    <input
      {...rest}
      className={[MAIL_COMPOSER.field, className].filter(Boolean).join(" ")}
    />
  );
}

export function MailComposerTextarea(
  props: TextareaHTMLAttributes<HTMLTextAreaElement> & { mono?: boolean },
) {
  const { mono, className, ...rest } = props;
  const base = mono ? MAIL_COMPOSER.fieldMono : MAIL_COMPOSER.field;
  return (
    <textarea
      {...rest}
      className={[base, className].filter(Boolean).join(" ")}
    />
  );
}
