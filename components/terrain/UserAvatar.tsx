import React from 'react';
import { View, Text, Image, StyleSheet, ImageSourcePropType } from 'react-native';

interface UserAvatarProps {
  name: string;
  photoUrl?: string;
  size?: 'sm' | 'md' | 'lg';
}

const UserAvatar: React.FC<UserAvatarProps> = ({ name, photoUrl, size = 'md' }) => {
  // Get initials from name
  const initials = name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);

  // Determine avatar size
  const sizeStyles = {
    sm: { width: 24, height: 24, fontSize: 12 },
    md: { width: 36, height: 36, fontSize: 14 },
    lg: { width: 48, height: 48, fontSize: 18 }
  };

  const currentSize = sizeStyles[size];

  return (
    <View style={[styles.container, currentSize]}>
      {photoUrl ? (
        <Image
          source={{ uri: photoUrl }}
          style={[styles.image, currentSize]}
          accessibilityLabel={name}
        />
      ) : (
        <View style={[styles.fallback, currentSize]}>
          <Text style={[styles.initials, { fontSize: currentSize.fontSize }]}>
            {initials}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 9999, // Circular shape
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.1)', // primary/10 equivalent
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.1)', // primary/10 equivalent
  },
  initials: {
    color: '#007AFF', // primary color
    fontWeight: '500',
  },
});

export default UserAvatar;