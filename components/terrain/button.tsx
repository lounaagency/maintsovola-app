import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, View } from 'react-native';

type Variant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type Size = 'default' | 'sm' | 'lg' | 'icon';

interface ButtonProps {
  variant?: Variant;
  size?: Size;
  title?: string | React.ReactNode; // Accepte maintenant string ou ReactNode
  icon?: React.ReactNode; // Nouvelle prop pour icône
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle; // Permet de surcharger le style
  textStyle?: TextStyle; // Permet de surcharger le style du texte
}

export function Button({
  variant = 'default',
  size = 'default',
  title,
  icon,
  onPress,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const buttonStyle = [
    styles.base, 
    styles[variant], 
    styles[`size_${size}`],
    style, // Style personnalisé ajouté
  ];

  const mergedTextStyle = [
    styles.text, 
    variant === 'link' && styles.linkText,
    textStyle, // Style de texte personnalisé ajouté
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {icon ? (
        <View style={styles.iconContainer}>
          {icon}
        </View>
      ) : (
        typeof title === 'string' ? (
          <Text style={mergedTextStyle}>{title}</Text>
        ) : (
          <View style={styles.iconContainer}>
            {title}
          </View>
        )
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  default: {
    backgroundColor: '#3b82f6',
  },
  destructive: {
    backgroundColor: '#ef4444',
  },
  outline: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  secondary: {
    backgroundColor: '#e5e7eb',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  link: {
    backgroundColor: 'transparent',
  },
  size_default: {
    height: 40,
  },
  size_sm: {
    height: 36,
    paddingHorizontal: 12,
  },
  size_lg: {
    height: 48,
    paddingHorizontal: 24,
  },
  size_icon: {
    width: 40,
    height: 40,
    padding: 0,
  },
  text: {
    color: '#fff',
    fontWeight: '500',
  },
  linkText: {
    color: '#3b82f6',
    textDecorationLine: 'underline',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});