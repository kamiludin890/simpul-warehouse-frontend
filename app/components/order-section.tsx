"use client";

import { FormEvent, useState } from "react";
import { apiRequest, formatDate } from "../lib/api";
import type { Order, Product } from "../types/warehouse";
import { OrderItemFields } from "./order-item-fields";
import {
  EmptyState,
  ErrorMessage,
  FormPanel,
  LoadingState,
  PageHeading,
} from "./shared";

const ORDER_STATUSES = ["pending", "processing", "completed", "cancelled"];

export function OrderSection({
  orders,
  products,
  isLoading,
  onSaved,
}: {
  orders: Order[];
  products: Product[];
  isLoading: boolean;
  onSaved: () => Promise<void>;
}) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const productById = new Map(products.map((product) => [product.id, product]));

  const closeForm = () => {
    if (isSaving) return;
    setIsFormOpen(false);
    setFormError("");
  };

  const saveOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const productIds = formData.getAll("product_id");
    const quantities = formData.getAll("quantity");
    const orderItems = productIds
      .map((productId, index) => ({
        product_id: Number(productId),
        quantity: Number(quantities[index]),
      }))
      .filter((item) => item.product_id > 0 && item.quantity > 0);

    if (!orderItems.length) {
      setFormError("Tambahkan minimal satu produk ke dalam order.");
      return;
    }

    setIsSaving(true);
    setFormError("");
    try {
      await apiRequest<Order>("/orders", {
        method: "POST",
        body: JSON.stringify({
          order: {
            status: String(formData.get("status")),
            order_items: orderItems,
          },
        }),
      });
      setIsFormOpen(false);
      await onSaved();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <PageHeading
        eyebrow="TRANSAKSI"
        title="Order"
        description="Kelola order dan produk yang dipesan."
        actionLabel="Buat order"
        onAction={() => {
          setFormError("");
          setIsFormOpen(true);
        }}
      />
      {isFormOpen && (
        <FormPanel
          eyebrow="ORDER BARU"
          title="Detail order"
          onClose={closeForm}
        >
          <form onSubmit={saveOrder}>
            <label className="field">
              <span>Status</span>
              <select defaultValue="pending" name="status">
                {ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </label>
            <OrderItemFields products={products} />
            {formError && <ErrorMessage message={formError} />}
            <div className="form-actions">
              <button
                className="button button-secondary"
                onClick={closeForm}
                type="button"
              >
                Batal
              </button>
              <button
                className="button button-primary"
                disabled={isSaving || products.length === 0}
                type="submit"
              >
                {isSaving ? "Menyimpan..." : "Simpan order"}
              </button>
            </div>
          </form>
          {products.length === 0 && (
            <p className="inline-note">
              Tambahkan product terlebih dahulu sebelum membuat order.
            </p>
          )}
        </FormPanel>
      )}
      {isLoading ? (
        <LoadingState>Memuat order...</LoadingState>
      ) : orders.length === 0 ? (
        <EmptyState
          title="Belum ada order"
          detail="Order yang dibuat akan muncul di sini."
        />
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Tanggal dibuat</th>
                <th>Produk</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <span className="table-primary">
                      {order.order_number || `ORD-${order.id}`}
                    </span>
                    <span className="table-secondary">ID #{order.id}</span>
                  </td>
                  <td>{formatDate(order.created_at)}</td>
                  <td>
                    <span className="table-primary">
                      {order.order_items.length} item
                    </span>
                    <span className="table-secondary">
                      {order.order_items
                        .map((item) => {
                          const product = productById.get(item.product_id);
                          return `${product?.name || `Produk #${item.product_id}`} × ${item.quantity}`;
                        })
                        .join(", ") || "Tidak ada item"}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-${order.status}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
