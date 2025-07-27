// app/(auth)/login.tsx - Version complète mise à jour
import { Logo } from '~/components/Logo';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Label } from '~/components/ui/Label';
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
import { useAuth } from '../../contexts/AuthContext';

export default function LoginScreen() {
  const { signIn, loading, resendOTP } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showResendButton, setShowResendButton] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (value: string) => {
    setFormData((prev) => ({ ...prev, email: value }));
    // Supprimer l'erreur en temps réel si l'email devient valide
    if (errors.email && value && validateEmail(value)) {
      setErrors((prev) => ({ ...prev, email: '' }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setFormData((prev) => ({ ...prev, password: value }));
    // Supprimer l'erreur en temps réel si le mot de passe est saisi
    if (errors.password && value) {
      setErrors((prev) => ({ ...prev, password: '' }));
    }
  };

  const handleLogin = async () => {
    setErrors({});
    setShowResendButton(false);

    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = "L'email est obligatoire";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est obligatoire';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await signIn(formData.email, formData.password);
    } catch (error: any) {
      console.log('Login error:', error.message);

      // Check if the error is related to email confirmation
      if (
        error.message?.includes('Email not confirmed') ||
        error.message?.includes('email') ||
        error.message?.includes('confirm')
      ) {
        setShowResendButton(true);
        Alert.alert(
          'Email non confirmé',
          "Votre email n'a pas encore été confirmé. Veuillez vérifier votre boîte mail ou renvoyer le code de confirmation.",
          [
            {
              text: 'Renvoyer le code',
              onPress: () => handleResendConfirmation(),
            },
            {
              text: 'Annuler',
              style: 'cancel',
            },
          ]
        );
      } else {
        Alert.alert('Erreur', error.message || 'Erreur lors de la connexion');
      }
    }
  };

  const handleResendConfirmation = async () => {
    try {
      await resendOTP(formData.email, 'signup');
      Alert.alert('Code renvoyé', 'Un nouveau code de confirmation a été envoyé à votre email.', [
        {
          text: 'Vérifier maintenant',
          onPress: () =>
            router.push(
              `/(auth)/verify-otp?email=${encodeURIComponent(formData.email)}&type=signup`
            ),
        },
        {
          text: 'Plus tard',
          style: 'cancel',
        },
      ]);
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de renvoyer le code');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-1 justify-center px-6 py-12">
            {/* Logo et titre */}
            <View className="mb-8 items-center">
              <Logo size="lg" />
              <Text className="mt-4 text-center text-gray-600">Mamboly Harena</Text>
            </View>

            {/* Formulaire de connexion */}
            <View className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <Text className="mb-6 text-center text-2xl font-bold text-gray-900">Connexion</Text>

              <View className="flex gap-6">
                {/* Champ Email */}
                <View>
                  <Label>Email</Label>
                  <Input
                    value={formData.email}
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

                {/* Champ Mot de passe */}
                <View>
                  <Label>Mot de passe</Label>
                  <View className="relative">
                    <Input
                      value={formData.password}
                      onChangeText={handlePasswordChange}
                      placeholder="********"
                      secureTextEntry={!showPassword}
                      error={!!errors.password}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3">
                      <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                  {errors.password && (
                    <Text className="mt-1 text-sm text-red-500">{errors.password}</Text>
                  )}
                </View>

                {/* Bouton de connexion */}
                <Button onPress={handleLogin} loading={loading}>
                  {loading ? 'Connexion...' : 'Se connecter'}
                </Button>

                {/* Lien mot de passe oublié */}
                <View className="items-center">
                  <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
                    <Text className="text-sm font-medium text-blue-600">Mot de passe oublié ?</Text>
                  </TouchableOpacity>
                </View>

                {/* Bouton renvoyer code de confirmation (conditionnel) */}
                {showResendButton && (
                  <View className="items-center">
                    <TouchableOpacity onPress={handleResendConfirmation} className="p-2">
                      <Text className="text-sm font-medium text-blue-600">
                        Renvoyer le code de confirmation
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Lien vers inscription */}
                <View className="pt-4 text-center">
                  <Text className="text-sm text-gray-600">
                    Pas encore inscrit ?{' '}
                    <Link href="/(auth)/register" className="font-medium text-green-600">
                      Créer un compte
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
