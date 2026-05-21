import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'main' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  children: ReactNode;
}

export function Button({ 
  variant = 'main', 
  size = 'md', 
  color,
  children, 
  className = '',
  ...props 
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs min-h-[32px]',
    md: 'px-4 py-2 text-sm min-h-[36px]',
    lg: 'px-6 py-3 text-base min-h-[40px]',
  };

  if (color) {
    return (
      <button
        className={`${baseClasses} border-2 border-emerald-500 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 hover:border-emerald-600 ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }

  const variantClasses = {
    main: 'border border-neutral-200 text-neutral-900 hover:bg-neutral-50 hover:border-neutral-300',
    ghost: 'bg-transparent hover:bg-neutral-100 text-neutral-600',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}