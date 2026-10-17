"use client";

import { FormEvent, useRef, useState } from "react";
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
  const [actionError, setActionError] = useState("");
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [detailsOrder, setDetailsOrder] = useState<Order | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const detailsRequestId = useRef(0);
  const [deletingOrderId, setDeletingOrderId] = useState<number | null>(null);
  const productById = new Map(products.map((product) => [product.id, product]));

  const openNewForm = () => {
    setEditingOrder(null);
    setFormError("");
    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (isSaving) return;
    setIsFormOpen(false);
    setFormError("");
    setEditingOrder(null);
  };

  const openEditForm = (order: Order) => {
    setEditingOrder(order);
    setFormError("");
    setIsFormOpen(true);
  };

  const saveOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setIsSaving(true);
    setFormError("");
    try {
      if (editingOrder) {
        await apiRequest<Order>(`/orders/${editingOrder.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            order: { status: String(formData.get("status")) },
          }),
        });
      } else {
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

        await apiRequest<{ message: string; order: Order }>("/orders", {
          method: "POST",
          body: JSON.stringify({ items: orderItems }),
        });
      }

      setIsFormOpen(false);
      setEditingOrder(null);
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

  const openDetails = async (order: Order) => {
    const requestId = ++detailsRequestId.current;
    setDetailsOrder(null);
    setActionError("");
    setIsLoadingDetails(true);
    try {
      const details = await apiRequest<Order>(`/orders/${order.id}`);
      if (detailsRequestId.current === requestId) {
        setDetailsOrder(details);
      }
    } catch (error) {
      if (detailsRequestId.current === requestId) {
        setActionError(
          error instanceof Error
            ? error.message
            : "Detail order tidak dapat dimuat.",
        );
      }
    } finally {
      if (detailsRequestId.current === requestId) {
        setIsLoadingDetails(false);
      }
    }
  };

  const deleteOrder = async (order: Order) => {
    if (
      !window.confirm(
        `Hapus order ${order.order_number || `ORD-${order.id}`}?`,
      )
    ) {
      return;
    }

    setActionError("");
    setDeletingOrderId(order.id);
    try {
      await apiRequest<void>(`/orders/${order.id}`, { method: "DELETE" });
      if (detailsOrder?.id === order.id) {
        detailsRequestId.current += 1;
        setDetailsOrder(null);
      }
      await onSaved();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Order tidak dapat dihapus.",
      );
    } finally {
      setDeletingOrderId(null);
    }
  };

  return (
    <>
      <PageHeading
        eyebrow="TRANSAKSI"
        title="Order"
        description="Kelola order dan produk yang dipesan."
        actionLabel="Buat order"
        onAction={openNewForm}
      />
      {actionError && <ErrorMessage message={actionError} />}
      {isFormOpen && (
        <FormPanel
          eyebrow={editingOrder ? "UBAH ORDER" : "ORDER BARU"}
          title={editingOrder ? "Ubah status order" : "Detail order"}
          onClose={closeForm}
        >
          <form
            key={editingOrder?.id ?? "new"}
            onSubmit={saveOrder}
          >
            {editingOrder ? (
              <label className="field">
                <span>Status</span>
                <select defaultValue={editingOrder.status} name="status">
                  {[...new Set([...ORDER_STATUSES, editingOrder.status])].map(
                    (status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ),
                  )}
                </select>
              </label>
            ) : (
              <OrderItemFields products={products} />
            )}
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
                disabled={isSaving || (!editingOrder && products.length === 0)}
                type="submit"
              >
                {isSaving
                  ? "Menyimpan..."
                  : editingOrder
                    ? "Simpan perubahan"
                    : "Simpan order"}
              </button>
            </div>
          </form>
          {!editingOrder && products.length === 0 && (
            <p className="inline-note">
              Tambahkan product terlebih dahulu sebelum membuat order.
            </p>
          )}
        </FormPanel>
      )}
      {(isLoadingDetails || detailsOrder) && (
        <FormPanel
          eyebrow="ORDER"
          title="Detail order"
          onClose={() => {
            detailsRequestId.current += 1;
            setDetailsOrder(null);
            setIsLoadingDetails(false);
          }}
        >
          {isLoadingDetails ? (
            <LoadingState>Memuat detail order...</LoadingState>
          ) : detailsOrder ? (
            <div className="order-detail">
              <p>
                <strong>Nomor:</strong>{" "}
                {detailsOrder.order_number || `ORD-${detailsOrder.id}`}
              </p>
              <p>
                <strong>Status:</strong> {detailsOrder.status}
              </p>
              <p>
                <strong>Tanggal dibuat:</strong>{" "}
                {formatDate(detailsOrder.created_at)}
              </p>
              <p>
                <strong>Produk:</strong>{" "}
                {detailsOrder.order_items
                  .map((item) => {
                    const product = productById.get(item.product_id);
                    return `${product?.name || `Produk #${item.product_id}`} × ${item.quantity}`;
                  })
                  .join(", ") || "Tidak ada item"}
              </p>
            </div>
          ) : null}
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
                <th className="action-column">Aksi</th>
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
                  <td className="action-column">
                    <div className="order-actions">
                      <button
                        className="button button-edit"
                        onClick={() => void openDetails(order)}
                        type="button"
                      >
                        Detail
                      </button>
                      <button
                        aria-label={`Edit order ${order.order_number || order.id}`}
                        className="button button-edit"
                        onClick={() => openEditForm(order)}
                        type="button"
                      >
                        Edit
                      </button>
                      <button
                        className="button button-delete"
                        disabled={deletingOrderId === order.id}
                        onClick={() => void deleteOrder(order)}
                        type="button"
                      >
                        {deletingOrderId === order.id ? "Menghapus..." : "Hapus"}
                      </button>
                    </div>
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
