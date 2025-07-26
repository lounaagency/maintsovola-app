// hooks/useFetchInvestmentData.ts
import { useAsyncState } from './useAsyncState';
import { supabase } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';

interface InvestmentData {
  totalInvested: number;
  totalProfit: number;
  averageROI: number;
  ongoingProjects: number;
  completedProjects: number;
  projectsByStatusData: { 
    name: string; 
    value: number; 
    color: string; 
  }[];
}

async function fetchInvestmentData(userId?: string): Promise<InvestmentData> {
  // if (!userId) {
  //   throw new Error('Utilisateur non authentifié');
  // }

  try {
    // Récupérer tous les investissements de l'utilisateur avec les détails des projets
    const { data: investmentsData, error: investmentsError } = await supabase
      .from('investissement')
      .select(`
        *,
        projet!inner(
          id_projet,
          statut,
          surface_ha,
          titre,
          date_debut_production,
          projet_culture!inner(
            cout_exploitation_previsionnel,
            rendement_previsionnel,
            culture:id_culture(
              nom_culture,
              prix_tonne
            )
          )
        )
      `)
      .eq('id_investisseur', "edce6e72-93cc-47d1-9fc0-a767149433c0"); // à Remplacer par userId

    if (investmentsError) {
      console.error('Erreur lors de la récupération des investissements:', investmentsError);
      throw new Error('Impossible de récupérer les données d\'investissement');
    }

    if (!investmentsData || investmentsData.length === 0) {
      return {
        totalInvested: 0,
        totalProfit: 0,
        averageROI: 0,
        ongoingProjects: 0,
        completedProjects: 0,
        projectsByStatusData: []
      };
    }

    // Récupérer les totaux d'investissement par projet
    const projectIds = investmentsData.map(inv => inv.id_projet).filter(Boolean);
    
    const { data: totalInvestmentsData, error: totalInvestmentsError } = await supabase
      .from('investissement')
      .select('id_projet, montant')
      .in('id_projet', projectIds);

    if (totalInvestmentsError) {
      console.error('Erreur lors de la récupération des totaux d\'investissement:', totalInvestmentsError);
    }

    // Créer une map des totaux d'investissement par projet
    const projectTotalsMap = new Map<number, number>();
    if (totalInvestmentsData) {
      totalInvestmentsData.forEach(inv => {
        const current = projectTotalsMap.get(inv.id_projet) || 0;
        projectTotalsMap.set(inv.id_projet, current + (inv.montant || 0));
      });
    }

    // Calculer les métriques
    let totalInvested = 0;
    let totalProfit = 0;
    let ongoingProjects = 0;
    let completedProjects = 0;
    const roiValues: number[] = [];

    investmentsData.forEach(investment => {
      const userInvestment = investment.montant || 0;
      totalInvested += userInvestment;

      const project = investment.projet;
      if (!project) return;

      // Calculer le statut du projet
      const status = project.statut;
      if (status === 'terminé') {
        completedProjects++;
      } else if (status === 'en_cours' || status === 'en_production' || status === 'en financement') {
        ongoingProjects++;
      }

      // Calculer les profits
      const projectCultures = project.projet_culture || [];
      let projectTotalCost = 0;
      let projectExpectedRevenue = 0;

      projectCultures.forEach((pc: any) => {
        const cost = pc.cout_exploitation_previsionnel || 0;
        const yield_amount = pc.rendement_previsionnel || 0;
        const price_per_ton = pc.culture?.prix_tonne || 0;
        
        projectTotalCost += cost;
        projectExpectedRevenue += yield_amount * price_per_ton;
      });

      // Calculer la part de l'utilisateur dans le projet
      const totalProjectInvestment = projectTotalsMap.get(project.id_projet) || userInvestment;
      const investmentShare = totalProjectInvestment > 0 ? userInvestment / totalProjectInvestment : 0;
      
      // Calculer le profit de l'utilisateur
      const projectProfit = Math.max(0, projectExpectedRevenue - projectTotalCost);
      const userProfit = projectProfit * investmentShare;
      
      totalProfit += userProfit;

      // Calculer le ROI
      if (userInvestment > 0) {
        const roi = (userProfit / userInvestment) * 100;
        roiValues.push(roi);
      }
    });

    // Calculer le ROI moyen
    const averageROI = roiValues.length > 0 
      ? roiValues.reduce((sum, roi) => sum + roi, 0) / roiValues.length 
      : 0;

    // Créer les données pour le graphique par statut
    const projectsByStatusData = [];
    
    if (ongoingProjects > 0) {
      projectsByStatusData.push({
        name: 'En cours',
        value: ongoingProjects,
        color: '#3b82f6'
      });
    }
    
    if (completedProjects > 0) {
      projectsByStatusData.push({
        name: completedProjects > 0 ? 'Terminés' : 'Aucun projet',
        value: completedProjects,
        color: '#10b981'
      });
    }

    // Si aucun projet, ajouter une entrée par défaut
    if (projectsByStatusData.length === 0) {
      projectsByStatusData.push({
        name: 'Aucun projet',
        value: 1,
        color: '#9ca3af'
      });
    }

    return {
      totalInvested,
      totalProfit,
      averageROI,
      ongoingProjects,
      completedProjects,
      projectsByStatusData
    };

  } catch (error) {
    console.error('Erreur dans fetchInvestmentData:', error);
    throw error;
  }
}

export function useFetchInvestmentData() {
  const { user } = useAuth();
  
  return useAsyncState(
    () => fetchInvestmentData(user?.id), 
    [user?.id]
  );
}
