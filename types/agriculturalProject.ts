

import { ReactNode } from 'react';

export interface Location {
  region: string | ReactNode;
  district: string | ReactNode;
  commune: string | ReactNode;
}

export interface AgriculturalProject {
  id: string;
  title: string;
  farmer: {
    id: string;
    name: string | ReactNode;
    username: string;
    avatar?: string;
  };
  location: Location;
  cultivationArea: number; // en hectares
  cultivationType: string | ReactNode;
  farmingCost: number;
  expectedYield: string | number;
  expectedRevenue: number;
  creationDate: string;
  images: string[];
  description: string;
  fundingGoal: number;
  currentFunding: number;
  totalProfit: number;
  likes: number;
  comments: number;
  shares: number;  
  isLiked?: boolean;
  technicianId?: string;
  status?: 'en_attente' | 'validé' | 'en_financement' | 'en_cours' | 'en_production' | 'terminé';
  cultures?: string;
  gapToFinance?: number;
  isFullyFunded?: boolean;
  paymentStatus?: 'en_attente' | 'payé' | 'échoué';
}

