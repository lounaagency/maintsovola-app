import * as React from "react"
import { Text, View, TextInput } from "react-native"
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
} from "react-hook-form"

// Note: You'll need to replace cn (classnames) with your React Native styling solution
// For example, using StyleSheet or a library like styled-components

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
)

const FormItem = React.forwardRef<View, React.ComponentProps<typeof View>>(
  ({ style, ...props }, ref) => {
    const id = React.useId()

    return (
      <FormItemContext.Provider value={{ id }}>
        <View ref={ref} style={[{ marginBottom: 8 }, style]} {...props} />
      </FormItemContext.Provider>
    )
  }
)
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef<Text, React.ComponentProps<typeof Text>>(
  ({ style, ...props }, ref) => {
    const { error, formItemId } = useFormField()

    return (
      <Text
        ref={ref}
        style={[error && { color: "red" }, style]}
        // In React Native, we don't use htmlFor, but we might need to link this to the input
        // You might need to implement accessibility props here
        {...props}
      />
    )
  }
)
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef<View, { children: React.ReactNode }>(
    ({ children, ...props }, ref) => {
      const { error, formItemId, formDescriptionId, formMessageId, name: fieldContextName } = useFormField()
  
      return (
        <View ref={ref}>
          {React.Children.map(children, child => {
            if (React.isValidElement(child)) {
              // Type the child element properly
              const typedChild = child as React.ReactElement<{
                accessibilityLabel?: string;
                [key: string]: any;
              }>
              
              return React.cloneElement(typedChild, {
                // Accessibility props
                accessible: true,
                accessibilityLabel: typedChild.props.accessibilityLabel || fieldContextName,
                accessibilityDescribedBy: !error
                  ? formDescriptionId
                  : `${formDescriptionId} ${formMessageId}`,
                accessibilityInvalid: !!error,
                ...props,
              })
            }
            return child
          })}
        </View>
      )
    }
  )
FormControl.displayName = "FormControl"

const FormDescription = React.forwardRef<Text, React.ComponentProps<typeof Text>>(
  ({ style, ...props }, ref) => {
    const { formDescriptionId } = useFormField()

    return (
      <Text
        ref={ref}
        // In React Native, we might use nativeID instead of id
        nativeID={formDescriptionId}
        style={[{ fontSize: 14, color: "#666" }, style]}
        {...props}
      />
    )
  }
)
FormDescription.displayName = "FormDescription"

const FormMessage = React.forwardRef<Text, React.ComponentProps<typeof Text>>(
  ({ style, children, ...props }, ref) => {
    const { error, formMessageId } = useFormField()
    const body = error ? String(error?.message) : children

    if (!body) {
      return null
    }

    return (
      <Text
        ref={ref}
        nativeID={formMessageId}
        style={[{ fontSize: 14, fontWeight: "500", color: "red" }, style]}
        {...props}
      >
        {body}
      </Text>
    )
  }
)
FormMessage.displayName = "FormMessage"

export {
  useFormField,
  FormProvider as Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
}