'use client';

import { useEffect, type ReactNode } from 'react';
import { X, type LucideIcon } from 'lucide-react';

/**
 * Dialogs board frame: icon tile, title, round close button, body, and a footer with
 * the secondary action on the left and the primary on the right.
 */
export default function DialogFrame({
    title,
    icon: Icon,
    tone = 'default',
    onClose,
    children,
    footer,
    maxWidth = 'max-w-[460px]',
}: {
    title: string;
    icon?: LucideIcon;
    tone?: 'default' | 'danger';
    onClose: () => void;
    children: ReactNode;
    footer?: ReactNode;
    maxWidth?: string;
}) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = prev;
        };
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-carbon/60 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <div role="dialog" aria-modal="true" aria-label={title} className={`hz-pop flex max-h-[calc(100vh-2rem)] w-full ${maxWidth} flex-col overflow-hidden rounded-[14px] bg-surface text-tone-744 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)]`}>
                <div className="flex items-start justify-between gap-3 px-[22px] pt-5">
                    {Icon && (
                        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-tone-100 bg-surface ${tone === 'danger' ? 'text-status-error' : 'text-tone-744'}`}>
                            <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                    )}
                    <h2 className="flex-1 pt-2.5 text-lg font-semibold">{title}</h2>
                    <button type="button" onClick={onClose} aria-label="Close" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-tone-44 hover:bg-tone-100">
                        <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                </div>
                <div className="flex flex-col gap-3.5 overflow-y-auto px-[22px] py-4">{children}</div>
                {footer && <div className="flex flex-wrap justify-end gap-2.5 border-t border-tone-44 px-[22px] py-4">{footer}</div>}
            </div>
        </div>
    );
}

export const DIALOG_SECONDARY =
    'hz-press inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] border border-tone-100 bg-surface px-[18px] text-sm font-medium text-tone-744 hover:border-tone-414 disabled:opacity-50';
export const DIALOG_PRIMARY =
    'hz-press inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-brand-305 px-[18px] text-sm font-medium text-on-brand hover:bg-brand-361 disabled:opacity-50';
export const DIALOG_DANGER =
    'hz-press inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-status-error px-[18px] text-sm font-medium text-white disabled:opacity-50';
