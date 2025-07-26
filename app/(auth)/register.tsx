// app/(auth)/register.tsx - Version mise à jour
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
import { Checkbox } from '../../components/ui/Checkbox';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { useAuth } from '../../contexts/AuthContext';

// Interface pour les critères de validation du mot de passe
interface PasswordCriteria {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    nom: '',
    prenoms: '',
    email: '',
    telephone: '',
    password: '',
    confirmPassword: '',
    isInvestor: false,
    isFarmingOwner: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordCriteria, setPasswordCriteria] = useState<PasswordCriteria>({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^(032|033|034|038)\d{7}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validatePasswordCriteria = (password: string): PasswordCriteria => {
    return {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };
  };

  const isPasswordRobust = (criteria: PasswordCriteria): boolean => {
    return Object.values(criteria).every(Boolean);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est obligatoire';
    }

    if (!formData.email.trim() && !formData.telephone.trim()) {
      newErrors.email = 'Au moins un email ou un numéro de téléphone est obligatoire';
      newErrors.telephone = 'Au moins un email ou un numéro de téléphone est obligatoire';
    }

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    if (formData.telephone && !validatePhone(formData.telephone)) {
      newErrors.telephone = 'Format de téléphone invalide (032XXXXXXX)';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est obligatoire';
    } else if (!isPasswordRobust(passwordCriteria)) {
      newErrors.password = 'Le mot de passe ne respecte pas tous les critères de sécurité';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    return newErrors;
  };

  const handleSubmit = async () => {
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const userData = {
        nom: formData.nom,
        prenoms: formData.prenoms,
        email: formData.email || undefined,
        telephone: formData.telephone || undefined,
        is_investor: formData.isInvestor,
        is_farming_owner: formData.isFarmingOwner,
        role: 'simple',
      };

      const user = await signUp(formData.email || formData.telephone, formData.password, userData);

      // Check if email was provided for signup and user was created
      if (formData.email && user) {
        Alert.alert(
          'Inscription réussie !',
          'Un code de vérification a été envoyé à votre email.',
          [
            {
              text: 'OK',
              onPress: () =>
                router.push({
                  pathname: '/(auth)/verify-otp',
                  params: {
                    email: formData.email,
                    type: 'signup',
                  },
                }),
            },
          ]
        );
      } else {
        // Phone signup or no email - redirect to login
        Alert.alert('Inscription réussie !', 'Votre compte a été créé avec succès.', [
          {
            text: 'OK',
            onPress: () => router.replace('/(auth)/login'),
          },
        ]);
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message || "Une erreur est survenue lors de l'inscription");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Validation en temps réel et suppression des erreurs
    if (field === 'nom' && value.trim() && errors.nom) {
      setErrors((prev) => ({ ...prev, nom: '' }));
    }

    if (field === 'email') {
      if (value && validateEmail(value) && errors.email) {
        setErrors((prev) => ({ ...prev, email: '' }));
      }
      // Si email est rempli et telephone avait une erreur, la supprimer
      if (value && errors.telephone?.includes('Au moins un')) {
        setErrors((prev) => ({ ...prev, telephone: '' }));
      }
    }

    if (field === 'telephone') {
      if (value && validatePhone(value) && errors.telephone) {
        setErrors((prev) => ({ ...prev, telephone: '' }));
      }
      // Si telephone est rempli et email avait une erreur, la supprimer
      if (value && errors.email?.includes('Au moins un')) {
        setErrors((prev) => ({ ...prev, email: '' }));
      }
    }

    if (field === 'password') {
      const criteria = validatePasswordCriteria(value);
      setPasswordCriteria(criteria);

      if (value && isPasswordRobust(criteria) && errors.password) {
        setErrors((prev) => ({ ...prev, password: '' }));
      }
    }

    if (field === 'confirmPassword') {
      if (value && value === formData.password && errors.confirmPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: '' }));
      }
    }
  };

  // Composant pour afficher les critères de sécurité
  const CriteriaItem = ({ met, text }: { met: boolean; text: string }) => (
    <View className="mb-1 flex-row items-center">
      <Ionicons
        name={met ? 'checkmark-circle' : 'close-circle'}
        size={16}
        color={met ? '#10B981' : '#EF4444'}
      />
      <Text className={`ml-2 text-sm ${met ? 'text-green-600' : 'text-red-500'}`}>{text}</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-1 justify-center px-6 py-12">
            <View className="mb-8 items-center">
              <Logo size="lg" />
            </View>

            <View className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <Text className="mb-6 text-center text-2xl font-bold text-gray-900">Inscription</Text>

              <View className="flex gap-4">
                <View>
                  <Label>
                    Nom <Text className="text-red-500">*</Text>
                  </Label>
                  <Input
                    value={formData.nom}
                    onChangeText={(value) => updateFormData('nom', value)}
                    placeholder="Votre nom"
                    error={!!errors.nom}
                  />
                  {errors.nom && <Text className="mt-1 text-sm text-red-500">{errors.nom}</Text>}
                </View>

                <View>
                  <Label>Prénoms</Label>
                  <Input
                    value={formData.prenoms}
                    onChangeText={(value) => updateFormData('prenoms', value)}
                    placeholder="Vos prénoms"
                  />
                </View>

                <View>
                  <Label>
                    Email {!formData.telephone && <Text className="text-red-500">*</Text>}
                  </Label>
                  <Input
                    value={formData.email}
                    onChangeText={(value) => updateFormData('email', value)}
                    placeholder="votre@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={!!errors.email}
                  />
                  {errors.email && (
                    <Text className="mt-1 text-sm text-red-500">{errors.email}</Text>
                  )}
                </View>

                <View>
                  <Label>
                    Téléphone {!formData.email && <Text className="text-red-500">*</Text>}
                  </Label>
                  <Input
                    value={formData.telephone}
                    onChangeText={(value) => updateFormData('telephone', value)}
                    placeholder="032 00 000 00"
                    keyboardType="phone-pad"
                    error={!!errors.telephone}
                  />
                  {errors.telephone && (
                    <Text className="mt-1 text-sm text-red-500">{errors.telephone}</Text>
                  )}
                  <Text className="mt-1 text-xs text-gray-500">
                    Format: 032XXXXXXX ou 033XXXXXXX
                  </Text>
                </View>

                <View>
                  <Label>
                    Mot de passe <Text className="text-red-500">*</Text>
                  </Label>
                  <View className="relative">
                    <Input
                      value={formData.password}
                      onChangeText={(value) => updateFormData('password', value)}
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

                  {/* Critères de sécurité */}
                  {formData.password && (
                    <View className="mt-3 rounded-lg bg-gray-50 p-3">
                      <Text className="mb-2 text-sm font-medium text-gray-700">
                        Critères de sécurité :
                      </Text>
                      <CriteriaItem met={passwordCriteria.minLength} text="Au moins 8 caractères" />
                      <CriteriaItem
                        met={passwordCriteria.hasUppercase}
                        text="Une lettre majuscule"
                      />
                      <CriteriaItem
                        met={passwordCriteria.hasLowercase}
                        text="Une lettre minuscule"
                      />
                      <CriteriaItem met={passwordCriteria.hasNumber} text="Un chiffre" />
                      <CriteriaItem
                        met={passwordCriteria.hasSpecialChar}
                        text="Un caractère spécial (!@#$%^&*)"
                      />
                    </View>
                  )}
                </View>

                <View>
                  <Label>
                    Confirmer mot de passe <Text className="text-red-500">*</Text>
                  </Label>
                  <View className="relative">
                    <Input
                      value={formData.confirmPassword}
                      onChangeText={(value) => updateFormData('confirmPassword', value)}
                      placeholder="********"
                      secureTextEntry={!showConfirmPassword}
                      error={!!errors.confirmPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3">
                      <Ionicons
                        name={showConfirmPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color="#6B7280"
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.confirmPassword && (
                    <Text className="mt-1 text-sm text-red-500">{errors.confirmPassword}</Text>
                  )}
                </View>

                <View className="pt-2">
                  <Label>Pourquoi rejoindre Maintso Vola ?</Label>
                  <View className="mt-2 flex gap-2">
                    <Checkbox
                      checked={formData.isInvestor}
                      onPress={() => updateFormData('isInvestor', !formData.isInvestor)}
                      label="Je souhaite investir dans l'agriculture"
                    />
                    <Checkbox
                      checked={formData.isFarmingOwner}
                      onPress={() => updateFormData('isFarmingOwner', !formData.isFarmingOwner)}
                      label="Je cherche des investisseurs pour mon projet agricole"
                    />
                  </View>
                </View>

                <Button
                  onPress={handleSubmit}
                  loading={isSubmitting}
                  disabled={!!formData.password && !isPasswordRobust(passwordCriteria)}>
                  {isSubmitting ? 'Inscription en cours...' : "S'inscrire"}
                </Button>

                <View className="pt-4 text-center">
                  <Text className="text-sm text-gray-600">
                    Déjà un compte ?{' '}
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
