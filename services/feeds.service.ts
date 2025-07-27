import { supabase } from '~/utils/supabase';

type Utilisateur = {
  id_utilisateur: number;
  nom: string;
  prenoms: string;
  photo_profil: string;
};

type CommentData = {
  id_commentaire: number;
  texte: string;
  date_creation: string;
  id_utilisateur: number;
  id_parent_commentaire: number | null;
  utilisateur: Utilisateur;
};

type LikeData = {
  id_commentaire: number;
  id_utilisateur: number;
};

export const getAllProjects = async () => {
  const { data, error } = await supabase
    .from('vue_projet_detaille')
    .select(
      `
      id_projet,
      titre,
      description,
      surface_ha,
      statut,
      created_at,
      id_tantsaha,
      id_commune,
      id_technicien,
      nom_tantsaha,
      prenoms_tantsaha,
      photo_profil,
      nom_commune,
      nom_district,
      nom_region,
      cultures,
      cout_total,
      revenu_total,
      rendement_total,
      rendements_detail,
      montant_investi,
      gap_a_financer,
      est_finance_completement,
      nombre_likes,
      nombre_commentaires
    `
    )
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  // Récupérer les photos pour chaque projet
  if (data && data.length > 0) {
    const projectIds = data.map((project) => project.id_projet);
    const { data: photosData, error: photosError } = await supabase
      .from('projet')
      .select(
        'id_projet, photos, created_at, id_terrain, terrain:id_terrain(id_terrain, nom_terrain)'
      )
      .in('id_projet', projectIds);

    if (photosError) {
      console.error('Error fetching project photos:', photosError);
    } else {
      // Combiner les données des projets avec leurs photos
      const projectsWithPhotos = data.map((project) => {
        const projectPhotos = photosData?.find((p) => p.id_projet === project.id_projet);
        return {
          ...project,
          photos: projectPhotos?.photos || null,
          created_at: projectPhotos?.created_at || project.created_at,
          id_terrain: projectPhotos?.id_terrain || null,
          terrain: projectPhotos?.terrain || null,
        };
      });

      console.log(`Found ${projectsWithPhotos.length} projects with photos`);
      return projectsWithPhotos;
    }
  }

  return data;
};

export const getProjectById = async (projectId: string) => {
  const { data, error } = await supabase
    .from('vue_projet_detaille')
    .select(
      `
      id_projet,
      titre,
      description,
      surface_ha,
      statut,
      created_at,
      id_tantsaha,
      id_commune,
      id_technicien,
      nom_tantsaha,
      prenoms_tantsaha,
      photo_profil,
      nom_commune,
      nom_district,
      nom_region,
      cultures,
      cout_total,
      revenu_total,
      rendement_total,
      rendements_detail,
      montant_investi,
      gap_a_financer,
      est_finance_completement,
      nombre_likes,
      nombre_commentaires
    `
    )
    .eq('id_projet', projectId)
    .single();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  // Récupérer les photos du projet
  const { data: photoData, error: photoError } = await supabase
    .from('projet')
    .select('photos, created_at, id_terrain, terrain:id_terrain(id_terrain, nom_terrain)')
    .eq('id_projet', projectId)
    .single();

  if (photoError) {
    console.error('Error fetching project photo:', photoError);
  }

  // Combiner les données du projet avec ses photos
  const projectWithPhotos = {
    ...data,
    photos: photoData?.photos || null,
    created_at: photoData?.created_at || data.created_at,
    id_terrain: photoData?.id_terrain || null,
    terrain: photoData?.terrain || null,
  };

  return projectWithPhotos;
};

export const getProjetctFromFollowing = async (userId: string) => {
  try {
    // Première étape : récupérer tous les utilisateurs que l'utilisateur actuel suit
    const { data: followingUsers, error: followingError } = await supabase
      .from('abonnement')
      .select('id_suivi')
      .eq('id_abonne', userId);

    if (followingError) {
      throw followingError;
    }

    // Si l'utilisateur ne suit personne, retourner un tableau vide
    if (!followingUsers || followingUsers.length === 0) {
      return [];
    }

    // Extraire les IDs des utilisateurs suivis
    const followedUserIds = followingUsers.map((follow) => follow.id_suivi);

    // Deuxième étape : récupérer les projets de ces utilisateurs suivis
    const { data, error } = await supabase
      .from('vue_projet_detaille')
      .select(
        `
        id_projet,
        titre,
        description,
        surface_ha,
        statut,
        created_at,
        id_tantsaha,
        id_commune,
        id_technicien,
        nom_tantsaha,
        prenoms_tantsaha,
        photo_profil,
        nom_commune,
        nom_district,
        nom_region,
        cultures,
        cout_total,
        revenu_total,
        rendement_total,
        rendements_detail,
        montant_investi,
        gap_a_financer,
        est_finance_completement,
        nombre_likes,
        nombre_commentaires
      `
      )
      .in('id_tantsaha', followedUserIds)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Récupérer les photos pour chaque projet
    if (data && data.length > 0) {
      const projectIds = data.map((project) => project.id_projet);
      const { data: photosData, error: photosError } = await supabase
        .from('projet')
        .select(
          'id_projet, photos, created_at, id_terrain, terrain:id_terrain(id_terrain, nom_terrain)'
        )
        .in('id_projet', projectIds);

      if (photosError) {
        console.error('Error fetching project photos:', photosError);
      } else {
        // Combiner les données des projets avec leurs photos
        const projectsWithPhotos = data.map((project) => {
          const projectPhotos = photosData?.find((p) => p.id_projet === project.id_projet);
          return {
            ...project,
            photos: projectPhotos?.photos || null,
            created_at: projectPhotos?.created_at || project.created_at,
            id_terrain: projectPhotos?.id_terrain || null,
            terrain: projectPhotos?.terrain || null,
          };
        });

        console.log(
          `Found ${projectsWithPhotos.length} projects from ${followedUserIds.length} followed users`
        );
        return projectsWithPhotos;
      }
    }

    console.log(
      `Found ${data?.length || 0} projects from ${followedUserIds.length} followed users`
    );
    return data || [];
  } catch (error) {
    console.error('Error fetching projects from following:', error);
    throw error;
  }
};

export const getCommentsByProjectId = async (projectId: string, userId?: number) => {
  // Première requête : récupérer les commentaires sans les informations utilisateur
  const { data: commentsData, error: commentsError } = await supabase
    .from('commentaire')
    .select(
      `
          id_commentaire,
          texte,
          date_creation,
          id_utilisateur,
          id_parent_commentaire
        `
    )
    .eq('id_projet', parseInt(projectId))
    .order('date_creation', { ascending: true });

  if (commentsError) {
    throw commentsError;
  }

  if (!commentsData || commentsData.length === 0) {
    return [];
  }

  // Récupérer les IDs d'utilisateurs uniques
  const userIds = [...new Set(commentsData.map((comment) => comment.id_utilisateur))];

  // Deuxième requête : récupérer les informations des utilisateurs
  const { data: usersData, error: usersError } = await supabase
    .from('utilisateur')
    .select('id_utilisateur, nom, prenoms, photo_profil')
    .in('id_utilisateur', userIds);

  if (usersError) {
    console.error('Error fetching users data:', usersError);
    // Continuer sans les données utilisateur si erreur
  }

  // Créer un map des utilisateurs pour accès rapide
  const usersMap =
    usersData?.reduce(
      (acc, user) => {
        acc[user.id_utilisateur] = user;
        return acc;
      },
      {} as Record<number, any>
    ) || {};

  // Si on a des commentaires et un userId, récupérer les likes en une seule requête
  const commentIds = commentsData.map((comment) => comment.id_commentaire);

  // Récupérer tous les likes pour ces commentaires en une seule requête
  const { data: likesData, error: likesError } = await supabase
    .from('aimer_commentaire')
    .select('id_commentaire, id_utilisateur')
    .in('id_commentaire', commentIds);

  if (likesError) {
    console.error('Error fetching comment likes:', likesError);
  }

  // Grouper les likes par commentaire
  const likesByComment =
    likesData?.reduce(
      (acc, like) => {
        if (!acc[like.id_commentaire]) {
          acc[like.id_commentaire] = [];
        }
        acc[like.id_commentaire].push(like);
        return acc;
      },
      {} as Record<number, any[]>
    ) || {};

  // Combiner toutes les données
  const commentsWithLikes = commentsData.map((comment) => {
    const commentLikes = likesByComment[comment.id_commentaire] || [];
    return {
      ...comment,
      utilisateur: usersMap[comment.id_utilisateur] || {
        nom: 'Utilisateur',
        prenoms: 'Inconnu',
        photo_profil: null,
      },
      likes: commentLikes.length,
      isLiked: userId ? commentLikes.some((like) => like.id_utilisateur === userId) : false,
    };
  });

  return commentsWithLikes;
};

export const getLikesByCommentId = async (commentId: number) => {
  const { data, error } = await supabase
    .from('aimer_commentaire')
    .select('id_commentaire, id_utilisateur')
    .eq('id_commentaire', commentId);

  if (error) {
    throw error;
  }

  return data;
};

export const getProjectLikesCount = async (projectId: string) => {
  const { data, error } = await supabase
    .from('aimer_projet')
    .select('id_projet', { count: 'exact' })
    .eq('id_projet', projectId);

  if (error) {
    throw error;
  }

  return data?.length || 0;
};

export const getProjectLikesWithUserStatus = async (projectId: string, userId?: number) => {
  const { data, error } = await supabase
    .from('aimer_projet')
    .select('id_projet, id_utilisateur')
    .eq('id_projet', projectId);

  if (error) {
    throw error;
  }

  const likesCount = data?.length || 0;
  const isLiked = userId ? data?.some((like) => like.id_utilisateur === userId) || false : false;

  return { likesCount, isLiked };
};

export const getFilteredProjects = async (filters: {
  region?: string;
  district?: string;
  commune?: string;
  culture?: string;
}) => {
  let query = supabase
    .from('vue_projet_detaille')
    .select(
      `
      id_projet,
      titre,
      description,
      surface_ha,
      statut,
      created_at,
      id_tantsaha,
      id_commune,
      id_technicien,
      nom_tantsaha,
      prenoms_tantsaha,
      photo_profil,
      nom_commune,
      nom_district,
      nom_region,
      cultures,
      cout_total,
      revenu_total,
      rendement_total,
      rendements_detail,
      montant_investi,
      gap_a_financer,
      est_finance_completement,
      nombre_likes,
      nombre_commentaires
    `
    )
    .order('created_at', { ascending: false });

  if (filters.region) {
    query = query.eq('nom_region', filters.region);
  }
  if (filters.district) {
    query = query.eq('nom_district', filters.district);
  }
  if (filters.commune) {
    query = query.eq('nom_commune', filters.commune);
  }
  if (filters.culture) {
    query = query.ilike('cultures', `%${filters.culture}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  // Récupérer les photos pour chaque projet
  if (data && data.length > 0) {
    const projectIds = data.map((project) => project.id_projet);
    const { data: photosData, error: photosError } = await supabase
      .from('projet')
      .select(
        'id_projet, photos, created_at, id_terrain, terrain:id_terrain(id_terrain, nom_terrain)'
      )
      .in('id_projet', projectIds);

    if (photosError) {
      console.error('Error fetching project photos:', photosError);
    } else {
      // Combiner les données des projets avec leurs photos
      const projectsWithPhotos = data.map((project) => {
        const projectPhotos = photosData?.find((p) => p.id_projet === project.id_projet);

        console.log(projectPhotos?.photos);

        return {
          ...project,
          photos: projectPhotos?.photos ? projectPhotos.photos.split(',') : [],
          created_at: projectPhotos?.created_at || project.created_at,
          id_terrain: projectPhotos?.id_terrain || null,
          terrain: projectPhotos?.terrain || null,
        };
      });
      console.log(`Found ${projectsWithPhotos.length} projects with photos`);
      return projectsWithPhotos;
    }
  }

  return data;
};

export const postLikeProject = async (projectId: number, data: any) => {
  console.log(data);

  const { data: reactionData, error } = await supabase
    .from('aimer_projet')
    .insert([{ id_projet: projectId, ...data }]);

  if (error) {
    throw error;
  }

  return reactionData;
};

export const postComment = async (commentData: {
  projectId: string;
  userId: number;
  text: string;
  parentCommentId?: number | null;
}) => {
  const { data, error } = await supabase
    .from('commentaire')
    .insert([
      {
        id_projet: commentData.projectId,
        id_utilisateur: commentData.userId,
        texte: commentData.text,
        id_parent_commentaire: commentData.parentCommentId,
      },
    ])
    .select();

  if (error) {
    throw error;
  }

  return data;
};

export const postLikeComment = async (commentId: number, userId: number) => {
  const { data, error } = await supabase
    .from('aimer_commentaire')
    .insert([{ id_commentaire: commentId, id_utilisateur: userId }])
    .select();

  if (error) {
    throw error;
  }

  return data;
};

export const removeLikeProject = async (projectId: number, userId: number) => {
  const { data, error } = await supabase
    .from('aimer_projet')
    .delete()
    .eq('id_projet', projectId)
    .eq('id_utilisateur', userId);

  if (error) {
    throw error;
  }

  return data;
};

export const removeLikeComment = async (commentId: number, userId: number) => {
  const { data, error } = await supabase
    .from('aimer_commentaire')
    .delete()
    .eq('id_commentaire', commentId)
    .eq('id_utilisateur', userId);

  if (error) {
    throw error;
  }

  return data;
};

export const getProjectCultureDetails = async (projectId: string) => {
  const { data, error } = await supabase
    .from('projet_culture')
    .select(
      `
      id_projet_culture,
      id_projet,
      id_culture,
      cout_exploitation_previsionnel,
      rendement_previsionnel,
      cout_exploitation_reel,
      rendement_reel,
      date_debut_previsionnelle,
      date_debut_reelle,
      created_at,
      modified_at,
      created_by,
      rendement_financier_previsionnel,
      culture:id_culture(
        nom_culture,
        prix_tonne
      )
    `
    )
    .eq('id_projet', parseInt(projectId));

  console.log(data);

  if (error) {
    throw error;
  }

  return data || [];
};
