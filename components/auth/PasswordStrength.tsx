'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
}

/** Password board rules list. The symbol rule is optional and never blocks sign-up. */
function getRules(pw: string) {
  return [
    { label: 'At least 8 characters', met: pw.length >= 8, optional: false },
    { label: 'One uppercase letter', met: /[A-Z]/.test(pw), optional: false },
    { label: 'One number', met: /[0-9]/.test(pw), optional: false },
    { label: 'One symbol, like ! or #', met: /[^A-Za-z0-9]/.test(pw), optional: true },
  ];
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const rules = getRules(password);

  return (
    <ul aria-label="Password rules" aria-live="polite" className="flex flex-col gap-2.5">
      {rules.map((rule) => (
        <li key={rule.label} className="flex items-center gap-2.5 text-sm">
          {rule.met ? (
            <span className="hz-pop flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-carbon text-cloud">
              <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
            </span>
          ) : (
            <span aria-hidden="true" className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-grey-150">
              <span className="h-1.5 w-1.5 rounded-full bg-grey-150" />
            </span>
          )}
          <span className={`flex-1 ${rule.met ? 'text-carbon' : 'text-grey-600'}`}>{rule.label}</span>
          <span className={`text-xs ${rule.met ? 'font-medium text-status-success' : 'text-grey-500'}`}>
            {rule.met ? 'Done' : rule.optional ? 'Optional' : ''}
          </span>
        </li>
      ))}
    </ul>
  );
}
