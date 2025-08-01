import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';

// Types for our Dialog component
type DialogProps = {
  children: React.ReactNode;
  visible: boolean;
  onDismiss: () => void;
};

type DialogTriggerProps = {
  children: React.ReactNode;
  onPress?: () => void;
};

type DialogOverlayProps = {
  visible: boolean;
};

type DialogContentProps = {
  children: React.ReactNode;
  style?: any;
};

type DialogCloseProps = {
  onPress?: () => void;
  style?: any;
};

type DialogHeaderProps = {
  children: React.ReactNode;
  style?: any;
};

type DialogFooterProps = {
  children: React.ReactNode;
  style?: any;
};

type DialogTitleProps = {
  children: React.ReactNode;
  style?: any;
};

type DialogDescriptionProps = {
  children: React.ReactNode;
  style?: any;
};

// Dialog Components
const Dialog = ({ children, visible, onDismiss }: DialogProps) => {
  return (
    <Modal 
      visible={visible} 
      onRequestClose={onDismiss}
      transparent
      animationType="fade"
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.overlayTouchable} 
          activeOpacity={1} 
          onPress={onDismiss}
        />
        <View style={styles.modalContainer}>
          {children}
        </View>
      </View>
    </Modal>
  );
};

const DialogTrigger = ({ children, onPress }: DialogTriggerProps) => {
  return (
    <TouchableOpacity onPress={onPress}>
      {children}
    </TouchableOpacity>
  );
};

const DialogOverlay = ({ visible }: DialogOverlayProps) => {
  if (!visible) return null;
  return <View style={styles.overlay} />;
};

const DialogContent = ({ children, style }: DialogContentProps) => {
  return (
    <View style={[styles.content, style]}>
      {children}
    </View>
  );
};

const DialogClose = ({ onPress, style }: DialogCloseProps) => {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[styles.closeButton, style]}
      accessibilityLabel="Close dialog"
    >
      <Text style={styles.closeButtonText}>×</Text>
    </TouchableOpacity>
  );
};

const DialogHeader = ({ children, style }: DialogHeaderProps) => {
  return (
    <View style={[styles.header, style]}>
      {children}
    </View>
  );
};

const DialogFooter = ({ children, style }: DialogFooterProps) => {
  return (
    <View style={[styles.footer, style]}>
      {children}
    </View>
  );
};

const DialogTitle = ({ children, style }: DialogTitleProps) => {
  return (
    <Text style={[styles.title, style]}>
      {children}
    </Text>
  );
};

const DialogDescription = ({ children, style }: DialogDescriptionProps) => {
  return (
    <Text style={styles.description}>
      {children}
    </Text>
  );
};

// Styles
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 8,
    minWidth: 300,
    maxWidth: '90%',
    maxHeight: '80%',
  },
  content: {
    padding: 24,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 4,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
    fontWeight: 'bold',
  },
  header: {
    marginBottom: 16,
    alignItems: 'center',
  },
  footer: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
});

export {
  Dialog,
  DialogTrigger,
  DialogOverlay,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};