import { useEffect, useState } from 'react';
import { supabase } from '~/lib/data';

export interface ProjectInfo {
  id_projet: string;
  titre: string;
}

export interface Investment {
  id_investissement: string;
  id_projet: string;
  montant: number;
  date_decision_investir: string;
  statut_paiement: string;
  projet: ProjectInfo;
}

export interface PendingPayment {
  id_investissement: string;
  id_projet: string;
  montant: number;
  date_investissement: string;
  projet: ProjectInfo;
}

export const useUserInvestments = (userId: string) => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch investments made by the user
        const { data: userInvestments, error: investmentsError } = await supabase
          .from('investissement')
          .select('id_investissement, id_projet, montant, date_decision_investir, statut_paiement, projet:id_projet(id_projet, titre)')
          .eq('id_investisseur', userId);

        if (investmentsError) throw investmentsError;

        if (!userInvestments || userInvestments.length === 0) {
          setInvestments([]);
          setPendingPayments([]);
        //   console.log('hvjdsjhdvsjkdhvsqkdjhsvqkjsqhvfdkjsqhvfkqs')
          return;
        }

        // Format investments data
        const formattedInvestments = userInvestments.map(inv => ({
          ...inv,
          projet: Array.isArray(inv.projet) ? inv.projet[0] : inv.projet,
          
        })) as Investment[];

        setInvestments(formattedInvestments);
        // console.log('Investissements récupérés:', formattedInvestments);
        // Get pending payments (investments without payment)
        const pendingPaymentsData = formattedInvestments
          .filter(inv => inv.statut_paiement !== 'payé')
          .map(inv => ({
            id_investissement: inv.id_investissement,
            id_projet: inv.id_projet,
            montant: inv.montant,
            date_investissement: inv.date_decision_investir,
            projet: inv.projet
          }));

        setPendingPayments(pendingPaymentsData);
        // console.log('Paiements en attente récupérés:', pendingPaymentsData);

      } catch (err) {
        console.error('Error fetching investments:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setInvestments([]);
        setPendingPayments([]);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchInvestments();
    //   console.log('Fetching investments for user:', userId);

    } else {
      setError('No user ID provided');
      setLoading(false);
    }
  }, [userId]);

  return { investments, pendingPayments, loading, error };
};