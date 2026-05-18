"use client";

import React from "react";
import { Check } from "@phosphor-icons/react";

interface PremiumSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const PremiumSwitch: React.FC<PremiumSwitchProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
}) => {
  return (
    <label
      className={`flex items-center gap-3.5 cursor-pointer select-none group ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          disabled={disabled}
        />
        {/* Track */}
        <div
          className={`w-14 h-8 rounded-full transition-all duration-300 ease-out border ${
            checked
              ? "bg-zinc-950 border-zinc-950 shadow-[0_0_12px_rgba(9,9,11,0.2)]"
              : "bg-zinc-100 border-zinc-200 group-hover:bg-zinc-200/70"
          }`}
        />
        {/* Thumb */}
        <div
          className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ease-out flex items-center justify-center ${
            checked ? "translate-x-6 scale-105" : "scale-100"
          }`}
        >
          {/* Subtle microdot inside thumb */}
          <div
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              checked ? "bg-zinc-950" : "bg-zinc-300 group-hover:bg-zinc-400"
            }`}
          />
        </div>
      </div>
      {label && (
        <span className="font-semibold text-sm text-zinc-800 transition-colors duration-200 group-hover:text-zinc-950">
          {label}
        </span>
      )}
    </label>
  );
};

interface PremiumCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const PremiumCheckbox: React.FC<PremiumCheckboxProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
}) => {
  return (
    <label
      className={`flex items-center gap-3 cursor-pointer select-none group ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <div className="relative flex items-center justify-center">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          disabled={disabled}
        />
        {/* Box */}
        <div
          className={`w-6 h-6 rounded-lg border transition-all duration-200 ease-out flex items-center justify-center ${
            checked
              ? "bg-zinc-950 border-zinc-950 text-white shadow-sm scale-105"
              : "bg-white border-zinc-300 group-hover:border-zinc-500 shadow-sm"
          }`}
        >
          <Check
            size={14}
            weight="bold"
            className={`transform transition-all duration-200 ${
              checked ? "scale-100 opacity-100" : "scale-50 opacity-0"
            }`}
          />
        </div>
      </div>
      {label && (
        <span className="font-semibold text-sm text-zinc-800 transition-colors duration-200 group-hover:text-zinc-950">
          {label}
        </span>
      )}
    </label>
  );
};
