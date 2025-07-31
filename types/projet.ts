export interface ProjectCultureCount {
  name: string;
  count: number;
  fill: string;
}

export interface ProjectCategoryData {
  count: number;
  area: number;
  funding: number;
  profit: number;
  ownerProfit: number;
  cultures: ProjectCultureCount[];
}

export interface ProjectStatusData {
  enFinancement: ProjectCategoryData;
  enCours: ProjectCategoryData;
  termine: ProjectCategoryData;
}

export interface ProjectsSummaryProps {
  totalProjects: number;
  totalArea: number;
  totalFunding: number;
  totalProfit: number;
  ownerProfit: number;
  projectsByStatus: ProjectStatusData;
  projectsByCulture?: Array<{
    name: string;
    count: number;
    fill: string;
  }>;
}