// app/(auth)/login.tsx - Version React Native avec classes supportées
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
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
  const { signIn, loading, resendOTP, isValidEmail, isValidPhone } = useAuth();

  const [formData, setFormData] = useState({
    identifier: '', // Changed from 'email' to 'identifier'
    password: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showResendButton, setShowResendButton] = useState(false);

  const validateIdentifier = (identifier: string) => {
    return isValidEmail(identifier) || isValidPhone(identifier);
  };

  const getIdentifierType = (identifier: string) => {
    if (isValidEmail(identifier)) return 'email';
    if (isValidPhone(identifier)) return 'phone';
    return null;
  };

  const handleIdentifierChange = (value: string) => {
    setFormData((prev) => ({ ...prev, identifier: value }));
    if (errors.identifier && value && validateIdentifier(value)) {
      setErrors((prev) => ({ ...prev, identifier: '' }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setFormData((prev) => ({ ...prev, password: value }));
    if (errors.password && value) {
      setErrors((prev) => ({ ...prev, password: '' }));
    }
  };

  const handleLogin = async () => {
    setErrors({});
    setShowResendButton(false);

    const newErrors: { [key: string]: string } = {};

    if (!formData.identifier) {
      newErrors.identifier = "L'email ou le téléphone est obligatoire";
    } else if (!validateIdentifier(formData.identifier)) {
      newErrors.identifier = "Format d'email ou de téléphone invalide";
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est obligatoire';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await signIn(formData.identifier, formData.password);
    } catch (error: any) {
      console.log('Login error:', error.message);

      if (
        error.message?.includes('Email not confirmed') ||
        error.message?.includes('email') ||
        error.message?.includes('confirm')
      ) {
        // Only show resend button if the identifier is an email
        const identifierType = getIdentifierType(formData.identifier);
        if (identifierType === 'email') {
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
          Alert.alert('Erreur', 'Compte non confirmé. Veuillez contacter le support.');
        }
      } else {
        Alert.alert('Erreur', error.message || 'Erreur lors de la connexion');
      }
    }
  };

  const handleResendConfirmation = async () => {
    try {
      await resendOTP(formData.identifier, 'signup');
      Alert.alert('Code renvoyé', 'Un nouveau code de confirmation a été envoyé à votre email.', [
        {
          text: 'Vérifier maintenant',
          onPress: () =>
            router.push(
              `/(auth)/verify-otp?email=${encodeURIComponent(formData.identifier)}&type=signup`
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

  const getPlaceholderText = () => {
    return 'votre@email.com ou 03XXXXXXXX';
  };

  const getInputKeyboardType = () => {
    const identifierType = getIdentifierType(formData.identifier);
    if (identifierType === 'phone') return 'phone-pad';
    return 'email-address';
  };

  return (
    <SafeAreaView className="flex-1 bg-green-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View className="flex-1 px-6 pt-12">
            {/* Header avec logo et titre */}
            <View className="mb-12 items-center">
              <View className="mb-6">
                <Logo size="lg" />
              </View>
              <Text className="mb-2 text-3xl font-bold text-gray-900">Bienvenue !</Text>
              <Text className="text-center text-gray-600">
                Connectez-vous à votre compte Mamboly Harena
              </Text>
            </View>

            {/* Formulaire de connexion */}
            <View className="rounded-3xl border border-gray-100 bg-white p-8">
              <View style={{ gap: 24 }}>
                {/* Champ Email ou Téléphone */}
                <View>
                  <Label className="mb-2 font-medium text-gray-700">Email ou Téléphone</Label>
                  <Input
                    value={formData.identifier}
                    onChangeText={handleIdentifierChange}
                    placeholder={getPlaceholderText()}
                    keyboardType={getInputKeyboardType()}
                    autoCapitalize="none"
                    error={!!errors.identifier}
                    className={`rounded-xl border-gray-200 bg-gray-50 px-4 py-4 text-gray-900 ${
                      errors.identifier ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.identifier && (
                    <View className="mt-2 flex-row items-center">
                      <Ionicons name="alert-circle" size={16} color="#ef4444" />
                      <Text className="ml-1 text-sm text-red-500">{errors.identifier}</Text>
                    </View>
                  )}
                  {/* Helper text */}
                  <Text className="mt-1 text-xs text-gray-500">
                    Utilisez votre adresse email ou votre numéro de téléphone 
                  </Text>
                </View>

                {/* Champ Mot de passe */}
                <View>
                  <Label className="mb-2 font-medium text-gray-700">Mot de passe</Label>
                  <View className="relative">
                    <Input
                      value={formData.password}
                      onChangeText={handlePasswordChange}
                      placeholder="••••••••"
                      secureTextEntry={!showPassword}
                      error={!!errors.password}
                      className={`rounded-xl border-gray-200 bg-gray-50 px-4 py-4 pr-12 text-gray-900 ${
                        errors.password ? 'border-red-500' : ''
                      }`}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-4">
                      <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#64748b" />
                    </TouchableOpacity>
                  </View>
                  {errors.password && (
                    <View className="mt-2 flex-row items-center">
                      <Ionicons name="alert-circle" size={16} color="#ef4444" />
                      <Text className="ml-1 text-sm text-red-500">{errors.password}</Text>
                    </View>
                  )}
                </View>

                {/* Bouton de connexion */}
                <Button
                  onPress={handleLogin}
                  loading={loading}
                  className="rounded-xl bg-green-600 py-4">
                  <Text className="text-center text-lg font-semibold text-white">
                    {loading ? 'Connexion...' : 'Se connecter'}
                  </Text>
                </Button>

                {/* Lien mot de passe oublié */}
                <View className="items-center pt-2">
                  <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
                    <Text className="font-medium text-green-600">Mot de passe oublié ?</Text>
                  </TouchableOpacity>
                </View>

                {/* Bouton renvoyer code de confirmation */}
                {showResendButton && (
                  <View className="items-center border-t border-gray-100 pt-2">
                    <TouchableOpacity
                      onPress={handleResendConfirmation}
                      className="mt-2 rounded-lg bg-yellow-50 px-4 py-2">
                      <Text className="text-sm font-medium text-yellow-700">
                        Renvoyer le code de confirmation
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            {/* Lien vers inscription */}
            <View className="mt-8 items-center">
              <Text className="text-center text-gray-600">
                Pas encore inscrit ?{' '}
                <Link href="/(auth)/register" className="font-semibold text-green-600">
                  Créer un compte
                </Link>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
