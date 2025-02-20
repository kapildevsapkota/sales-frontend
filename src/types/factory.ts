export interface FactoryInventory {
  factory: string;
  inventory: Array<{
    product: string;
    quantity: number;
  }>;
  // other properties...
}

export interface FactoryInventoryResponse {
  factoryName: string;
  data: FactoryInventory[];
  total: number;
  page: number;
  page_size: number;
  count: number;
  next: string;
}
