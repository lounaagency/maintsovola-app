// components/ui/Button.tsx
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({
  children,
  variant = 'default',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'rounded-lg flex-row items-center justify-center';

  const variantClasses = {
    default: 'bg-green-600 active:bg-green-700',
    outline: 'border border-green-600 active:bg-green-50',
    ghost: 'active:bg-gray-100',
  };

  const sizeClasses = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
  };

  const textClasses = {
    default: 'text-white font-medium',
    outline: 'text-green-600 font-medium',
    ghost: 'text-gray-700 font-medium',
  };

  const disabledClasses = disabled || loading ? 'opacity-50' : '';

  return (
    <TouchableOpacity
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
      disabled={disabled || loading}
      {...props}>
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'default' ? 'white' : '#16a34a'}
          style={{ marginRight: 8 }}
        />
      )}
      <Text className={textClasses[variant]}>{children}</Text>
    </TouchableOpacity>
  );
}
