// components/InvestmentSummary.tsx
import React from "react";
import { View, Text, ScrollView, Dimensions } from "react-native";
import { PieChart } from "react-native-chart-kit";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
} from "lucide-react-native";
import { useInvestmentSummary } from "../hooks/useInvestmentSummary";

interface InvestmentSummaryProps {
  totalInvested: number;
  totalProfit: number;
  averageROI: number;
  ongoingProjects: number;
  completedProjects: number;
  projectsByStatusData: { name: string; value: number; color: string }[];
}

const screenWidth = Dimensions.get("window").width;

export default function InvestmentSummary({
  totalInvested,
  totalProfit,
  averageROI,
  ongoingProjects,
  completedProjects,
  projectsByStatusData,
}: InvestmentSummaryProps) {
  const {
    isPositiveROI,
    formattedTotalInvested,
    formattedTotalProfit,
    roiText,
  } = useInvestmentSummary({
    totalInvested,
    totalProfit,
    averageROI,
    ongoingProjects,
    completedProjects,
  });

  return (
    <ScrollView className="space-y-5 p-5">
      <Text className="text-xl font-bold mb-3">
        Vue d{"'"}ensemble des investissements
      </Text>

      {/* Cartes */}
      <View className="flex flex-wrap flex-col justify-between">
        {/* Total Investi */}
        <View className="border border-gray-300 rounded-xl p-5 w-full mb-5">
          <Text className="text-gray-600 text-base mb-1">Total investi</Text>
          <Text className="text-xl font-bold">{formattedTotalInvested}</Text>
        </View>

        {/* Bénéfice estimé */}
        <View className="border border-gray-300 rounded-xl p-5 w-full mb-5">
          <Text className="text-gray-600 text-base mb-1">Bénéfice estimé</Text>
          <View className="flex-row items-center gap-2">
            {isPositiveROI ? (
              <TrendingUp size={20} color="green" className="mr-2" />
            ) : (
              <TrendingDown size={20} color="red" className="mr-2" />
            )}
            <Text className="text-xl font-bold">{formattedTotalProfit}</Text>
          </View>
        </View>

        {/* ROI Moyen */}
        <View className="border border-gray-300 rounded-xl p-5 w-full mb-5 flex items-between">
          <Text className="text-gray-600 text-base mb-1">ROI moyen</Text>
          <View className="flex-row items-center gap-2">
            {isPositiveROI ? (
              <TrendingUp size={20} color="green" className="mr-2" />
            ) : (
              <TrendingDown size={20} color="red" className="mr-2" />
            )}
            <Text
              className={`text-xl font-bold ${
                isPositiveROI ? "text-green-600" : "text-red-500"
              }`}
            >
              {roiText}
            </Text>
          </View>
        </View>

        {/* Statut des projets */}
        <View className="border border-gray-300 rounded-xl p-5 w-full mb-5">
          <Text className="text-gray-600 text-base mb-1">Statut des projets</Text>
          <View className="mt-1 flex-row gap-4 flex-wrap">
            <View className="flex-row items-center mb-1  gap-2">
              <Clock size={18} color="blue" className="mr-2" />
              <Text className="text-base">{ongoingProjects} en cours</Text>
            </View>
            <View className="flex-row items-center  gap-2">
              <CheckCircle2 size={18} color="green" className="mr-2" />
              <Text className="text-base">{completedProjects} terminés</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Graphique */}
      <View className="border border-gray-300 rounded-xl p-5">
        <Text className="font-bold text-lg mb-1">
          Répartition des investissements
        </Text>
        <Text className="text-gray-600 text-sm mb-4">Par statut de projet</Text>

        <View className="flex-row flex-wrap justify-center">
          <PieChart
            data={projectsByStatusData.map((item) => ({
              name: item.name,
              population: Number(item.value),
              color: item.color,
              legendFontColor: "#333",
              legendFontSize: 14,
            }))}
            width={screenWidth / 1.2}   // réduit légèrement pour s'adapter
            height={220}
            chartConfig={{
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              color: () => "#000",
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            center={[0, 0]}
            absolute
          />
        </View>
      </View>
    </ScrollView>
  );
}
