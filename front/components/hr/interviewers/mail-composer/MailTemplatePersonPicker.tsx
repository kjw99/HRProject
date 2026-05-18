"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { MAIL_COMPOSER } from "./mail-composer-ui";

export interface MailTemplatePersonOption {
  id: number;
  name: string;
  department: string;
  email: string;
}

interface MailTemplatePersonPickerProps {
  value: string;
  onChange: (value: string) => void;
  onSelectOption?: (option: MailTemplatePersonOption) => void;
  options: readonly MailTemplatePersonOption[];
  valueMode: "name" | "email";
  placeholder: string;
}

export function buildInterviewerPickerOptions(
  interviewers: readonly {
    interviewerId: number;
    interviewerName: string;
    interviewerEmail: string;
    positionName?: string | null;
  }[],
): MailTemplatePersonOption[] {
  return [...interviewers]
    .map((item) => ({
      id: item.interviewerId,
      name: item.interviewerName,
      department: item.positionName?.trim() || "직무 미지정",
      email: item.interviewerEmail,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "ko"));
}

export default function MailTemplatePersonPicker({
  value,
  onChange,
  onSelectOption,
  options,
  valueMode,
  placeholder,
}: MailTemplatePersonPickerProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return options;

    return options.filter((option) => {
      const pickValue =
        valueMode === "email" ? option.email : option.name;
      return (
        option.name.toLowerCase().includes(q) ||
        option.department.toLowerCase().includes(q) ||
        option.email.toLowerCase().includes(q) ||
        pickValue.toLowerCase().includes(q)
      );
    });
  }, [options, value, valueMode]);

  useEffect(() => {
    setActiveIndex(0);
  }, [filtered.length, value]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);

  const pick = (option: MailTemplatePersonOption) => {
    const nextValue = valueMode === "email" ? option.email : option.name;
    onChange(nextValue);
    onSelectOption?.(option);
    setIsOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (event.key === "ArrowDown" || event.key === "Enter")) {
      setIsOpen(true);
      return;
    }

    if (!isOpen || filtered.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filtered.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      pick(filtered[activeIndex]);
    } else if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-autocomplete="list"
        onFocus={() => setIsOpen(true)}
        onChange={(event) => {
          onChange(event.target.value);
          setIsOpen(true);
        }}
        onKeyDown={handleKeyDown}
        className={MAIL_COMPOSER.field}
      />

      {isOpen ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1.5 max-h-56 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-slate-900/5"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2.5 text-xs font-semibold text-slate-500">
              검색 결과가 없습니다.
            </li>
          ) : (
            filtered.map((option, index) => {
              const isActive = index === activeIndex;
              return (
                <li key={option.id} role="option" aria-selected={isActive}>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => pick(option)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`flex w-full flex-col gap-0.5 px-3 py-2.5 text-left transition ${
                      isActive
                        ? "bg-indigo-50 text-indigo-950"
                        : "text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-sm font-bold">
                      {option.name}
                      <span className="font-semibold text-slate-400"> ---- </span>
                      <span className="font-semibold text-slate-600">
                        {option.department}
                      </span>
                    </span>
                    {valueMode === "email" ? (
                      <span className="text-xs font-medium text-slate-500">
                        {option.email}
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      ) : null}

      <p className="mt-1.5 text-xs font-medium text-slate-500">
        입력창을 클릭하면 면접관 목록이 이름순으로 표시됩니다. 검색어로
        필터할 수 있습니다.
      </p>
    </div>
  );
}
