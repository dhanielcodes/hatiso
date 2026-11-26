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

  // Latest value, updated synchronously: fast typing fires several changes before the parent re-renders
  const latest = useRef(value);
  useEffect(() => {
    latest.current = value;
    // Cleared from outside (e.g. a rejected code): send the cursor back to the first box
    if (!value && inputsRef.current.includes(document.activeElement as HTMLInputElement)) {
      inputsRef.current[0]?.focus();
    }
  }, [value]);
  const emit = (next: string[]) => {
    latest.current = next.join('');
    onChange(latest.current);
  };
  const current = () => Array.from({ length }, (_, i) => latest.current[i] ?? '');

  const digits = value.split('').slice(0, length);
  // Pad to full length
  const filled = Array.from({ length }, (_, i) => digits[i] ?? '');

  const handleChange = (idx: number, raw: string) => {
    // Accept only digits
    const digit = raw.replace(/\D/g, '').slice(-1);
    const next = current();
    next[idx] = digit;
    emit(next);
    if (digit && idx < length - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = current();
      if (next[idx]) {
        next[idx] = '';
        emit(next);
      } else if (idx > 0) {
        next[idx - 1] = '';
        emit(next);
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
    emit(Array.from({ length }, (_, i) => pasted[i] ?? ''));
    const focusIdx = Math.min(pasted.length, length - 1);
    inputsRef.current[focusIdx]?.focus();
  };

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-3">
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
          className={`h-14 w-full min-w-0 max-w-14 rounded-lg border bg-white text-center text-2xl font-semibold text-carbon tabular-nums transition-colors focus:outline-none focus:ring-3 ${hasError
              ? 'border-status-error focus:ring-status-error/15'
              : filled[idx]
                ? 'border-carbon focus:ring-silver/60'
                : 'border-grey-150 focus:border-carbon focus:ring-silver/60'
            }`}
        />
      ))}
    </div>
  );
}

