import type { ButtonHTMLAttributes } from 'react';
import { Spinner } from './spinner';

const BUTTON_VARIANT_CLASSES = {
  default: 'bg-slate-900 text-white hover:bg-slate-700',
  gold: 'bg-gold-500 text-navy-950 hover:bg-gold-400',
  danger: 'bg-red-600 text-white hover:bg-red-500',
  outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
} as const;

type ButtonVariant = keyof typeof BUTTON_VARIANT_CLASSES;

export function Button({
  className = '',
  variant = 'default',
  isLoading = false,
  disabled,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; isLoading?: boolean }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 ${BUTTON_VARIANT_CLASSES[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
}
