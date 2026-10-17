import type { Inventory, Order, Product, Warehouse } from "../types/warehouse";

type ApiError = { errors?: string[]; error?: string };

const API_BASE = "/api/v1";

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const payload: unknown =
    response.status === 204 ? null : await response.json();

  if (!response.ok) {
    const apiError = payload as ApiError | null;
    const message =
      apiError?.errors?.join(", ") ||
      apiError?.error ||
      `Permintaan gagal (${response.status}).`;
    throw new Error(message);
  }

  return payload as T;
}

export async function fetchWarehouseData() {
  const [orders, products, warehouses, inventories] = await Promise.all([
    apiRequest<Order[]>("/orders"),
    apiRequest<Product[]>("/products"),
    apiRequest<Warehouse[]>("/warehouses"),
    apiRequest<Inventory[]>("/inventories"),
  ]);

  return { orders, products, warehouses, inventories };
}

export function formatDate(value: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
