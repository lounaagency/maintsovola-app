import * as React from "react"
import { TextInput, TextInputProps, StyleSheet } from "react-native"

export interface TextareaProps extends TextInputProps {
  className?: string;
}

const Textarea = React.forwardRef<TextInput, TextareaProps>(
  ({ className, style, ...props }, ref) => {
    const textareaStyle = [
      styles.baseTextarea,
      style,
    ]

    return (
      <TextInput
        ref={ref}
        style={textareaStyle}
        multiline={true}
        textAlignVertical="top" // Align text to top for multiline
        placeholderTextColor="#999999"
        {...props}
      />
    )
  }
)

Textarea.displayName = "Textarea"

const styles = StyleSheet.create({
  baseTextarea: {
    minHeight: 80,
    width: '100%',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    // Additional styling for multiline
    paddingTop: 12, // Extra padding at top for better appearance
  },
})

export { Textarea }