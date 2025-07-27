import { useUserInvestments } from '~/hooks/useUserInvestissement';

interface InvestmentListProps {
  userId: string;
}

const InvestmentList = ({ userId }: InvestmentListProps) => {
  const { investments, pendingPayments, loading } = useUserInvestments(userId);

  console.log('Investissements:', investments);
  console.log('Paiements en attente  eeee:', pendingPayments);
};

export default function Paiement() {
  console.log('Paiement component rendered');
  return (
    InvestmentList({ userId: '28ff57b7-fb92-4593-b239-5c56b0f44560' })
  );
}
