// app/(auth)/verify-otp.tsx - Version harmonisée avec login.tsx
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Logo } from '../../components/Logo';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function VerifyOTPScreen() {
  const { verifyOTP, resendOTP } = useAuth();
  const { email, type = 'signup' } = useLocalSearchParams<{
    email: string;
    type?: 'signup' | 'recovery';
  }>();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showResendSuccess, setShowResendSuccess] = useState(false);
  const inputRefs = useRef<TextInput[]>([]);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const resendButtonAnim = useRef(new Animated.Value(0)).current;

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

  // Start resend timer on mount
  useEffect(() => {
    setResendTimer(60);
  }, []);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

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

  const animateResendButton = (show: boolean) => {
    Animated.timing(resendButtonAnim, {
      toValue: show ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleOtpChange = (value: string, index: number) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    // Handle backspace to move to previous input
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      Alert.alert('Erreur', 'Veuillez saisir le code à 6 chiffres complet');
      return;
    }

    setIsSubmitting(true);
    animateButtonPress();

    try {
      const result = await verifyOTP(email, otpCode, type);

      Alert.alert(
        'Vérification réussie !',
        type === 'signup'
          ? 'Votre compte a été confirmé avec succès.'
          : 'Vous pouvez maintenant réinitialiser votre mot de passe.',
        [
          {
            text: 'OK',
            onPress: () => {
              if (type === 'signup') {
                router.replace('/(auth)/login');
              } else {
                // Pour recovery, rediriger vers reset-password avec les données de session
                router.replace({
                  pathname: '/(auth)/reset-password',
                  params: {
                    email: email,
                    token: result.session?.access_token || 'verified',
                  },
                });
              }
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Erreur', 
        error?.message?.includes('expired') 
          ? 'Code expiré. Demandez un nouveau code.'
          : error?.message?.includes('invalid')
          ? 'Code invalide. Vérifiez le code saisi.'
          : error.message || 'Code de vérification invalide'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    setIsResending(true);
    setSuccessMessage('');
    setShowResendSuccess(false);

    try {
      await resendOTP(email, type);
      
      // Afficher le message de succès
      setSuccessMessage('Code de vérification renvoyé à votre email');
      setShowResendSuccess(true);
      animateResendButton(true);
      
      setResendTimer(60);
      // Clear current OTP
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();

      // Masquer le message après 3 secondes
      setTimeout(() => {
        setShowResendSuccess(false);
        setSuccessMessage('');
        animateResendButton(false);
      }, 3000);
      
    } catch (error: any) {
      Alert.alert(
        'Erreur', 
        error?.message?.includes('rate limit') || error?.message?.includes('too many')
          ? 'Trop de tentatives. Patientez avant de réessayer.'
          : error?.message?.includes('Network') || error?.message?.includes('network')
          ? 'Problème de connexion réseau.'
          : error.message || 'Impossible de renvoyer le code'
      );
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-6">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-red-100">
            <Ionicons name="alert-circle" size={32} color="#DC2626" />
          </View>
          <Text className="mb-4 text-center text-lg font-semibold text-red-500">Email manquant</Text>
          <Text className="mb-6 text-center text-gray-600">
            L'adresse email est nécessaire pour la vérification.
          </Text>
          <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
            <Button 
              onPress={() => router.replace('/(auth)/register')} 
              className="bg-green-600 py-4 px-8"
              style={{ borderRadius: 25 }}>
              <Text className="text-white font-medium">Retour à l'inscription</Text>
            </Button>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

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
            
            {/* Header avec bouton retour */}
            <View className="mb-8 flex-row items-center">
              <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2">
                <Ionicons name="arrow-back" size={24} color="#374151" />
              </TouchableOpacity>
              <View className="flex-1 items-center mr-6">
                <Text className="text-3xl font-bold text-gray-900">Vérification OTP</Text>
              </View>
            </View>

            {/* Message de succès pour le renvoi de code */}
            {showResendSuccess && successMessage ? (
              <Animated.View
                style={{
                  opacity: resendButtonAnim,
                  transform: [
                    {
                      translateY: resendButtonAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                }}
                className="mb-4 rounded-lg bg-green-50 border border-green-200 p-4">
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={20} color="#059669" />
                  <Text className="ml-2 flex-1 text-sm text-green-700">
                    {successMessage}
                  </Text>
                  <View className="ml-2">
                    <Ionicons name="mail" size={16} color="#059669" />
                  </View>
                </View>
              </Animated.View>
            ) : null}

            <View className="rounded-3xl border border-white bg-white p-6 shadow-lg">
              <Text className="mb-8 text-center text-gray-600">
                Un code à 6 chiffres a été envoyé à {'\n'}
                <Text className="font-semibold text-gray-900">{email}</Text>
              </Text>

              {/* OTP Input Fields */}
              <View className="mb-8 flex-row justify-center">
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      if (ref) {
                        inputRefs.current[index] = ref;
                      }
                    }}
                    className="bg-gray-100 text-gray-900 mx-1"
                    style={{
                      height: 56,
                      width: 48,
                      borderRadius: 16,
                      borderWidth: digit ? 2 : 1,
                      borderColor: digit ? '#10B981' : '#D1D5DB',
                      textAlign: 'center',
                      fontSize: 18,
                      fontWeight: 'bold',
                      paddingTop: 0,
                      paddingBottom: 0,
                      textAlignVertical: 'center',
                      includeFontPadding: false,
                    }}
                    value={digit}
                    onChangeText={(value) => handleOtpChange(value, index)}
                    onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    placeholderTextColor="#9ca3af"
                  />
                ))}
              </View>

              {/* Verify Button */}
              <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
                <Button 
                  onPress={handleVerifyOTP} 
                  loading={isSubmitting} 
                  disabled={isSubmitting}
                  className={`mb-4 py-5 shadow-lg ${isSubmitting ? 'bg-green-400' : 'bg-green-600'}`}
                  style={{ borderRadius: 25 }}>
                  <Text className="text-center text-lg font-medium text-white">
                    {isSubmitting ? 'Vérification...' : 'Vérifier le code'}
                  </Text>
                </Button>
              </Animated.View>

              {/* Resend Section */}
              <View className="items-center">
                <Text className="mb-2 text-sm text-gray-600">
                  Vous n'avez pas reçu le code ?
                </Text>

                <TouchableOpacity
                  onPress={handleResendOTP}
                  disabled={resendTimer > 0 || isResending}
                  className={`p-2 ${resendTimer > 0 ? 'opacity-50' : ''}`}>
                  <Text
                    className={`text-sm font-medium ${
                      resendTimer > 0 ? 'text-gray-400' : 'text-green-600'
                    }`}>
                    {isResending
                      ? 'Envoi en cours...'
                      : resendTimer > 0
                        ? `Renvoyer dans ${resendTimer}s`
                        : 'Renvoyer le code'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Change Email Link */}
              <View className="mt-6 border-t border-gray-200 pt-4">
                <TouchableOpacity
                  onPress={() => {
                    if (type === 'recovery') {
                      router.replace('/(auth)/forgot-password');
                    } else {
                      router.replace('/(auth)/register');
                    }
                  }}
                  className="items-center">
                  <Text className="text-sm text-gray-600">Modifier l'adresse email</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}