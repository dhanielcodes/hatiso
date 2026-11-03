'use client';

import React from 'react';
import { UserPlus, Lock, Smartphone } from 'lucide-react';

export interface StepDef {
  label: string;
  icon: React.ReactNode;
}

const STEPS: StepDef[] = [
  { label: 'Create account', icon: <UserPlus className="h-4 w-4" strokeWidth={2.2} /> },
  { label: 'Create password', icon: <Lock className="h-4 w-4" strokeWidth={2.2} /> },
  { label: 'Verify account', icon: <Smartphone className="h-4 w-4" strokeWidth={2.2} /> },
];

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3;
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="mb-10 flex items-start justify-center gap-0">
      {STEPS.map((step, idx) => {
        const num = idx + 1;
        const isCompleted = num < currentStep;
        const isActive = num === currentStep;
        const isLast = idx === STEPS.length - 1;

        return (
          <React.Fragment key={step.label}>
            {/* Step circle + label */}
            <div className="flex flex-col items-center gap-2">
              {/* Circle */}
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  isCompleted
                    ? 'border-[#F5A56B] bg-[#FEF0E6] text-[#FF6500]'
                    : isActive
                    ? 'border-[#FF6500] bg-[#FEF0E6] text-[#FF6500]'
                    : 'border-slate-300 bg-transparent text-slate-400'
                }`}
              >
                {step.icon}
              </div>

              {/* Step number + label */}
              <div className="text-center">
                <p
                  className={`text-[11px] font-bold ${
                    isCompleted || isActive ? 'text-[#FF6500]' : 'text-slate-400'
                  }`}
                >
                  {num}
                </p>
                <p
                  className={`mt-0.5 text-[11px] leading-tight ${
                    isCompleted || isActive
                      ? 'font-medium text-[#FF6500]'
                      : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </p>
              </div>
            </div>

            {/* Connector line between steps */}
            {!isLast && (
              <div className="relative mx-1 mt-5 flex-1 min-w-[40px] max-w-[80px]">
                <div className="h-0 border-t-2 border-dashed border-slate-300" />
                <div
                  className={`absolute inset-0 h-0 border-t-2 border-dashed transition-all duration-500 ${
                    isCompleted ? 'border-[#F5A56B] w-full' : 'border-transparent w-0'
                  }`}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
