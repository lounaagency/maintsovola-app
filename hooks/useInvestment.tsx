import { useState, useEffect } from 'react';
import { supabase } from '~/lib/data';

interface InvestmentSummary {
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

interface ProjectCreator {
  id: string;
  name: string;
  avatar?: string;
}

interface InvestedProject {
  id: string;
  title: string;
  creator: ProjectCreator;
  location: {
    region: string;
    district: string;
    commune: string;
  };
  cultivationArea: number;
  cultivationType: string;
  farmingCost: number;
  expectedRevenue: number;
  creationDate: string;
  description: string;
  currentFunding: number;
  totalProfit: number;
  userProfit: number;
  roi: number;
  investmentShare: number;
  jalonProgress: number;
  completedJalons: number;
  totalJalons: number;
  jalons: any[];
  status: string;
  dateLancement?: string;
  userInvestment: number;
}

export const useInvestments = (userId: string) => {
  const [investedProjects, setInvestedProjects] = useState<InvestedProject[]>([]);
  const [investmentSummary, setInvestmentSummary] = useState<InvestmentSummary>({
    totalInvested: 0,
    totalProfit: 0,
    averageROI: 0,
    ongoingProjects: 0,
    completedProjects: 0,
    projectsByStatusData: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvestedProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: investmentData, error: investmentError } = await supabase
        .from('investissement')
        .select(`
          *,
          projet!inner(
            *,
            tantsaha:id_tantsaha(
              id_utilisateur, 
              nom, 
              prenoms, 
              photo_profil
            )
          )
        `)
        .eq('id_investisseur', userId);
      
      if (investmentError) throw investmentError;

      const projectIds = investmentData
        .map(inv => inv.id_projet)
        .filter(id => id !== null && id !== undefined)
        .map(id => Number(id));
      
      if (projectIds.length === 0) {
        setInvestedProjects([]);
        setLoading(false);
        return;
      }
      
      const [
        { data: projectCultures },
        { data: totalInvestments },
        { data: jalonsData }
      ] = await Promise.all([
        supabase
          .from('projet_culture')
          .select('*, culture(*)')
          .in('id_projet', projectIds),
        supabase
          .from('investissement')
          .select('id_projet, montant')
          .in('id_projet', projectIds),
        supabase
          .from('jalon_projet')
          .select('*, jalon_agricole:id_jalon_agricole(nom_jalon)')
          .in('id_projet', projectIds)
      ]);

      // Process data
      const projectCultureMap = new Map();
      if (projectCultures) {
        projectCultures.forEach((pc: any) => {
          if (!projectCultureMap.has(pc.id_projet)) {
            projectCultureMap.set(pc.id_projet, []);
          }
          projectCultureMap.get(pc.id_projet).push(pc);
        });
      }
      
      const projectInvestmentMap = new Map();
      if (totalInvestments) {
        totalInvestments.forEach((inv: any) => {
          if (!projectInvestmentMap.has(inv.id_projet)) {
            projectInvestmentMap.set(inv.id_projet, 0);
          }
          projectInvestmentMap.set(
            inv.id_projet, 
            projectInvestmentMap.get(inv.id_projet) + inv.montant
          );
        });
      }

      // Group jalons by project
      const jalonsMap: {[key: number]: any[]} = {};
      if (jalonsData) {
        jalonsData.forEach((jalon: any) => {
          if (!jalonsMap[jalon.id_projet]) {
            jalonsMap[jalon.id_projet] = [];
          }
          jalonsMap[jalon.id_projet].push(jalon);
        });
      }

      // Process projects
      const processedProjects = investmentData
        .filter(investment => investment.projet)
        .map(investment => {
          const project = investment.projet;
          const tantsaha = project.tantsaha || {};
          
          const creator: ProjectCreator = {
            id: tantsaha.id_utilisateur,
            name: `${tantsaha.nom || ""} ${tantsaha.prenoms || ""}`.trim(),
            avatar: tantsaha.photo_profil
          };

          const cultures = projectCultureMap.get(project.id_projet) || [];
          
          const totalCost = cultures.reduce(
            (sum: number, pc: any) => sum + (pc.cout_exploitation_previsionnel || 0), 
            0
          );
          
          const expectedRevenue = cultures.reduce(
            (sum: number, pc: any) => sum + (pc.rendement_previsionnel * (pc.culture?.prix_tonne || 0)), 
            0
          );

          const totalInvested = projectInvestmentMap.get(project.id_projet) || 0;
          const userInvestment = investment.montant || 0;
          
          const investmentShare = totalInvested > 0 ? userInvestment / totalInvested : 0;
          const totalProfit = expectedRevenue - totalCost;
          const userProfit = totalProfit * investmentShare;
          const roi = userInvestment > 0 ? (userProfit / userInvestment) * 100 : 0;
          
          const projectJalons = jalonsMap[project.id_projet] || [];
          const completedJalons = projectJalons.filter(j => j.date_reelle).length;
          const jalonProgress = projectJalons.length > 0 ? (completedJalons / projectJalons.length) * 100 : 0;
          
          return {
            id: project.id_projet.toString(),
            title: project.titre || `Projet #${project.id_projet}`,
            creator,
            location: {
              region: project.id_region || "Non spécifié",
              district: project.id_district || "Non spécifié",
              commune: project.id_commune || "Non spécifié",
            },
            cultivationArea: project.surface_ha || 0,
            cultivationType: cultures[0]?.culture?.nom_culture || "Non spécifié",
            farmingCost: totalCost,
            expectedRevenue: expectedRevenue,
            creationDate: project.created_at || new Date().toISOString(),
            description: project.description || "",
            currentFunding: totalInvested,
            totalProfit: totalProfit,
            userProfit: userProfit,
            roi: roi,
            investmentShare: investmentShare,
            jalonProgress: jalonProgress,
            completedJalons: completedJalons,
            totalJalons: projectJalons.length,
            jalons: projectJalons,
            status: project.statut,
            dateLancement: project.date_debut_production,
            userInvestment: userInvestment,
          };
        }).filter(Boolean) as InvestedProject[];
      
      setInvestedProjects(processedProjects);

      // Calculate investment summary
      if (processedProjects.length > 0) {
        const totalInvested = processedProjects.reduce((sum, p) => sum + p.userInvestment, 0);
        const totalProfit = processedProjects.reduce((sum, p) => sum + p.userProfit, 0);
        
        const projectsWithROI = processedProjects.filter(p => p.userInvestment > 0);
        const averageROI = projectsWithROI.length > 0 
          ? projectsWithROI.reduce((sum, p) => sum + p.roi, 0) / projectsWithROI.length 
          : 0;
        
        const ongoingProjects = processedProjects.filter(p => 
          ['en_cours', 'en_production', 'en financement'].includes(p.status)).length;
        const completedProjects = processedProjects.filter(p => p.status === 'terminé').length;
        
        setInvestmentSummary({
          totalInvested,
          totalProfit,
          averageROI,
          ongoingProjects,
          completedProjects,
          projectsByStatusData: [
            { name: 'En cours', value: ongoingProjects, color: '#3b82f6' },
            { name: 'Terminés', value: completedProjects, color: '#10b981' }
          ]
        });
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching invested projects:', err);
      setError("Impossible de charger les projets d'investissement");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchInvestedProjects();
  }, [userId]);

  return {
    investedProjects,
    investmentSummary,
    loading,
    error,
    refresh: fetchInvestedProjects
  };
};