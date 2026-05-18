"use client";

import { useState, useCallback } from "react";

type Rules<T> = {
  [K in keyof T]?: {
    required?: boolean | string;
    minLength?: { value: number; message: string };
    maxLength?: { value: number; message: string };
    pattern?: { value: RegExp; message: string };
    min?: { value: number; message: string };
    max?: { value: number; message: string };
    custom?: (val: T[K], all: T) => string | null;
  };
};

type Errors<T> = Partial<Record<keyof T, string>>;
type Touched<T> = Partial<Record<keyof T, boolean>>;

export function useFormValidation<T extends Record<string, unknown>>(
  rules: Rules<T>
) {
  const [errors, setErrors] = useState<Errors<T>>({});
  const [touched, setTouched] = useState<Touched<T>>({});

  const validate = useCallback(
    (data: T, keys?: (keyof T)[]): boolean => {
      const newErrors: Errors<T> = {};
      const fields = keys ?? (Object.keys(rules) as (keyof T)[]);

      for (const key of fields) {
        const rule = rules[key];
        if (!rule) continue;
        const val = data[key];

        if (rule.required) {
          const msg = typeof rule.required === "string" ? rule.required : "This field is required";
          if (val == null || val === "" || (Array.isArray(val) && val.length === 0)) {
            newErrors[key] = msg;
            continue;
          }
        }

        if (typeof val === "string") {
          if (rule.minLength && val.length < rule.minLength.value) {
            newErrors[key] = rule.minLength.message;
            continue;
          }
          if (rule.maxLength && val.length > rule.maxLength.value) {
            newErrors[key] = rule.maxLength.message;
            continue;
          }
          if (rule.pattern && !rule.pattern.value.test(val)) {
            newErrors[key] = rule.pattern.message;
            continue;
          }
        }

        if (typeof val === "number") {
          if (rule.min != null && val < rule.min.value) {
            newErrors[key] = rule.min.message;
            continue;
          }
          if (rule.max != null && val > rule.max.value) {
            newErrors[key] = rule.max.message;
            continue;
          }
        }

        if (rule.custom) {
          const msg = rule.custom(val, data);
          if (msg) {
            newErrors[key] = msg;
            continue;
          }
        }
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [rules]
  );

  const touch = useCallback((key: keyof T) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
  }, []);

  const touchAll = useCallback(() => {
    const all: Touched<T> = {};
    for (const key of Object.keys(rules)) {
      all[key as keyof T] = true;
    }
    setTouched(all);
  }, [rules]);

  const getError = useCallback(
    (key: keyof T) => (touched[key] ? errors[key] : undefined),
    [errors, touched]
  );

  return { errors, touched, validate, touch, touchAll, getError, setErrors, setTouched };
}
