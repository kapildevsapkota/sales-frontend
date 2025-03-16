// types/inventoryTypes.ts

export interface InventoryLog {
  id: number;
  product_name: string;
  old_quantity: number;
  new_quantity: number;
  action: 'add' | 'update' | 'delete';
  user_name: string;
  organization: string;
  changed_at: string;
}

export enum Role {
  SuperAdmin = 'SUPER_ADMIN',
  Factory = 'FACTORY',
  Distributor = 'DISTRIBUTOR',
  Franchise = 'FRANCHISE'
}

export interface User {
  id: number;
  name: string;
  role: Role;
  // Add other user properties as needed
}