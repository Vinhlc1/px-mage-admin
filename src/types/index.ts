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

// ─── Catalog & Commerce entity types ─────────────────────────────────────────

export type ArcanaType = "MAJOR" | "MINOR";
export type CardSuit = "WANDS" | "CUPS" | "SWORDS" | "PENTACLES";
export type CardRarity = "COMMON" | "UNCOMMON" | "RARE" | "ULTRA_RARE";
export type CardProductStatus = "PENDING_BIND" | "READY" | "SOLD" | "LINKED" | "DEACTIVATED";
export type CardCondition = "NEW" | "GOOD" | "DAMAGED";
export type ProductType = "BUNDLE" | "BLIND_BOX" | "SINGLE_EVENT";
export type CollectionType = "STANDARD" | "LIMITED" | "ACHIEVEMENT" | "HIDDEN";
export type OrderStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface CardFramework {
  cardFrameworkId: number;
  name: string;
  description?: string;
  designFileUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CardTemplate {
  cardTemplateId: number;
  name: string;
  arcanaType: ArcanaType;
  suit?: CardSuit;
  cardNumber?: number;
  rarity: CardRarity;
  description?: string;
  frameworkId?: number;
  framework?: CardFramework;
  active: boolean;
  imagePath?: string;
}

export interface DivineHelper {
  divineHelperId: number;
  cardTemplateId: number;
  uprightKeywords?: string;
  reversedKeywords?: string;
  uprightMeaning?: string;
  reversedMeaning?: string;
  archetype?: string;
  symbolicNote?: string;
  element?: "AIR" | "WATER" | "FIRE" | "EARTH";
  zodiacSign?: string;
  nguHanh?: "KIM" | "MOC" | "THUY" | "HOA" | "THO";
  planet?: string;
  loveMeaning?: string;
  careerMeaning?: string;
  financeMeaning?: string;
  healthMeaning?: string;
  spiritualMeaning?: string;
  framePositive?: string;
  interpretationHint?: string;
  disclaimerRequired?: boolean;
}

export interface CardProduct {
  cardProductId: number;
  cardTemplateId: number;
  template?: CardTemplate;
  nfcUid?: string;
  status: CardProductStatus;
  serialNumber?: string;
  productionBatch?: string;
  condition: CardCondition;
  createdAt?: string;
  updatedAt?: string;
  soldAt?: string;
}

export interface Product {
  productId: number;
  name: string;
  productType: ProductType;
  isActive: boolean;
  description?: string;
  price?: number;
}

export interface Collection {
  collectionId: number;
  name: string;
  type: CollectionType;
  description?: string;
  startTime?: string;
  endTime?: string;
  rewardType?: string;
}

export interface Voucher {
  voucherId: number;
  code: string;
  discountAmount?: number;
  discountPercent?: number;
  maxUses?: number;
  usedCount: number;
  expiresAt?: string;
  active: boolean;
}

export interface CustomerOrderItem {
  orderItemId: number;
  productId?: number;
  productName?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CustomerOrder {
  orderId: number;
  status: OrderStatus;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  shippingAddress?: string;
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  customerName?: string;
  customerEmail?: string;
  orderItems?: CustomerOrderItem[];
}

// ─── Request DTOs (Catalog & Commerce) ───────────────────────────────────────

export interface CardFrameworkRequest {
  name: string;
  description?: string;
  designFileUrl?: string;
}

export interface CardTemplateRequest {
  name: string;
  arcanaType: ArcanaType;
  suit?: CardSuit;
  cardNumber?: number;
  rarity: CardRarity;
  description?: string;
  frameworkId?: number;
  active: boolean;
  imagePath?: string;
}

export interface CardProductRequest {
  cardTemplateId: number;
  serialNumber?: string;
  productionBatch?: string;
  condition: CardCondition;
}

export interface CardProductBindRequest {
  nfcUid: string;
}

export interface ProductRequest {
  name: string;
  productType: ProductType;
  isActive: boolean;
  description?: string;
  price?: number;
}

export interface CollectionRequest {
  name: string;
  type: CollectionType;
  description?: string;
  startTime?: string;
  endTime?: string;
  rewardType?: string;
}

export interface VoucherRequest {
  code: string;
  discountAmount?: number;
  discountPercent?: number;
  maxUses?: number;
  expiresAt?: string;
  active: boolean;
}

export interface OrderStatusRequest {
  status: OrderStatus;
}
