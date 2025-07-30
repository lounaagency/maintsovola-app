import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { Modal, Portal } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Types for our Select component
type SelectProps = {
  children: React.ReactNode;
  onValueChange?: (value: string) => void;
  value?: string;
  defaultValue?: string;
};

type SelectTriggerProps = {
  children: React.ReactNode;
  style?: any;
  onPress?: () => void;
};

type SelectContentProps = {
  children: React.ReactNode;
  visible: boolean;
  onDismiss: () => void;
  position?: 'popper' | 'inline';
  style?: any;
};

type SelectItemProps = {
  value: string;
  children: React.ReactNode;
  style?: any;
  onPress?: () => void;
};

type SelectLabelProps = {
  children: React.ReactNode;
  style?: any;
};

type SelectSeparatorProps = {
  style?: any;
};

// Helper type for components with known props
type SelectComponentType = 
  | React.FC<SelectTriggerProps>
  | React.FC<SelectContentProps>
  | React.FC<SelectItemProps>;

// Select Components
const Select = ({ children, onValueChange, value, defaultValue }: SelectProps) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const [visible, setVisible] = React.useState(false);

  const handleValueChange = (newValue: string) => {
    setInternalValue(newValue);
    onValueChange?.(newValue);
    setVisible(false);
  };

  const currentValue = value !== undefined ? value : internalValue;

  return (
    <View>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          // Type-safe clone element with proper props
          if (child.type === SelectTrigger) {
            const triggerProps = child.props as SelectTriggerProps;
            return React.cloneElement(child, {
              onPress: () => setVisible(true),
              children: currentValue || triggerProps.children,
            } as Partial<SelectTriggerProps>);
          }
          
          if (child.type === SelectContent) {
            const contentProps = child.props as SelectContentProps;
            return React.cloneElement(child, {
              visible,
              onDismiss: () => setVisible(false),
              children: React.Children.map(contentProps.children, (contentChild) => {
                if (React.isValidElement(contentChild) && contentChild.type === SelectItem) {
                  const itemProps = contentChild.props as SelectItemProps;
                  return React.cloneElement(contentChild, {
                    onPress: () => handleValueChange(itemProps.value),
                  } as Partial<SelectItemProps>);
                }
                return contentChild;
              }),
            } as Partial<SelectContentProps>);
          }
        }
        return child;
      })}
    </View>
  );
};

// ... [rest of your component implementations remain the same]

const SelectTrigger = ({ children, style, onPress }: SelectTriggerProps) => {
  return (
    <TouchableOpacity
      style={[styles.trigger, style]}
      onPress={onPress}
    >
      <Text style={styles.triggerText}>{children}</Text>
      <Icon name="chevron-down" size={20} color="#999" />
    </TouchableOpacity>
  );
};

const SelectContent = ({ children, visible, onDismiss, position = 'popper', style }: SelectContentProps) => {
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.content,
          position === 'popper' && styles.contentPopper,
          style,
        ]}
      >
        <ScrollView style={styles.scrollView}>
          {children}
        </ScrollView>
      </Modal>
    </Portal>
  );
};

const SelectItem = ({ children, value, style, onPress }: SelectItemProps) => {
  return (
    <TouchableOpacity
      style={[styles.item, style]}
      onPress={onPress}
    >
      <Text style={styles.itemText}>{children}</Text>
    </TouchableOpacity>
  );
};

const SelectLabel = ({ children, style }: SelectLabelProps) => {
  return (
    <View style={[styles.label, style]}>
      <Text style={styles.labelText}>{children}</Text>
    </View>
  );
};

const SelectSeparator = ({ style }: SelectSeparatorProps) => {
  return <View style={[styles.separator, style]} />;
};

// Group and Value components are simpler in React Native
const SelectGroup = ({ children }: { children: React.ReactNode }) => {
  return <View>{children}</View>;
};

const SelectValue = ({ children }: { children: React.ReactNode }) => {
  return <Text>{children}</Text>;
};

// Scroll buttons (simplified for React Native)
const SelectScrollUpButton = ({ style }: { style?: any }) => {
  return (
    <View style={[styles.scrollButton, style]}>
      <Icon name="chevron-up" size={20} />
    </View>
  );
};

const SelectScrollDownButton = ({ style }: { style?: any }) => {
  return (
    <View style={[styles.scrollButton, style]}>
      <Icon name="chevron-down" size={20} />
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    backgroundColor: 'white',
  },
  triggerText: {
    fontSize: 14,
  },
  content: {
    backgroundColor: 'white',
    padding: 8,
    margin: 20,
    borderRadius: 4,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#eee',
  },
  contentPopper: {
    position: 'absolute',
    width: '80%',
  },
  scrollView: {
    flex: 1,
  },
  item: {
    paddingVertical: 8,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 14,
  },
  label: {
    paddingVertical: 6,
    paddingHorizontal: 32,
  },
  labelText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 4,
  },
  scrollButton: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};