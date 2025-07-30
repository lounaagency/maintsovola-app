import * as React from "react"
import { View, TouchableOpacity, StyleSheet } from "react-native"
import { Circle } from "lucide-react-native"

interface RadioGroupProps {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  style?: any;
}

interface RadioGroupItemProps {
  value: string;
  children?: React.ReactNode;
  style?: any;
  disabled?: boolean;
  // These will be injected by RadioGroup
  _selected?: boolean;
  _onValueChange?: (value: string) => void;
}

const RadioGroup = React.forwardRef<View, RadioGroupProps>(
  ({ children, value, onValueChange, style, ...props }, ref) => {
    return (
      <View ref={ref} style={[styles.radioGroup, style]} {...props}>
        {React.Children.map(children, child => {
          if (React.isValidElement<RadioGroupItemProps>(child)) {
            return React.cloneElement(child, {
              _selected: value === child.props.value,
              _onValueChange: onValueChange,
            })
          }
          return child
        })}
      </View>
    )
  }
)

const RadioGroupItem = React.forwardRef<View, RadioGroupItemProps>(
  ({ value, children, style, _selected, _onValueChange, disabled, ...props }, ref) => {
    return (
      <TouchableOpacity
        ref={ref}
        style={[styles.radioItemContainer, style]}
        onPress={() => !disabled && _onValueChange?.(value)}
        activeOpacity={0.7}
        disabled={disabled}
        {...props}
      >
        <View style={[
          styles.radioOuter,
          _selected && styles.radioOuterSelected,
          disabled && styles.disabled
        ]}>
          {_selected && (
            <Circle 
              size={10} 
              color="#000" // Adjust color as needed
              fill="#000" // For the indicator
            />
          )}
        </View>
        {children}
      </TouchableOpacity>
    )
  }
)

const styles = StyleSheet.create({
  radioGroup: {
    gap: 8,
  },
  radioItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#000000',
  },
  disabled: {
    opacity: 0.5,
  }
})

RadioGroup.displayName = "RadioGroup"
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }