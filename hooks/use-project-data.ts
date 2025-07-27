
import { useState, useEffect } from 'react';
import { 
  getAllProjects, 
  getFilteredProjects, 
  getProjectById,
  getProjetctFromFollowing,
  postLikeProject 
} from '~/services/feeds.service';

// Types pour les projets (à définir selon vos besoins)
interface AgriculturalProject {
  id: string;
  title: string;
  description: string;
  farmer: {
    id: number;
    name: string;
    username: string;
    avatar: string;
  };
  location: {
    region: string;
    district: string;
    commune: string;
  };
  cultivationArea: number;
  farmingCost: number;
  expectedYield: string;
  expectedRevenue: number;
  cultivationType: string;
  totalProfit: number;
  creationDate: string;
  fundingGoal: number;
  currentFunding: number;
  gapToFinance: number;
  isFullyFunded: boolean;
  likes: number;
  comments: number;
  shares: number;
  images: string[];
  isLiked: boolean;
  status: 'en financement' | 'financé' | 'terminé';
  technicianId: number;
  cultures: string;
}

export type ProjectFilter = {
  projectId?: string | number;
  userId?: string;
  followedUsersOnly?: boolean;
  status?: string;
  region?: string;
  district?: string;
  commune?: string;
  culture?: string;
}

export const useProjectData = (filters: ProjectFilter = {}) => {
  const [projects, setProjects] = useState<AgriculturalProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pour le moment, on simule un utilisateur connecté
  // Vous pouvez remplacer cela par votre système d'authentification
  const user = { id: '28ff57b7-fb92-4593-b239-5c56b0f44560' };

  const toggleLike = async (projectId: string, isCurrentlyLiked: boolean) => {
    if (!user) {
      console.log("Vous devez être connecté pour aimer un projet");
      return;
    }
    
    try {
      const action = isCurrentlyLiked ? 'dislike' : 'like';
      const data = {
        id_utilisateur: user.id,
        id_projet: parseInt(projectId)
      };
      
      await postLikeProject(projectId, action, data);
      
      // Mise à jour optimiste de l'état local
      setProjects(projects.map(project => {
        if (project.id === projectId) {
          return {
            ...project,
            likes: isCurrentlyLiked ? project.likes - 1 : project.likes + 1,
            isLiked: !isCurrentlyLiked
          };
        }
        return project;
      }));
    } catch (error) {
      console.error("Erreur lors de la gestion du like:", error);
      console.log("Erreur lors de la gestion du like");
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      let rawProjects;

      // Utiliser les fonctions du service selon les filtres
      if (filters.projectId) {
        // Récupérer un projet spécifique
        rawProjects = [await getProjectById(String(filters.projectId))];
      } else if (filters.followedUsersOnly && user) {
        // Récupérer les projets des utilisateurs suivis
        rawProjects = await getProjetctFromFollowing(user.id);
      } else if (Object.keys(filters).length > 0) {
        // Utiliser les filtres avancés
        const filterObject = {
          userId: filters.userId,
          status: filters.status || 'en financement',
          region: filters.region,
          district: filters.district,
          commune: filters.commune,
          culture: filters.culture
        };
        rawProjects = await getFilteredProjects(filterObject);
      } else {
        // Récupérer tous les projets
        rawProjects = await getAllProjects();
      }

      // Transformer les données brutes en format AgriculturalProject
      const transformedProjects: AgriculturalProject[] = (rawProjects || []).map((projet: any) => {
        const totalFarmingCost = projet.cout_total;
        const expectedYieldLabel = projet.rendements_detail || "N/A";
        const totalEstimatedRevenue = projet.revenu_total;
        const totalProfit = totalEstimatedRevenue - totalFarmingCost;

        const farmer = {
          id: projet.id_tantsaha,
          name: `${projet.nom_tantsaha} ${projet.prenoms_tantsaha || ''}`.trim(),
          username: projet.nom_tantsaha?.toLowerCase()?.replace(/\s+/g, '') || "",
          avatar: projet.photo_profil,
        };

        const likes = projet.nombre_likes || 0;
        const commentCount = projet.nombre_commentaires || 0;

        const locationRegion = projet.nom_region || "Non spécifié";
        const locationDistrict = projet.nom_district || "Non spécifié";
        const locationCommune = projet.nom_commune || "Non spécifié";
        const cultivationType = projet.cultures || "Non spécifié";

        return {
          id: projet.id_projet.toString(),
          title: projet.titre || `Projet de culture de ${projet.cultures}`,
          description: projet.description || `Projet de culture de ${projet.cultures} sur un terrain de ${projet.surface_ha} hectares.`,
          farmer,
          location: {
            region: locationRegion,
            district: locationDistrict,
            commune: locationCommune,
          },
          cultivationArea: projet.surface_ha,
          farmingCost: totalFarmingCost,
          expectedYield: expectedYieldLabel,
          expectedRevenue: totalEstimatedRevenue,
          cultivationType: cultivationType,
          totalProfit: totalProfit,
          creationDate: new Date(projet.created_at).toISOString().split('T')[0],
          fundingGoal: totalFarmingCost,
          currentFunding: projet.montant_investi || 0,
          gapToFinance: projet.gap_a_financer || 0,
          isFullyFunded: projet.est_finance_completement || false,
          likes,
          comments: commentCount,
          shares: 0,
          images: projet.photos || [],
          isLiked: false, // Sera mis à jour plus tard si nécessaire
          status: projet.statut as AgriculturalProject['status'],
          technicianId: projet.id_technicien,
          cultures: projet.cultures,
        };
      });

      setProjects(transformedProjects);
    } catch (err) {
      console.error("Erreur lors de la récupération des projets:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      console.log("Erreur lors du chargement des projets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [
    filters.projectId,
    filters.userId,
    filters.followedUsersOnly,
    filters.status,
    filters.region,
    filters.district,
    filters.commune,
    filters.culture
  ]);

  return {
    projects,
    loading,
    error,
    toggleLike,
    refetch: fetchProjects
  };
};
