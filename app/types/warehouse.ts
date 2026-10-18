export type Section = "Home" | "Order" | "Product" | "Warehouse";

export type Product = {
  id: number;
  name: string;
  sku: string;
  category: string;
};

export type Warehouse = {
  id: number;
  code: string;
  name: string;
  city: string;
  distance_km: number;
  has_refrigerated_storage: boolean;
  has_refrigerated_vehicles: boolean;
};

export type Inventory = {
  id: number;
  warehouse_id: number;
  product_id: number;
  quantity_available: number;
};

export type OrderItem = {
  id: number;
  product_id: number;
  quantity: number;
  warehouse?: Warehouse | null;
};

export type Order = {
  id: number;
  order_number: string | null;
  status: string;
  created_at: string;
  warehouse?: Warehouse | null;
  order_items: OrderItem[];
};
