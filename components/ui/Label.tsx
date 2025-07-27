// components/ui/Label.tsx
import React from 'react';
import { Text, TextProps } from 'react-native';

interface LabelProps extends TextProps {
  children: React.ReactNode;
}

export function Label({ children, className = '', ...props }: LabelProps) {
  return (
    <Text
      className={`text-sm font-medium text-gray-700 mb-1 ${className}`}
      {...props}
    >
      {children}
    </Text>
  );
}
