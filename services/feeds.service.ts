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
      .select('id_projet, photos, created_at')
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
        };
      });

      console.log(`Found ${projectsWithPhotos.length} projects with photos`);
      return projectsWithPhotos;
    }
  }

  console.log(data);
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
    .select('photos, created_at')
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
        .select('id_projet, photos, created_at')
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

export const getCommentsByProjectId = async (projectId: string) => {
  const { data, error } = await supabase
    .from('commentaire')
    .select(
      `
          id_commentaire,
          texte,
          date_creation,
          id_utilisateur,
          id_parent_commentaire,
          utilisateur:id_utilisateur(id_utilisateur, nom, prenoms, photo_profil)
        `
    )
    .eq('id_projet', parseInt(projectId))
    .order('date_creation', { ascending: true });

  if (error) {
    throw error;
  }
  console.log(data);

  return data;
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

export const getFilteredProjects = async (filters: {
  region?: string;
  district?: string;
  commune?: string;
  culture?: string;
}) => {
  let query = supabase.from('vue_projet_detaille').select(
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
  );

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

  return data;
};

export const postLikeProject = async (projectId: string, action: 'like' | 'dislike', data: any) => {
  const { data: reactionData, error } = await supabase
    .from('aimer_projet')
    .insert([{ project_id: projectId, action, ...data }]);

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
