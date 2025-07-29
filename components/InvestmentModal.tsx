import React, { useState, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  PanResponder,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AgriculturalProject } from '~/hooks/use-project-data';

interface InvestmentModalProps {
  visible: boolean;
  onClose: () => void;
  project: AgriculturalProject | undefined;
  fundingGap: number;
  currentFunding: number;
  onInvestmentComplete: (amount: number) => void;
  user: any;
}

const InvestmentModal: React.FC<InvestmentModalProps> = ({
  visible,
  onClose,
  project,
  fundingGap,
  currentFunding,
  onInvestmentComplete,
  user,
}) => {
  const [investAmount, setInvestAmount] = useState(0);
  const [sliderWidth, setSliderWidth] = useState(300);

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return '0 Ar';
    return new Intl.NumberFormat('fr-MG', {
      style: 'currency',
      currency: 'MGA',
      minimumFractionDigits: 0,
    })
      .format(amount)
      .replace('MGA', 'Ar');
  };

  const handleInvestAmountChange = (value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      setInvestAmount(0);
    } else {
      setInvestAmount(Math.min(Math.max(0, numValue), fundingGap));
    }
  };

  const handleSliderChange = (value: number) => {
    setInvestAmount(Math.round(value));
  };

  // PanResponder pour gérer le slider
  const sliderPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,

    onPanResponderGrant: (evt) => {
      const { locationX } = evt.nativeEvent;
      const percentage = Math.max(0, Math.min(1, locationX / sliderWidth));
      const newAmount = percentage * fundingGap;
      handleSliderChange(newAmount);
    },

    onPanResponderMove: (evt) => {
      const { locationX } = evt.nativeEvent;
      const percentage = Math.max(0, Math.min(1, locationX / sliderWidth));
      const newAmount = percentage * fundingGap;
      handleSliderChange(newAmount);
    },

    onPanResponderRelease: () => {
      // Fin du glissement
    },
  });

  const handleInvest = async () => {
    if (!user) {
      Alert.alert('Erreur', 'Vous devez être connecté pour investir');
      return;
    }
    if (investAmount <= 0) {
      Alert.alert('Erreur', "Le montant de l'investissement doit être supérieur à 0");
      return;
    }

    try {
      // Appeler la fonction de callback pour gérer l'investissement
      onInvestmentComplete(investAmount);

      Alert.alert(
        'Investissement enregistré',
        `Votre investissement de ${formatCurrency(investAmount)} a été enregistré avec succès.`
      );

      // Réinitialiser et fermer
      setInvestAmount(0);
      onClose();
    } catch (error) {
      Alert.alert(
        'Erreur',
        "Une erreur est survenue lors de l'enregistrement de votre investissement"
      );
    }
  };

  const handleModalOpen = () => {
    setInvestAmount(fundingGap);
  };

  React.useEffect(() => {
    if (visible) {
      handleModalOpen();
    }
  }, [visible, fundingGap]);

  if (!project) return null;

  const displayTitle = project.title || 'Projet agricole';
  const displayDescription = project.description || 'Description non disponible';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="border-b border-gray-200 bg-white px-6 py-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-semibold text-gray-900">Investir dans ce projet</Text>
            <TouchableOpacity
              onPress={onClose}
              className="rounded-full p-2"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-6">
            {/* Project Info */}
            <View className="mb-6">
              <Text className="mb-2 text-lg font-semibold text-gray-900">{displayTitle}</Text>
              <Text className="text-base text-gray-600">{displayDescription}</Text>
            </View>

            {/* Funding Details */}
            <View className="mb-8 rounded-xl bg-gray-50 p-6">
              <Text className="mb-4 text-lg font-semibold text-gray-900">
                Détails du financement
              </Text>
              <View className="space-y-3">
                <View className="flex-row justify-between">
                  <Text className="text-base text-gray-600">Objectif de financement:</Text>
                  <Text className="text-base font-semibold text-gray-900">
                    {formatCurrency(project.fundingGoal)}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-base text-gray-600">Déjà financé:</Text>
                  <Text className="text-base font-semibold text-gray-900">
                    {formatCurrency(currentFunding)}
                  </Text>
                </View>
                <View className="h-px bg-gray-200" />
                <View className="flex-row justify-between">
                  <Text className="text-base font-semibold text-gray-800">Reste à financer:</Text>
                  <Text className="text-base font-bold text-green-600">
                    {formatCurrency(fundingGap)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Investment Amount Input */}
            <View className="mb-6">
              <Text className="mb-3 text-lg font-semibold text-gray-900">
                Montant de votre investissement
              </Text>
              <TextInput
                className="rounded-xl border border-gray-300 bg-white px-4 py-4 text-lg"
                placeholder="0"
                keyboardType="numeric"
                value={investAmount.toString()}
                onChangeText={handleInvestAmountChange}
                style={{ fontSize: 18 }}
              />
              <Text className="mt-2 text-sm text-gray-500">
                Montant maximum: {formatCurrency(fundingGap)}
              </Text>
            </View>

            {/* Slider to adjust amount */}
            <View className="mb-8">
              <Text className="mb-4 text-lg font-semibold text-gray-900">Ajuster le montant</Text>

              {/* Interactive Slider */}
              <View className="px-4">
                <View
                  onLayout={(event) => {
                    const { width } = event.nativeEvent.layout;
                    setSliderWidth(width);
                  }}
                  {...sliderPanResponder.panHandlers}
                  style={{
                    height: 50,
                    justifyContent: 'center',
                    paddingVertical: 20,
                  }}>
                  {/* Slider Track */}
                  <View
                    style={{
                      height: 8,
                      backgroundColor: '#e5e7eb',
                      borderRadius: 4,
                      position: 'relative',
                    }}>
                    {/* Slider Progress */}
                    <View
                      style={{
                        height: 8,
                        backgroundColor: '#16a34a',
                        borderRadius: 4,
                        width: `${(investAmount / (fundingGap || 1)) * 100}%`,
                      }}
                    />

                    {/* Slider Thumb */}
                    <View
                      style={{
                        left: `${(investAmount / (fundingGap || 1)) * 100}%`,
                      }}
                      className="absolute -top-2 h-6 w-6 rounded-full border-2 border-white bg-green-600 shadow-sm shadow-black"
                    />
                  </View>
                </View>

                {/* Slider Labels */}
                <View className="mt-3 flex-row justify-end">
                  {/* <Text className="text-sm text-gray-500">0</Text> */}
                  <Text className="text-sm text-gray-500">{formatCurrency(fundingGap)}</Text>
                </View>

                {/* Current Value Display */}
                <View className="mt-6 items-center rounded-xl bg-green-50 py-4">
                  <Text className="text-sm text-green-700">Montant sélectionné</Text>
                  <Text className="text-2xl font-bold text-green-600">
                    {formatCurrency(investAmount)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View className="border-t border-gray-200 bg-white p-6">
          <View className="flex-row gap-4">
            <TouchableOpacity
              onPress={onClose}
              className="h-14 flex-1 rounded-xl border border-gray-300 py-2">
              <Text className="text-center text-lg font-semibold text-gray-700">Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleInvest}
              disabled={investAmount <= 0}
              className={`h-14 flex-1 rounded-xl py-2 ${
                investAmount <= 0 ? 'bg-gray-300' : 'bg-green-600'
              }`}>
              <Text
                className={`text-md px-4 text-center font-semibold ${
                  investAmount <= 0 ? 'text-gray-500' : 'text-white'
                }`}>
                Confirmer l'investissement
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default InvestmentModal;
