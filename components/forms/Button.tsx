'use client';

import React from 'react';
import { ButtonSize, ButtonVariant, buttonClass } from './styles';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

/** Plain action button (Cancel, Edit, Back…). Use `SubmitButton` inside a Formik form. */
export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth,
  type = 'button',
  className = '',
  ...rest
}: ButtonProps) {
  return <button type={type} className={[buttonClass(variant, { size, fullWidth }), className].filter(Boolean).join(' ')} {...rest} />;
}
