import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, View } from 'react-native';

type Variant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type Size = 'default' | 'sm' | 'lg' | 'icon';

interface ButtonProps {
  variant?: Variant;
  size?: Size;
  title?: string | React.ReactNode;
  icon?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
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
    disabled && styles.disabled,
    style,
  ];

  const mergedTextStyle = [
    styles.text,
    variant === 'link' && styles.linkText,
    variant === 'outline' && styles.outlineText,
    variant === 'secondary' && styles.secondaryText,
    variant === 'ghost' && styles.ghostText,
    disabled && styles.disabledText,
    textStyle,
  ];

  // Fonction pour rendre le contenu
  const renderContent = () => {
    // Si on a une icône ET un titre
    if (icon && title) {
      return (
        <View style={styles.contentContainer}>
          <View style={styles.iconContainer}>
            {icon}
          </View>
          {typeof title === 'string' ? (
            <Text style={[mergedTextStyle, styles.textWithIcon]}>{title}</Text>
          ) : (
            <View style={styles.titleContainer}>
              {title}
            </View>
          )}
        </View>
      );
    }

    // Si on a seulement une icône
    if (icon) {
      return (
        <View style={styles.iconContainer}>
          {icon}
        </View>
      );
    }

    // Si on a seulement un titre
    if (title) {
      return typeof title === 'string' ? (
        <Text style={mergedTextStyle}>{title}</Text>
      ) : (
        <View style={styles.titleContainer}>
          {title}
        </View>
      );
    }

    // Fallback si rien n'est fourni
    return <Text style={mergedTextStyle}>Button</Text>;
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={disabled ? 1 : 0.8}
    >
      {renderContent()}
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
  disabled: {
    opacity: 0.5,
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
    fontSize: 14,
  },
  linkText: {
    color: '#3b82f6',
    textDecorationLine: 'underline',
  },
  outlineText: {
    color: '#374151',
  },
  secondaryText: {
    color: '#374151',
  },
  ghostText: {
    color: '#374151',
  },
  disabledText: {
    color: '#9ca3af',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWithIcon: {
    marginLeft: 8,
  },
});