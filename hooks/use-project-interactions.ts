import { useState, useEffect } from 'react';
import {
  getCommentsByProjectId,
  postComment,
  postLikeProject,
  getProjectLikesWithUserStatus,
  postLikeComment,
  removeLikeProject,
  removeLikeComment,
  getProjectCultureDetails,
} from '~/services/feeds.service';

interface Comment {
  id_commentaire: any;
  texte: any;
  date_creation: any;
  id_utilisateur: any;
  id_parent_commentaire: any;
  utilisateur: any;
  likes?: number;
  isLiked?: boolean;
}

interface CultureDetail {
  id_projet_culture: any;
  id_projet: any;
  id_culture: any;
  cout_exploitation_previsionnel: any;
  rendement_previsionnel: any;
  cout_exploitation_reel?: any;
  rendement_reel?: any;
  date_debut_previsionnelle?: any;
  date_debut_reelle?: any;
  rendement_financier_previsionnel: any;
  culture: {
    nom_culture: string;
    prix_tonne: number;
  };
}

interface UseProjectInteractionsProps {
  projectId: number;
  userId?: string;
}

export const useProjectInteractions = ({ projectId, userId }: UseProjectInteractionsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // États pour les détails financiers
  const [cultureDetails, setCultureDetails] = useState<CultureDetail[]>([]);
  const [showFinancialModal, setShowFinancialModal] = useState(false);
  const [financialDetailsLoading, setFinancialDetailsLoading] = useState(false);

  // Charger les détails financiers par culture
  const loadFinancialDetails = async () => {
    try {
      setFinancialDetailsLoading(true);
      const details = await getProjectCultureDetails(String(projectId));
      setCultureDetails(details || []); // Type script n'est pas content de la structure mais ca marche comme ça
    } catch (error) {
      console.error('Error loading financial details:', error);
    } finally {
      setFinancialDetailsLoading(false);
    }
  };

  // Ouvrir le modal des détails financiers
  const openFinancialModal = async () => {
    setShowFinancialModal(true);
    if (cultureDetails.length === 0) {
      await loadFinancialDetails();
    }
  };

  // Fermer le modal des détails financiers
  const closeFinancialModal = () => {
    setShowFinancialModal(false);
  };

  // Charger toutes les données en une fois
  const loadData = async () => {
    if (dataLoaded) return; // Éviter les rechargements multiples

    try {
      setCommentsLoading(true);

      // Charger les commentaires et les likes du projet en parallèle
      const [commentsData, likesData] = await Promise.all([
        getCommentsByProjectId(projectId, userId),
        getProjectLikesWithUserStatus(projectId, userId),
      ]);

      setComments(commentsData || []);
      setLikesCount(likesData.likesCount);
      setIsLiked(likesData.isLiked);
      setDataLoaded(true);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setCommentsLoading(false);
    }
  };

  // Ajouter un commentaire
  const addComment = async (text: string, parentCommentId?: number) => {
    if (!userId || !text.trim()) return;

    try {
      setLoading(true);
      await postComment({
        projectId,
        userId,
        text: text.trim(),
        parentCommentId: parentCommentId || null,
      });

      // Recharger seulement les commentaires après ajout
      const commentsData = await getCommentsByProjectId(projectId, userId);
      setComments(commentsData || []);
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Liker/unliker le projet
  const toggleProjectLike = async () => {
    if (!userId) return;

    try {
      setLoading(true);

      if (!isLiked) {
        await postLikeProject(projectId, { id_utilisateur: userId });
        setLikesCount((prev) => prev + 1);
        setIsLiked(true);
      } else {
        await removeLikeProject(projectId, userId);
        setLikesCount((prev) => Math.max(0, prev - 1));
        setIsLiked(false);
      }
    } catch (error) {
      console.error('Error toggling project like:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Liker/unliker un commentaire
  const toggleCommentLike = async (commentId: number) => {
    if (!userId) return;

    try {
      const comment = comments.find((c) => c.id_commentaire === commentId);
      if (!comment) return;

      if (!comment.isLiked) {
        await postLikeComment(commentId, userId);
      } else {
        await removeLikeComment(commentId, userId);
      }

      // Mettre à jour l'état local
      setComments((prev) =>
        prev.map((c) =>
          c.id_commentaire === commentId
            ? {
                ...c,
                likes: c.isLiked ? Math.max(0, (c.likes || 0) - 1) : (c.likes || 0) + 1,
                isLiked: !c.isLiked,
              }
            : c
        )
      );
    } catch (error) {
      console.error('Error toggling comment like:', error);
      throw error;
    }
  };

  // Charger les données initiales
  useEffect(() => {
    if (projectId && projectId !== '' && projectId !== '0') {
      loadData();
    }
  }, [projectId, userId]);

  // Fonction pour recharger manuellement les données
  const refreshData = async () => {
    setDataLoaded(false);
    await loadData();
  };

  return {
    comments,
    likesCount,
    isLiked,
    loading,
    commentsLoading,
    addComment,
    toggleProjectLike,
    toggleCommentLike,
    refreshComments: refreshData,
    refreshLikes: refreshData,
    // Fonctions pour les détails financiers
    cultureDetails,
    showFinancialModal,
    financialDetailsLoading,
    openFinancialModal,
    closeFinancialModal,
  };
};
