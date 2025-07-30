import * as React from "react"
import { Text, TextProps, StyleSheet } from "react-native"

interface LabelProps extends TextProps {
  variant?: 'default' | 'bold';
}

const Label = React.forwardRef<Text, LabelProps>(
  ({ variant = 'default', style, ...props }, ref) => {
    const labelStyle = [
      styles.baseLabel,
      variant === 'bold' && styles.boldLabel,
      style,
    ]

    return (
      <Text
        ref={ref}
        style={labelStyle}
        {...props}
      />
    )
  }
)

Label.displayName = "Label"

const styles = StyleSheet.create({
  baseLabel: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    opacity: 1,
  },
  boldLabel: {
    fontWeight: '700',
  },
  disabledLabel: {
    opacity: 0.7,
  }
})

export { Label }