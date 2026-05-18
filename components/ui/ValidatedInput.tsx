"use client";

import { useCallback } from "react";

type ValidatedInputProps = {
  label: string;
  error?: string;
  touched?: boolean;
  children: React.ReactNode;
  required?: boolean;
};

export function ValidatedField({ label, error, touched, children, required }: ValidatedInputProps) {
  const showError = touched && error;

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {showError && (
        <p className="text-[11px] font-medium text-red-500 ml-1 flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-red-500 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
};

export const ValidatedInput = ({ error, className = "", ...props }: InputProps) => (
  <input
    {...props}
    className={`w-full px-4 py-3 bg-zinc-50 rounded-xl border text-sm font-medium outline-none transition-all ${
      error ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-200" : "border-black/5 focus:bg-white focus:ring-2 focus:ring-black/5"
    } ${className}`}
  />
);

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  error?: string;
};

export const ValidatedSelect = ({ error, className = "", children, ...props }: SelectProps) => (
  <select
    {...props}
    className={`w-full px-4 py-3 bg-zinc-50 rounded-xl border text-sm font-medium outline-none transition-all cursor-pointer ${
      error ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-200" : "border-black/5 focus:bg-white focus:ring-2 focus:ring-black/5"
    } ${className}`}
  >
    {children}
  </select>
);

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: string;
};

export const ValidatedTextarea = ({ error, className = "", ...props }: TextareaProps) => (
  <textarea
    {...props}
    className={`w-full px-4 py-3 bg-zinc-50 rounded-xl border text-sm font-medium outline-none resize-none transition-all ${
      error ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-200" : "border-black/5 focus:bg-white focus:ring-2 focus:ring-black/5"
    } ${className}`}
  />
);
