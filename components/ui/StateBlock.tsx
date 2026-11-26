'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { AlertTriangle, RotateCw, type LucideIcon } from 'lucide-react';

const PRIMARY =
    'hz-press mt-1.5 inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-brand-305 px-[18px] text-sm font-medium text-on-brand hover:bg-brand-361';
const SECONDARY =
    'hz-press mt-1.5 inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] border border-tone-100 bg-surface px-[18px] text-sm font-medium text-tone-744 hover:border-tone-414';

type Action = { label: string; href: string; primary?: boolean } | { label: string; onClick: () => void; primary?: boolean };

/**
 * States board blocks: Empty, Error ("Couldn't load" + Try again) and Not found.
 * Centred icon tile, title, a short line and one action.
 */
export default function StateBlock({
    icon: Icon,
    tone = 'default',
    title,
    children,
    action,
    className = '',
}: {
    icon?: LucideIcon;
    tone?: 'default' | 'error';
    title: string;
    children?: ReactNode;
    action?: Action;
    className?: string;
}) {
    const error = tone === 'error';
    const TileIcon = Icon ?? AlertTriangle;
    const actionClass = action?.primary ? PRIMARY : SECONDARY;
    return (
        <div role={error ? 'alert' : undefined} className={`flex flex-col items-center gap-2.5 px-2 py-6 text-center text-tone-744 ${className}`}>
            <span
                aria-hidden="true"
                className={`flex h-[52px] w-[52px] items-center justify-center rounded-xl ${error ? 'border border-tone-100 bg-surface text-status-error' : 'bg-tone-44 text-tone-744'}`}
            >
                <TileIcon className="h-5 w-5" />
            </span>
            {error && <span className="text-[13px] font-medium text-status-error">Couldn&apos;t load</span>}
            <span className="text-[17px] font-semibold">{title}</span>
            {children && <span className="max-w-[300px] text-sm leading-normal text-tone-414">{children}</span>}
            {action &&
                ('href' in action ? (
                    <Link href={action.href} className={actionClass}>
                        {action.label}
                    </Link>
                ) : (
                    <button type="button" onClick={action.onClick} className={actionClass}>
                        {error && <RotateCw className="h-4 w-4" aria-hidden="true" />}
                        {action.label}
                    </button>
                ))}
        </div>
    );
}
