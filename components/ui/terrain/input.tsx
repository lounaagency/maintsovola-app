import * as React from "react"
import { TextInput, TextInputProps, StyleSheet } from "react-native"

interface InputProps extends TextInputProps {
  className?: string; // Optional className for compatibility (you might want to use a different styling system)
}

const Input = React.forwardRef<TextInput, InputProps>(
  ({ className, style, ...props }, ref) => {
    // In React Native, we use StyleSheet or inline styles instead of className
    const inputStyle = [
      styles.baseInput,
      style, // Allow overriding styles via props
    ]

    return (
      <TextInput
        ref={ref}
        style={inputStyle}
        placeholderTextColor="#999999" // Equivalent to placeholder:text-muted-foreground
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

const styles = StyleSheet.create({
  baseInput: {
    height: 40, // Equivalent to h-10
    width: '100%',
    borderRadius: 5, // Equivalent to rounded-md
    borderWidth: 1,
    borderColor: '#e2e8f0', // Default border color (equivalent to border-input)
    backgroundColor: '#ffffff', // Default background (equivalent to bg-background)
    paddingHorizontal: 12, // Equivalent to px-3
    paddingVertical: 8, // Equivalent to py-2
    fontSize: 16, // Equivalent to text-base (md:text-sm would be 14)
    // Focus styles need to be handled differently in React Native
  },
  // You might want to add focused state styles
  focusedInput: {
    borderColor: '#3b82f6', // Example focus color (equivalent to focus-visible:ring-ring)
    // React Native doesn't have exact equivalents for ring and ring-offset
  },
  disabledInput: {
    opacity: 0.5, // Equivalent to disabled:opacity-50
    // cursor-not-allowed doesn't apply in React Native
  }
})

export { Input }