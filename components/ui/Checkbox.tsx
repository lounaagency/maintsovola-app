// components/ui/Checkbox.tsx
import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

interface CheckboxProps {
  checked: boolean;
  onPress: () => void;
  label: string;
  disabled?: boolean;
}

export function Checkbox({ checked, onPress, label, disabled = false }: CheckboxProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className="flex-row items-center space-x-3">
      <View
        className={`h-5 w-5 items-center justify-center rounded border-2 ${
          checked ? 'border-green-600 bg-green-600' : 'border-gray-300 bg-white'
        } ${disabled ? 'opacity-50' : ''}`}>
        {checked && <Ionicons name="checkmark" size={12} color="white" />}
      </View>
      <Text className={`flex-1 text-sm ml-2 ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
