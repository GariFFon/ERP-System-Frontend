export type Role = 'Admin' | 'Sales' | 'Warehouse' | 'Accounts';
export type CustomerType = 'Retail' | 'Wholesale' | 'Distributor';
export type CustomerStatus = 'Lead' | 'Active' | 'Inactive';
export type MovementType = 'IN' | 'OUT';
export type ChallanStatus = 'Draft' | 'Confirmed' | 'Cancelled';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Customer {
  id: string;
  customerName: string;
  mobileNumber: string;
  email?: string;
  businessName?: string;
  gstNumber?: string;       // optional
  customerType: CustomerType;
  address: string;
  status: CustomerStatus;
  followUpDate?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: { id: string; name: string };
  followups?: CustomerFollowup[];
}

export interface CustomerFollowup {
  id: string;
  customerId: string;
  note: string;
  followUpDate: string;
  createdBy: string;
  createdAt: string;
  creator?: { id: string; name: string };
}

export interface Product {
  id: string;
  productName: string;
  sku: string;
  category?: string;
  unitPrice: number;
  currentStock: number;
  minStockAlertQty: number;
  locationWarehouse?: string;
  imageUrl?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: { id: string; name: string };
  stockMovements?: StockMovement[];
}

export interface StockMovement {
  id: string;
  productId: string;
  quantityChanged: number;
  movementType: MovementType;
  reason: string;
  createdBy: string;
  createdAt: string;
  product?: { id: string; productName: string; sku: string };
  creator?: { id: string; name: string };
}

export interface ChallanItem {
  id: string;
  challanId: string;
  productId: string;
  productNameSnapshot: string;
  skuSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  product?: { id: string; productName: string; sku: string };
}

export interface Challan {
  id: string;
  challanNumber: string;
  customerId: string;
  totalQuantity: number;
  status: ChallanStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  creator?: { id: string; name: string };
  items?: ChallanItem[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
