'use client';

import React from 'react';

const STEPS = ['Your details', 'Password', 'Verify'];

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3;
}

/** Three-part progress bar shown above each sign-up step. Done and current steps fill in Carbon. */
export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <ol aria-label="Sign-up progress" className="grid grid-cols-3 gap-2.5">
      {STEPS.map((label, idx) => {
        const num = idx + 1;
        const reached = num <= currentStep;
        return (
          <li key={label} aria-current={num === currentStep ? 'step' : undefined} className="flex flex-col gap-2">
            <span className="h-1 overflow-hidden rounded-full bg-grey-100">
              <span
                className={`block h-full rounded-full bg-carbon transition-[width] duration-500 ease-out-soft ${reached ? 'w-full' : 'w-0'}`}
              />
            </span>
            <span className={`text-xs font-medium ${reached ? 'text-carbon' : 'text-grey-500'}`}>
              <span className="tabular-nums">{num}</span> · {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
