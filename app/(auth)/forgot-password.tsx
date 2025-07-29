// app/(auth)/forgot-password.tsx - Style harmonisé avec login.tsx
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { useState, useRef } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Logo } from '../../components/Logo';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function ForgotPasswordScreen() {
  const { resendOTP } = useAuth();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

  // Animation d'entrée
  useState(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const animateButtonPress = () => {
    Animated.sequence([
      Animated.timing(buttonScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    // Supprimer l'erreur en temps réel si l'email devient valide
    if (errors.email && value && validateEmail(value)) {
      setErrors((prev) => ({ ...prev, email: '' }));
    }
  };

  const handleSendResetCode = async () => {
    const newErrors: { [key: string]: string } = {};

    if (!email.trim()) {
      newErrors.email = "L'email est obligatoire";
    } else if (!validateEmail(email)) {
      newErrors.email = "Format d'email invalide";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    animateButtonPress();

    try {
      await resendOTP(email, 'recovery');

      Alert.alert(
        'Code envoyé !',
        'Un code de réinitialisation a été envoyé à votre adresse email.',
        [
          {
            text: 'OK',
            onPress: () =>
              router.push({
                pathname: '/(auth)/verify-otp',
                params: {
                  email: email,
                  type: 'recovery',
                },
              }),
          },
        ]
      );
    } catch (error: any) {
      const newErrors: { [key: string]: string } = {};
      
      if (error?.message) {
        if (error.message.includes('Network') || error.message.includes('network')) {
          newErrors.email = 'Problème de connexion réseau.';
        } else if (error.message.includes('rate limit') || error.message.includes('too many')) {
          newErrors.email = 'Trop de tentatives. Patientez avant de réessayer.';
        } else if (error.message.includes('User not found') || error.message.includes('not found')) {
          newErrors.email = 'Aucun compte associé à cet email.';
        } else {
          newErrors.email = error.message;
        }
      } else {
        newErrors.email = "Impossible d'envoyer le code de réinitialisation";
      }
      
      setErrors(newErrors);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Background Decorative Elements - Identique à login.tsx */}
      <View className="absolute inset-0">
        {/* Top-right corner cluster */}
        <View className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-green-100 opacity-30" />
        <View className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-green-200 opacity-40" />
        <View className="absolute -top-4 right-4 h-12 w-12 bg-green-300 opacity-25" />
        <View className="absolute right-12 top-8 h-8 w-8 rotate-45 rounded bg-green-400 opacity-35" />
        <View className="absolute -right-4 top-12 h-20 w-6 rotate-12 rounded-lg bg-green-200 opacity-30" />
        <View className="absolute right-8 top-20 h-6 w-6 rounded-full bg-green-500 opacity-20" />

        {/* Rectangle middle-left */}
        <View className="absolute -left-8 top-1/3 h-24 w-16 rotate-12 rounded-lg bg-green-200 opacity-20" />

        {/* Small circle middle-right */}
        <View className="absolute right-8 top-1/2 h-12 w-12 rounded-full bg-green-300 opacity-25" />

        {/* Square bottom-left */}
        <View className="absolute bottom-32 left-4 h-20 w-20 rotate-45 rounded-lg bg-green-100 opacity-30" />

        {/* Rectangle bottom-right */}
        <View className="absolute -bottom-8 -right-4 h-40 w-24 rotate-45 rounded-2xl bg-green-200 opacity-20" />

        {/* Additional small elements */}
        <View className="absolute left-1/3 top-20 h-8 w-8 rounded-full bg-green-400 opacity-15" />
        <View className="absolute bottom-1/4 right-1/4 h-16 w-6 rotate-12 rounded bg-green-300 opacity-20" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          
          <Animated.View 
            className="relative z-10 flex-1 px-6 pt-8"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}>
            
            {/* Back Button */}
            <TouchableOpacity 
              onPress={() => router.back()}
              className="mb-8 w-10">
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>

            {/* Header */}
            <View className="mb-8 items-center">
              <View className="mb-4 flex-row items-center">
                <Text className="ml-3 text-3xl font-bold text-gray-900">
                  Mot de passe oublié
                </Text>
              </View>
              <Text className="text-center text-gray-600">
                Saisissez votre adresse email pour recevoir un code de réinitialisation
              </Text>
            </View>

            {/* Form */}
            <View style={{ gap: 20 }}>
              {/* Email Field */}
              <View>
                <Label className="mb-2 text-sm font-semibold text-gray-700">
                  Adresse email <Text className="text-red-400">*</Text>
                </Label>
                <Input
                  value={email}
                  onChangeText={handleEmailChange}
                  placeholder="votre@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={!!errors.email}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                  className={`bg-gray-100 px-4 py-4 text-gray-900 ${
                    errors.email ? 'border-red-500' : 
                    focusedInput === 'email' ? 'border-green-500' : 'border-gray-300'
                  }`}
                  style={{
                    borderRadius: 20,
                    borderWidth: focusedInput === 'email' ? 2 : 1,
                  }}
                  placeholderTextColor="#9ca3af"
                />
                {errors.email && (
                  <View className="mt-1 flex-row items-start">
                    <Ionicons name="alert-circle" size={16} color="#DC2626" style={{ marginTop: 1 }} />
                    <Text className="ml-1 flex-1 text-sm text-red-500 leading-5">{errors.email}</Text>
                  </View>
                )}
              </View>

              {/* Send Button */}
              <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
                <Button
                  onPress={handleSendResetCode}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  className={`mt-4 py-5 shadow-lg ${isSubmitting ? 'bg-green-400' : 'bg-green-600'}`}
                  style={{
                    borderRadius: 25,
                  }}>
                  <Text className="text-center text-lg font-medium text-white">
                    {isSubmitting ? 'Envoi en cours...' : 'Envoyer le code'}
                  </Text>
                </Button>
              </Animated.View>

              {/* Back to Login Link */}
              <View className="mt-4 items-center">
                <Text className="text-center text-gray-600">
                  Vous vous souvenez de votre mot de passe ?{' '}
                  <Link href="/(auth)/login" className="font-semibold text-green-600">
                    Se connecter
                  </Link>
                </Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}