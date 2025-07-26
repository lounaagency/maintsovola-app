// Données d'exemple pour tester les composants FeedCard et FeedList
export const sampleProjects = [
  {
    id: '1',
    titre: 'Culture de Riz Biologique',
    description:
      "Projet de culture de riz biologique sur 5 hectares dans la région d'Antsirabe. Ce projet vise à produire du riz de qualité premium tout en respectant l'environnement.",
    photos: [
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400',
      'https://images.unsplash.com/photo-1592982103041-44e64ea2c4c3?w=400',
      'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=400',
    ],
    id_terrain: 1,
    creationDate: '2024-01-15T10:30:00Z',
    farmer: {
      name: 'Rakoto Jean',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    },
    cultivationType: 'Riz Biologique',
    cultivationArea: 5.2,
    location: {
      commune: 'Antsirabe I',
      district: 'Antsirabe I',
      region: 'Vakinankaratra',
    },
    technicianId: 'tech_001',
    farmingCost: 2500000,
    expectedYield: '25 tonnes',
    expectedRevenue: 5000000,
    totalProfit: 2500000,
    fundingGoal: 3000000,
    likes: 45,
    shares: 12,
    terrain: [
      {
        id_terrain: 1,
        nom_terrain: 'Terrain Antsirabe Nord',
      },
    ],
    projet_culture: [
      {
        id_projet_culture: 1,
        id_culture: 1,
        rendement_previsionnel: 25,
        cout_exploitation_previsionnel: 2500000,
        culture: {
          id_culture: 1,
          nom_culture: 'Riz Biologique',
          rendement_ha: 5,
          cout_exploitation_ha: 500000,
          prix_tonne: 200000,
        },
      },
    ],
  },
  {
    id: '3',
    titre: 'Élevage de Zébus',
    description:
      "Projet d'élevage de zébus dans la région de Morondava. Focus sur la production de viande de qualité et le développement de l'élevage traditionnel malgache.",
    photos: [
      'https://images.unsplash.com/photo-1560114928-40f1f1eb26a0?w=400',
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400',
      'https://images.unsplash.com/photo-1516467508483-a7212fca1a3a?w=400',
    ],
    id_terrain: 3,
    creationDate: '2024-01-25T08:45:00Z',
    farmer: {
      name: 'Andriamanga Soa',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    },
    cultivationType: 'Élevage Bovin',
    cultivationArea: 15.0,
    location: {
      commune: 'Morondava',
      district: 'Morondava',
      region: 'Menabe',
    },
    farmingCost: 8000000,
    expectedYield: '50 têtes',
    expectedRevenue: 15000000,
    totalProfit: 7000000,
    fundingGoal: 10000000,
    likes: 67,
    shares: 18,
    terrain: [
      {
        id_terrain: 3,
        nom_terrain: 'Ranch Morondava',
      },
    ],
    projet_culture: [
      {
        id_projet_culture: 3,
        id_culture: 3,
        rendement_previsionnel: 50,
        cout_exploitation_previsionnel: 8000000,
        culture: {
          id_culture: 3,
          nom_culture: 'Élevage Zébu',
          rendement_ha: 3,
          cout_exploitation_ha: 530000,
          prix_tonne: 300000,
        },
      },
    ],
  },
];

export default sampleProjects;
