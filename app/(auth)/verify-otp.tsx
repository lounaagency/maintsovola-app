// app/(auth)/verify-otp.tsx - Version React Native avec classes supportées
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Logo } from '../../components/Logo';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';

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
  const inputRefs = useRef<TextInput[]>([]);

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
      Alert.alert('Erreur', error.message || 'Code de vérification invalide');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    setIsResending(true);

    try {
      await resendOTP(email, type);
      Alert.alert('Code renvoyé', 'Un nouveau code a été envoyé à votre email');
      setResendTimer(60);
      // Clear current OTP
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de renvoyer le code');
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-center text-red-500">Email manquant</Text>
        <Button onPress={() => router.replace('/(auth)/register')} className="mt-4">
          Retour à l&apos;inscription
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <View className="flex-1 justify-center px-6">
          {/* Header avec bouton retour */}
          <View className="mb-8 flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2">
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <View className="flex-1 items-center mr-6">
              <Logo size="lg" />
            </View>
          </View>

          <View className="rounded-lg border border-gray-200 bg-white p-6">
            <Text className="mb-2 text-center text-2xl font-bold text-gray-900">
              Vérification OTP
            </Text>

            <Text className="mb-8 text-center text-gray-600">
              Un code à 6 chiffres a été envoyé à {'\n'}
              <Text className="font-medium text-gray-900">{email}</Text>
            </Text>

            <View className="mb-8 flex-row justify-center">
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    if (ref) {
                      inputRefs.current[index] = ref;
                    }
                  }}
                  className="h-14 w-12 mx-1 rounded-lg border-2 border-gray-300 text-center text-lg font-bold"
                  style={{
                    borderColor: digit ? '#10B981' : '#D1D5DB',
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
                />
              ))}
            </View>

            <Button onPress={handleVerifyOTP} loading={isSubmitting} className="mb-4">
              {isSubmitting ? 'Vérification...' : 'Vérifier le code'}
            </Button>

            <View className="items-center">
              <Text className="mb-2 text-sm text-gray-600">
                Vous n&apos;avez pas reçu le code ?
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
                <Text className="text-sm text-gray-600">Modifier l&apos;adresse email</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}