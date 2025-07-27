// app/(auth)/forgot-password.tsx
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Logo } from '../../components/Logo';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { useAuth } from '../../contexts/AuthContext';

export default function ForgotPasswordScreen() {
  const { resendOTP } = useAuth();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
      Alert.alert('Erreur', error.message || "Impossible d'envoyer le code de réinitialisation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-1 justify-center px-6 py-12">
            {/* Header avec bouton retour */}
            <View className="mb-8 flex-row items-center">
              <TouchableOpacity onPress={() => router.back()} className="-ml-2 mr-4 p-2">
                <Ionicons name="arrow-back" size={24} color="#374151" />
              </TouchableOpacity>
              <View className="-mr-10 flex-1 items-center">
                <Logo size="lg" />
              </View>
            </View>

            <View className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <Text className="mb-2 text-center text-2xl font-bold text-gray-900">
                Mot de passe oublié
              </Text>

              <Text className="mb-6 text-center text-gray-600">
                Saisissez votre adresse email pour recevoir un code de réinitialisation
              </Text>

              <View className="flex gap-6">
                <View>
                  <Label>
                    Adresse email <Text className="text-red-500">*</Text>
                  </Label>
                  <Input
                    value={email}
                    onChangeText={handleEmailChange}
                    placeholder="votre@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={!!errors.email}
                  />
                  {errors.email && (
                    <Text className="mt-1 text-sm text-red-500">{errors.email}</Text>
                  )}
                </View>

                <Button onPress={handleSendResetCode} loading={isSubmitting}>
                  {isSubmitting ? 'Envoi en cours...' : 'Envoyer le code'}
                </Button>

                <View className="pt-4 text-center">
                  <Text className="text-sm text-gray-600">
                    Vous vous souvenez de votre mot de passe ?{' '}
                    <Link href="/(auth)/login" className="font-medium text-green-600">
                      Se connecter
                    </Link>
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
