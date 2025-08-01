import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Platform,
} from "react-native";

// Your cn utility adapted for React Native
function cn(...classes: (string | boolean | undefined)[]): string {
  return classes
    .filter(Boolean)
    .join(' ')
    .trim();
}

// Assuming you have a buttonVariants utility adapted for React Native
// Replace with a local implementation of buttonVariants or ensure it's correctly exported from the module
const buttonVariants = ({ variant }: { variant?: string } = {}) => {
  switch (variant) {
    case "outline":
      return {
        borderWidth: 1,
        borderColor: "#000",
        padding: 10,
        borderRadius: 4,
      };
    default:
      return {
        backgroundColor: "#000",
        padding: 10,
        borderRadius: 4,
      };
  }
};
interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

const AlertDialog = ({ open, onOpenChange, children }: AlertDialogProps) => {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={open}
      onRequestClose={() => onOpenChange(false)}
    >
      {children}
    </Modal>
  );
};

const AlertDialogTrigger = ({
  children,
  onPress,
}: {
  children: React.ReactNode;
  onPress: () => void;
}) => {
  return <TouchableOpacity onPress={onPress}>{children}</TouchableOpacity>;
};

const AlertDialogOverlay = ({
  className,
  onPress,
  ...props
}: {
  className?: string;
  onPress?: () => void;
  [key: string]: any;
}) => {
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View
        style={[
          styles.overlay,
          className ? StyleSheet.flatten([styles.overlay, parseStyleString(className)]) : {},
        ]}
        {...props}
      />
    </TouchableWithoutFeedback>
  );
};

const AlertDialogContent = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
  [key: string]: any;
}) => {
  return (
    <View style={styles.contentContainer}>
      <AlertDialogOverlay />
      <View
        style={[
          styles.content,
          className ? StyleSheet.flatten([styles.content, parseStyleString(className)]) : {},
        ]}
        {...props}
      >
        {children}
      </View>
    </View>
  );
};

const AlertDialogHeader = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
  [key: string]: any;
}) => {
  return (
    <View
      style={[
        styles.header,
        className ? StyleSheet.flatten([styles.header, parseStyleString(className)]) : {},
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const AlertDialogFooter = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
  [key: string]: any;
}) => {
  return (
    <View
      style={[
        styles.footer,
        className ? StyleSheet.flatten([styles.footer, parseStyleString(className)]) : {},
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const AlertDialogTitle = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
  [key: string]: any;
}) => {
  return (
    <Text
      style={[
        styles.title,
        className ? StyleSheet.flatten([styles.title, parseStyleString(className)]) : {},
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

const AlertDialogDescription = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
  [key: string]: any;
}) => {
  return (
    <Text
      style={[
        styles.description,
        className ? StyleSheet.flatten([styles.description, parseStyleString(className)]) : {},
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

const AlertDialogAction = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
  [key: string]: any;
}) => {
  return (
    <TouchableOpacity
      style={[
        buttonVariants(), // Your adapted buttonVariants
        className ? StyleSheet.flatten([buttonVariants(), parseStyleString(className)]) : {},
      ]}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
};

const AlertDialogCancel = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
  [key: string]: any;
}) => {
  return (
    <TouchableOpacity
      style={[
        buttonVariants({ variant: "outline" }), // Your adapted buttonVariants
        styles.cancelButton,
        className ? StyleSheet.flatten([buttonVariants({ variant: "outline" }), styles.cancelButton, parseStyleString(className)]) : {},
      ]}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
};

// Helper function to convert CSS-like strings to React Native styles
function parseStyleString(styleString: string): any {
  const styleObj: any = {};
  const styles = styleString.split(' ');

  styles.forEach(style => {
    switch (style) {
      case 'fixed':
        styleObj.position = 'absolute';
        break;
      case 'inset-0':
        styleObj.top = 0;
        styleObj.left = 0;
        styleObj.right = 0;
        styleObj.bottom = 0;
        break;
      case 'z-50':
        styleObj.zIndex = 50;
        break;
      case 'bg-black/80':
        styleObj.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        break;
      // Add more class conversions as needed
      default:
        // Handle other classes or ignore
        break;
    }
  });

  return styleObj;
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    zIndex: 50,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    backgroundColor: "white",
    borderRadius: Platform.OS === "ios" ? 12 : 4,
    width: "90%",
    maxWidth: 500,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 50,
  },
  header: {
    flexDirection: "column",
    gap: 8,
    marginBottom: 16,
  },
  footer: {
    flexDirection: "column-reverse",
    marginTop: 16,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  cancelButton: {
    marginTop: 8,
  },
});

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};