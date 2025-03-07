export interface InventoryItem {
  product: string;
  quantity: number;
  id: number;
  rate?: number;
  lastUpdated?: string;
  status?: string;
}

export interface FranchiseData {
  [key: string]: InventoryItem[];
}

export interface DistributorData {
  inventory: InventoryItem[];
  franchises: FranchiseData;
}

export interface ApiResponse {
  [key: string]: DistributorData;
}