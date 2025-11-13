export interface RevenueStats {
  totalRevenue: number;
  platformProfit: number;
}

export interface RevenueTrend {
  name: string;
  totalRevenue: number;
  platformRevenue: number;
  mentorRevenue: number;
}

export interface UserGrowth {
  name: string;
  users: number;
  mentors: number;
}

export interface TopMentor {
  _id: string;
  name: string;
  email: string;
  userId:string;
  profilePic?: string;
  totalEarnings: number;
  collaborationCount: number;
  rating: number | string;
}