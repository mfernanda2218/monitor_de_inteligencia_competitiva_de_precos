import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  href?: string;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  href,
  className = '',
  type = 'button'
}: ButtonProps) {
  const sizeStyles = {
    sm: { padding: '6px 12px', fontSize: '0.75rem' },
    md: { padding: '10px 20px', fontSize: '0.875rem' },
    lg: { padding: '14px 28px', fontSize: '1rem' }
  };

  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    borderRadius: '8px',
    fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    border: '1px solid transparent',
    textDecoration: 'none',
    opacity: disabled ? 0.5 : 1
  };

  const variantStyles = {
    primary: {
      background: '#2563EB',
      color: 'white',
      borderColor: '#2563EB'
    },
    secondary: {
      background: 'white',
      color: '#111827',
      borderColor: '#E5E7EB'
    },
    ghost: {
      background: 'transparent',
      color: '#6B7280',
      borderColor: 'transparent'
    }
  };

  const hoverStyles = disabled ? {} : {
    primary: {
      background: '#3B82F6',
      borderColor: '#3B82F6'
    },
    secondary: {
      background: '#F5F5F5',
      borderColor: '#2563EB',
      color: '#2563EB'
    },
    ghost: {
      background: '#F5F5F5',
      color: '#111827'
    }
  };

  const buttonStyle = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant]
  };

  const buttonElement = (
    <button
      type={type}
      style={buttonStyle}
      onClick={onClick}
      disabled={disabled}
      className={className}
      onMouseEnter={(e) => {
        if (!disabled) {
          Object.assign(e.currentTarget.style, hoverStyles[variant]);
        }
      }}
      onMouseLeave={(e) => {
        Object.assign(e.currentTarget.style, buttonStyle);
      }}
    >
      {children}
    </button>
  );

  if (href) {
    return (
      <a
        href={href}
        style={buttonStyle}
        className={className}
        onMouseEnter={(e) => {
          if (!disabled) {
            Object.assign(e.currentTarget.style, hoverStyles[variant]);
          }
        }}
        onMouseLeave={(e) => {
          Object.assign(e.currentTarget.style, buttonStyle);
        }}
      >
        {children}
      </a>
    );
  }

  return buttonElement;
}
