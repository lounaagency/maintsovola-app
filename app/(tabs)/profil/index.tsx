import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  Animated,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const MessageWithReactions = ({ message, onReaction }: { message: string; onReaction?: (emoji: string) => void }) => {
  const [showEmojiWindow, setShowEmojiWindow] = useState(false);
  const [emojiWindowPosition, setEmojiWindowPosition] = useState({ x: 0, y: 0 });
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const messageRef = useRef<View>(null);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Emojis de réaction disponibles (comme Messenger)
  const availableReactions = ['👍', '❤️', '😂', '😮', '😢', '😡'];

  const handleLongPress = () => {
    // Mesurer la position du message
    messageRef.current?.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
      // Calculer la position optimale pour la fenêtre emoji
      let emojiX = pageX + width / 2 - 150; // Centrer la fenêtre (300px de large / 2)
      let emojiY = pageY - 60; // Au-dessus du message

      // Vérifier les limites de l'écran
      if (emojiX < 10) emojiX = 10;
      if (emojiX + 300 > screenWidth) emojiX = screenWidth - 310;
      if (emojiY < 50) emojiY = pageY + height + 10; // En dessous si pas de place au-dessus

      setEmojiWindowPosition({ x: emojiX, y: emojiY });
      setShowEmojiWindow(true);

      // Animation d'apparition
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleEmojiSelect = (emoji: string) => {
    setSelectedReaction(emoji);
    hideEmojiWindow();
    onReaction && onReaction(emoji);
  };

  const hideEmojiWindow = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowEmojiWindow(false);
    });
  };

  // PanResponder pour détecter les touches en dehors
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      hideEmojiWindow();
    },
  });

  return (
    <View style={styles.container}>
      {/* Message */}
      <View style={styles.messageContainer}>
        <Pressable
          ref={messageRef}
          onLongPress={handleLongPress}
          delayLongPress={500}
          style={[
            styles.message,
            selectedReaction && styles.messageWithReaction
          ]}
        >
          <Text style={styles.messageText}>{message}</Text>
        </Pressable>
        
        {/* Afficher la réaction sélectionnée */}
        {selectedReaction && (
          <View style={styles.reactionBadge}>
            <Text style={styles.reactionEmoji}>{selectedReaction}</Text>
          </View>
        )}
      </View>

      {/* Modal pour la fenêtre d'emojis */}
      <Modal
        visible={showEmojiWindow}
        transparent={true}
        animationType="none"
        onRequestClose={hideEmojiWindow}
      >
        <View style={styles.modalOverlay} {...panResponder.panHandlers}>
          <Animated.View
            style={[
              styles.emojiWindow,
              {
                left: emojiWindowPosition.x,
                top: emojiWindowPosition.y,
                transform: [{ scale: scaleAnim }],
                opacity: opacityAnim,
              },
            ]}
          >
            {/* Flèche pointant vers le message */}
            <View style={styles.arrow} />
            
            {/* Container des emojis */}
            <View style={styles.emojiContainer}>
              {availableReactions.map((emoji, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.emojiButton}
                  onPress={() => handleEmojiSelect(emoji)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.emoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
              
              {/* Bouton pour plus d'emojis */}
              <TouchableOpacity
                style={styles.moreButton}
                onPress={() => {
                  // Ici vous pouvez ouvrir un sélecteur d'emoji plus complet
                  console.log('Ouvrir plus d\'emojis');
                }}
              >
                <Text style={styles.moreText}>+</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

// Composant d'exemple d'utilisation
const MessengerLikeChat = () => {
  const messages = [
    "Salut ! Comment ça va ?",
    "Super bien merci ! Et toi ?",
    "Ça va très bien aussi 😊",
    "Tu fais quoi ce weekend ?",
  ];

  const handleReaction = (messageIndex: number, emoji: string) => {
    console.log(`Réaction ${emoji} ajoutée au message ${messageIndex}`);
  };

  return (
    <View style={styles.chatContainer}>
      <Text style={styles.title}>Chat avec Réactions Emoji</Text>
      {messages.map((message, index) => (
        <MessageWithReactions
          key={index}
          message={message}
          onReaction={(emoji) => handleReaction(index, emoji)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  messageContainer: {
    position: 'relative',
  },
  message: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 20,
    maxWidth: '80%',
    alignSelf: 'flex-end',
    marginHorizontal: 16,
  },
  messageWithReaction: {
    marginBottom: 20,
  },
  messageText: {
    color: 'white',
    fontSize: 16,
  },
  reactionBadge: {
    position: 'absolute',
    bottom: -10,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  reactionEmoji: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  emojiWindow: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  arrow: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    marginLeft: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'white',
  },
  emojiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emojiButton: {
    padding: 8,
    marginHorizontal: 2,
    borderRadius: 20,
  },
  emoji: {
    fontSize: 24,
  },
  moreButton: {
    padding: 8,
    marginHorizontal: 2,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingTop: 50,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
});

export default MessengerLikeChat;