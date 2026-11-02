'use client';

import React from 'react';
import { X, Check } from 'lucide-react';

interface PasswordRule {
  label: string;
  met: boolean;
}

interface PasswordStrengthProps {
  password: string;
}

function getRules(pw: string): PasswordRule[] {
  return [
    { label: 'At least 1 uppercase', met: /[A-Z]/.test(pw) },
    { label: 'At least 1 number', met: /[0-9]/.test(pw) },
    { label: 'At least 8 characters', met: pw.length >= 8 },
  ];
}

function getStrength(rules: PasswordRule[]): 0 | 1 | 2 | 3 {
  const met = rules.filter((r) => r.met).length;
  return met as 0 | 1 | 2 | 3;
}

const STRENGTH_LABELS = ['', 'Weak password', 'Medium strength', 'Strong password'];
const STRENGTH_COLORS = [
  '',
  'text-rose-500',
  'text-amber-500',
  'text-emerald-600',
];
const BAR_FILL = [
  ['bg-slate-200', 'bg-slate-200', 'bg-slate-200'],
  ['bg-rose-400', 'bg-slate-200', 'bg-slate-200'],
  ['bg-amber-400', 'bg-amber-400', 'bg-slate-200'],
  ['bg-emerald-500', 'bg-emerald-500', 'bg-emerald-500'],
];

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const rules = getRules(password);
  const strength = getStrength(rules);
  const bars = BAR_FILL[strength];

  return (
    <div className="mt-3 space-y-3">
      {/* Strength bars */}
      <div className="flex gap-1.5">
        {bars.map((color, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${color}`}
          />
        ))}
      </div>

      {/* Label + rules */}
      <div>
        <p className={`mb-2 text-[13px] font-medium ${STRENGTH_COLORS[strength]}`}>
          {STRENGTH_LABELS[strength]}. Must contain;
        </p>
        <ul className="space-y-1.5">
          {rules.map((rule) => (
            <li key={rule.label} className="flex items-center gap-2">
              <span
                className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full ${
                  rule.met ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                }`}
              >
                {rule.met ? (
                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                ) : (
                  <X className="h-2.5 w-2.5 stroke-[3]" />
                )}
              </span>
              <span
                className={`text-[13px] ${rule.met ? 'text-emerald-700' : 'text-slate-500'}`}
              >
                {rule.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

