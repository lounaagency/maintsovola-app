// components/ui/Input.tsx
import { TextInput, TextInputProps, View } from 'react-native';

interface InputProps extends TextInputProps {
  error?: boolean;
}

export function Input({ error = false, className = '', ...props }: InputProps) {
  const baseClasses = 'border rounded-lg px-3 py-3 text-base bg-white';
  const errorClasses = error ? 'border-red-500' : 'border-gray-300';
  const focusClasses = 'focus:border-green-500';

  return (
    <View>
      <TextInput
        className={`${baseClasses} ${errorClasses} ${className}`}
        placeholderTextColor="#9ca3af"
        {...props}
      />
    </View>
  );
}
