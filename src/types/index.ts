// ─── Shared entity types matching BE DTOs ────────────────────────────────────

export interface Role {
  roleId: number;
  roleName: string;
}

export interface Account {
  customerId: number;
  email: string;
  name: string;
  phoneNumber: string;
  role?: Role;
}

export interface Warehouse {
  id?: number;       // BE may serialize as "id"
  warehouseId: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Inventory {
  id?: number;         // BE may serialize as "id"
  inventoryId: number;
  productId: number;
  warehouseId: number;
  quantity: number;
  lastChecked: string; // ISO datetime
}

export interface Supplier {
  supplierId: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
}

export interface PurchaseOrderLine {
  lineId: string;
  quantityOrdered: number;
  quantityReceived: number;
  quantityPendingReceived: number;
  unitPrice: number;
  totalPrice: number;
  expectedDate: string; // ISO date
  note: string;
}

export interface PurchaseOrder {
  poId: number;
  poNumber: string;
  status: string;
  orderDate: string; // ISO datetime
  expectedDelivery: string;
  warehouseId: number;
  supplierId: number;
  lines?: PurchaseOrderLine[];
}

export interface WarehouseTransaction {
  transactionId: number;
  warehouseId: number;
  productId: number;
  quantity: number;
  transactionType: "IN" | "OUT" | "ADJUSTMENT";
  referenceId: number;
  transactionDate: string; // ISO datetime
}

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface AccountRequest {
  email: string;
  password: string;
  name: string;
  phoneNumber: string;
  roleId: number;
}

export interface WarehouseRequest {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface InventoryRequest {
  productId: number;
  warehouseId: number;
  quantity: number;
  lastChecked: string;
}

export interface RoleRequest {
  roleName: string;
}

export interface SupplierRequest {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
}

export interface PurchaseOrderRequest {
  warehouseId: number;
  supplierId: number;
  poNumber: string;
  status: string;
  orderDate: string;
  expectedDelivery: string;
}

export interface PurchaseOrderLineRequest {
  quantityOrdered: number;
  quantityReceived: number;
  quantityPendingReceived: number;
  unitPrice: number;
  totalPrice: number;
  expectedDate: string;
  note: string;
}

export interface WarehouseTransactionRequest {
  warehouseId: number;
  productId: number;
  quantity: number;
  transactionType: "IN" | "OUT" | "ADJUSTMENT";
  referenceId: number;
  transactionDate: string;
}
