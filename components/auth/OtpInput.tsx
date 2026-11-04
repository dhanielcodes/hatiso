'use client';

import React, { useRef, useEffect } from 'react';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (val: string) => void;
  hasError?: boolean;
  autoFocus?: boolean;
}

export default function OtpInput({
  length = 6,
  value,
  onChange,
  hasError = false,
  autoFocus = true,
}: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  // Auto-focus first box on mount
  useEffect(() => {
    if (autoFocus) {
      inputsRef.current[0]?.focus();
    }
  }, [autoFocus]);

  const digits = value.split('').slice(0, length);
  // Pad to full length
  const filled = Array.from({ length }, (_, i) => digits[i] ?? '');

  const handleChange = (idx: number, raw: string) => {
    // Accept only digits
    const digit = raw.replace(/\D/g, '').slice(-1);
    const next = [...filled];
    next[idx] = digit;
    onChange(next.join(''));
    if (digit && idx < length - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (filled[idx]) {
        const next = [...filled];
        next[idx] = '';
        onChange(next.join(''));
      } else if (idx > 0) {
        const next = [...filled];
        next[idx - 1] = '';
        onChange(next.join(''));
        inputsRef.current[idx - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    } else if (e.key === 'ArrowRight' && idx < length - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    const next = Array.from({ length }, (_, i) => pasted[i] ?? '');
    onChange(next.join(''));
    const focusIdx = Math.min(pasted.length, length - 1);
    inputsRef.current[focusIdx]?.focus();
  };

  return (
    <div className="flex items-center justify-center gap-3">
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => { inputsRef.current[idx] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={filled[idx]}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          aria-label={`OTP digit ${idx + 1}`}
          className={`h-14 w-12 rounded-xl border-2 text-center text-xl font-bold text-slate-900 transition-all focus:outline-none ${hasError
              ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
              : filled[idx]
                ? 'border-[#E95312] bg-[#FEF0E6] focus:border-[#E95312] focus:ring-2 focus:ring-[#E95312]/20'
                : 'border-[#E8E4DE] bg-white focus:border-[#E95312] focus:ring-2 focus:ring-[#E95312]/20'
            }`}
        />
      ))}
    </div>
  );
}

