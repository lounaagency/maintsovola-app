// components/Logo.tsx
import { images } from '@/constants/constants';
import { Image, Text, View } from 'react-native';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: { container: 'w-8 h-8', text: 'text-sm' },
    md: { container: 'w-12 h-12', text: 'text-lg' },
    lg: { container: 'size-28', text: 'text-2xl' },
  };

  return (
    <View className="items-center">
      <Image source={images.logo} className={sizeClasses[size].container} resizeMode="contain" />
      {size === 'lg' && <Text className="mt-2 text-xl font-bold text-gray-900">Maintso Vola</Text>}
    </View>
  );
}
