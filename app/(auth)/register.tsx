// app/(auth)/register.tsx - Version moderne multi-étapes
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
import { Checkbox } from '../../components/ui/Checkbox';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { useAuth } from '../../contexts/AuthContext';

interface PasswordCriteria {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

const STEPS = [
  {
    title: 'Informations personnelles',
    description: 'Commençons par vos informations de base',
    icon: 'person-outline' as const,
  },
  {
    title: 'Contact',
    description: 'Comment pouvons-nous vous joindre ?',
    icon: 'mail-outline' as const,
  },
  {
    title: 'Sécurité',
    description: 'Créez un mot de passe sécurisé',
    icon: 'shield-checkmark-outline' as const,
  },
];

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
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

  const validateCurrentStep = () => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 0:
        if (!formData.nom.trim()) {
          newErrors.nom = 'Le nom est obligatoire';
        }
        break;

      case 1:
        // Email is required for authentication
        if (!formData.email.trim()) {
          newErrors.email = "L'email est obligatoire pour l'inscription";
        } else if (!validateEmail(formData.email)) {
          newErrors.email = "Format d'email invalide";
        }

        // Phone validation - clean the phone number before validation
        if (formData.telephone) {
          const cleanPhone = formData.telephone.replace(/\s/g, '');
          if (!validatePhone(cleanPhone)) {
            newErrors.telephone = 'Format de téléphone invalide (032XXXXXXX, 033XXXXXXX, 034XXXXXXX, 038XXXXXXX)';
          }
        }
        break;

      case 2:
        if (!formData.password) {
          newErrors.password = 'Le mot de passe est obligatoire';
        } else if (!isPasswordRobust(passwordCriteria)) {
          newErrors.password = 'Le mot de passe ne respecte pas tous les critères';
        }

        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
        }
        break;
    }

    return newErrors;
  };

  const handleNext = () => {
    const stepErrors = validateCurrentStep();
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setErrors({});
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    const stepErrors = validateCurrentStep();
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const userData = {
        nom: formData.nom,
        prenoms: formData.prenoms,
        email: formData.email,
        telephone: formData.telephone || undefined,
        is_investor: formData.isInvestor,
        is_farming_owner: formData.isFarmingOwner,
        role: 'simple',
      };

      // Always use email as the primary identifier for Supabase Auth
      const user = await signUp(formData.email, formData.password, userData);

      if (user) {
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
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message || "Une erreur est survenue lors de l'inscription");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Validation en temps réel
    if (field === 'nom' && value.trim() && errors.nom) {
      setErrors((prev) => ({ ...prev, nom: '' }));
    }

    if (field === 'email') {
      if (value && validateEmail(value) && errors.email) {
        setErrors((prev) => ({ ...prev, email: '' }));
      }
    }

    if (field === 'telephone') {
      if (value) {
        const cleanPhone = value.replace(/\s/g, '');
        if (validatePhone(cleanPhone) && errors.telephone) {
          setErrors((prev) => ({ ...prev, telephone: '' }));
        }
      } else {
        // Clear error if field is empty (since telephone is optional)
        if (errors.telephone) {
          setErrors((prev) => ({ ...prev, telephone: '' }));
        }
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

  const CriteriaItem = ({ met, text }: { met: boolean; text: string }) => (
    <View className="mb-1 flex-row items-center">
      <View
        className={`mr-2 h-4 w-4 items-center justify-center rounded-full ${
          met ? 'bg-success-500' : 'bg-error-500'
        }`}>
        <Ionicons name={met ? 'checkmark' : 'close'} size={10} color="white" />
      </View>
      <Text className={`text-sm ${met ? 'text-success-700' : 'text-error-600'}`}>{text}</Text>
    </View>
  );

  const ProgressIndicator = () => (
    <View className="mb-8 flex-row items-center justify-center">
      {STEPS.map((step, index) => (
        <View key={index} className="flex-row items-center">
          <View
            className={`h-10 w-10 items-center justify-center rounded-full border-2 ${
              index <= currentStep
                ? 'border-primary-500 bg-primary-500'
                : 'border-secondary-300 bg-secondary-100'
            }`}>
            {index < currentStep ? (
              <Ionicons name="checkmark" size={20} color="white" />
            ) : (
              <Text
                className={`font-semibold ${
                  index <= currentStep ? 'text-white' : 'text-secondary-500'
                }`}>
                {index + 1}
              </Text>
            )}
          </View>
          {index < STEPS.length - 1 && (
            <View
              className={`mx-2 h-1 w-12 rounded-full ${
                index < currentStep ? 'bg-primary-500' : 'bg-secondary-200'
              }`}
            />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={{ gap: 24 }}>
            <View>
              <Label className="mb-2 font-medium text-gray-700">
                Nom <Text className="text-red-500">*</Text>
              </Label>
              <Input
                value={formData.nom}
                onChangeText={(value) => updateFormData('nom', value)}
                placeholder="Votre nom"
                error={!!errors.nom}
                className={`rounded-xl border-gray-200 bg-gray-50 px-4 py-4 ${
                  errors.nom ? 'border-red-500' : 'focus:border-primary-500'
                }`}
              />
              {errors.nom && <Text className="mt-2 text-sm text-red-500">{errors.nom}</Text>}
            </View>

            <View>
              <Label className="mb-2 font-medium text-gray-700">Prénoms</Label>
              <Input
                value={formData.prenoms}
                onChangeText={(value) => updateFormData('prenoms', value)}
                placeholder="Vos prénoms"
                className="rounded-xl border-gray-200 bg-gray-50 px-4 py-4 focus:border-primary-500"
              />
            </View>
          </View>
        );

      case 1:
        return (
          <View className="space-y-6">
            <View>
              <Label className="mb-2 font-medium text-secondary-700">
                Email <Text className="text-error-500">*</Text>
              </Label>
              <Input
                value={formData.email}
                onChangeText={(value) => updateFormData('email', value)}
                placeholder="votre@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                error={!!errors.email}
                className={`rounded-xl border-secondary-200 bg-secondary-50 px-4 py-4 ${
                  errors.email ? 'border-error-500' : 'focus:border-primary-500'
                }`}
              />
              {errors.email && <Text className="mt-2 text-sm text-error-500">{errors.email}</Text>}
              <Text className="mt-1 text-xs text-secondary-500">
                L&apos;email est requis pour la vérification du compte
              </Text>
            </View>

            <View>
              <Label className="mb-2 font-medium text-secondary-700">Téléphone (optionnel)</Label>
              <Input
                value={formData.telephone}
                onChangeText={(value) => updateFormData('telephone', value)}
                placeholder="032 00 000 00"
                keyboardType="phone-pad"
                error={!!errors.telephone}
                className={`rounded-xl border-secondary-200 bg-secondary-50 px-4 py-4 ${
                  errors.telephone ? 'border-error-500' : 'focus:border-primary-500'
                }`}
              />
              {errors.telephone && (
                <Text className="mt-2 text-sm text-error-500">{errors.telephone}</Text>
              )}
              <Text className="mt-1 text-xs text-secondary-500">
                Formats acceptés: 032XXXXXXX, 033XXXXXXX, 034XXXXXXX, 038XXXXXXX
              </Text>
            </View>
          </View>
        );

      case 2:
        return (
          <View className="space-y-6">
            <View>
              <Label className="mb-2 font-medium text-secondary-700">
                Mot de passe <Text className="text-error-500">*</Text>
              </Label>
              <View className="relative">
                <Input
                  value={formData.password}
                  onChangeText={(value) => updateFormData('password', value)}
                  placeholder="••••••••"
                  secureTextEntry={!showPassword}
                  error={!!errors.password}
                  className={`rounded-xl border-secondary-200 bg-secondary-50 px-4 py-4 pr-12 ${
                    errors.password ? 'border-error-500' : 'focus:border-primary-500'
                  }`}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4">
                  <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#64748b" />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text className="mt-2 text-sm text-error-500">{errors.password}</Text>
              )}

              {/* Critères de sécurité */}
              {formData.password && (
                <View className="mt-4 rounded-xl border border-secondary-200 bg-secondary-50 p-4">
                  <Text className="mb-3 text-sm font-semibold text-secondary-700">
                    Critères de sécurité :
                  </Text>
                  <CriteriaItem met={passwordCriteria.minLength} text="Au moins 8 caractères" />
                  <CriteriaItem met={passwordCriteria.hasUppercase} text="Une lettre majuscule" />
                  <CriteriaItem met={passwordCriteria.hasLowercase} text="Une lettre minuscule" />
                  <CriteriaItem met={passwordCriteria.hasNumber} text="Un chiffre" />
                  <CriteriaItem
                    met={passwordCriteria.hasSpecialChar}
                    text="Un caractère spécial (!@#$%^&*)"
                  />
                </View>
              )}
            </View>

            <View>
              <Label className="mb-2 font-medium text-secondary-700">
                Confirmer mot de passe <Text className="text-error-500">*</Text>
              </Label>
              <View className="relative">
                <Input
                  value={formData.confirmPassword}
                  onChangeText={(value) => updateFormData('confirmPassword', value)}
                  placeholder="••••••••"
                  secureTextEntry={!showConfirmPassword}
                  error={!!errors.confirmPassword}
                  className={`rounded-xl border-secondary-200 bg-secondary-50 px-4 py-4 pr-12 ${
                    errors.confirmPassword ? 'border-error-500' : 'focus:border-primary-500'
                  }`}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-4">
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="#64748b"
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text className="mt-2 text-sm text-error-500">{errors.confirmPassword}</Text>
              )}
            </View>

            <View className="rounded-xl border border-primary-200 bg-primary-50 p-4">
              <Label className="mb-3 font-medium text-primary-800">
                Pourquoi rejoindre Maintso Vola ?
              </Label>
              <View className="space-y-3">
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
          </View>
        );

      default:
        return null;
    }
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
          <View className="flex-1 px-6 py-8">
            {/* Header */}
            <View className="mb-8 items-center">
              <View className="mb-4">
                <Logo size="lg" />
              </View>
              <Text className="mb-2 text-2xl font-bold text-gray-900">Créer votre compte</Text>
              <Text className="text-center text-gray-600">
                Rejoignez la communauté Mamboly Harena
              </Text>
            </View>

            {/* Formulaire */}
            <View className="rounded-3xl border border-white bg-white p-6 shadow-lg">
              <ProgressIndicator />

              {/* En-tête de l'étape */}
              <View className="mb-8 items-center">
                <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-green-100">
                  <Ionicons name={STEPS[currentStep].icon} size={32} color="#16a34a" />
                </View>
                <Text className="mb-2 text-xl font-bold text-gray-900">
                  {STEPS[currentStep].title}
                </Text>
                <Text className="text-center text-sm text-gray-600">
                  {STEPS[currentStep].description}
                </Text>
              </View>

              {renderStep()}

              {/* Boutons de navigation */}
              <View className="mt-8">
                <View className="flex-row" style={{ gap: 16 }}>
                  {currentStep > 0 && (
                    <TouchableOpacity
                      onPress={handlePrevious}
                      className="flex-1 items-center rounded-xl border border-gray-200 bg-gray-100 py-4">
                      <Text className="font-semibold text-gray-700">Précédent</Text>
                    </TouchableOpacity>
                  )}

                  <View className="flex-1">
                    {currentStep < STEPS.length - 1 ? (
                      <TouchableOpacity
                        onPress={handleNext}
                        className="items-center rounded-xl bg-primary-600 py-4">
                        <Text className="text-lg font-semibold text-white">Suivant</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={
                          isSubmitting ||
                          (!!formData.password && !isPasswordRobust(passwordCriteria))
                        }
                        className={`items-center rounded-xl py-4 ${
                          isSubmitting ||
                          (!!formData.password && !isPasswordRobust(passwordCriteria))
                            ? 'bg-gray-300'
                            : 'bg-primary-600'
                        }`}>
                        <Text className="text-lg font-semibold text-white">
                          {isSubmitting ? 'Inscription en cours...' : "S'inscrire"}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            </View>

            {/* Lien vers connexion */}
            <View className="mt-6 items-center">
              <Text className="text-center text-gray-600">
                Déjà un compte ?{' '}
                <Link href="/(auth)/login" className="font-semibold text-green-600">
                  Se connecter
                </Link>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}