import React from 'react';
import { TouchableOpacity, View, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Types for our Checkbox component
type CheckboxProps = {
  checked: boolean;
  onValueChange?: (checked: boolean) => void;
  disabled?: boolean;
  style?: any;
  accessibilityLabel?: string;
};

const Checkbox = React.forwardRef<View, CheckboxProps>(
  ({ checked, onValueChange, disabled = false, style, accessibilityLabel, ...props }, ref) => {
    const handlePress = () => {
      if (!disabled && onValueChange) {
        onValueChange(!checked);
      }
    };

    return (
      <TouchableOpacity
        ref={ref}
        onPress={handlePress}
        disabled={disabled}
        accessibilityRole="checkbox"
        accessibilityState={{ checked, disabled }}
        accessibilityLabel={accessibilityLabel}
        style={[styles.container, style]}
        activeOpacity={0.7}
        {...props}
      >
        <View
          style={[
            styles.checkbox,
            checked && styles.checked,
            disabled && styles.disabled,
          ]}
        >
          {checked && (
            <Icon 
              name="check" 
              size={16} 
              color={checked ? '#ffffff' : '#000000'} 
              style={styles.icon}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  }
);

// Styles
const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#007AFF', // Primary color
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  checked: {
    backgroundColor: '#007AFF', // Primary color
    borderColor: '#007AFF',
  },
  disabled: {
    opacity: 0.5,
    borderColor: '#CCCCCC',
  },
  icon: {
    // Adjust icon position if needed
  },
});

export { Checkbox };