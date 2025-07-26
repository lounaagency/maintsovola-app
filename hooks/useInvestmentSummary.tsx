// hooks/useInvestmentSummary.ts
import { useMemo } from "react";

export function useInvestmentSummary({
  totalInvested,
  totalProfit,
  averageROI,
  ongoingProjects,
  completedProjects,
}: {
  totalInvested: number;
  totalProfit: number;
  averageROI: number;
  ongoingProjects: number;
  completedProjects: number;
}) {
  const isPositiveROI = useMemo(() => averageROI >= 0, [averageROI]);

  const formattedTotalInvested = useMemo(
    () =>
      new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "MGA",
      }).format(totalInvested),
    [totalInvested]
  );

  const formattedTotalProfit = useMemo(
    () =>
      new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "MGA",
      }).format(totalProfit),
    [totalProfit]
  );

  return {
    isPositiveROI,
    formattedTotalInvested,
    formattedTotalProfit,
    roiText: `${averageROI.toFixed(2)}%`,
    ongoingProjects,
    completedProjects,
  };
}

