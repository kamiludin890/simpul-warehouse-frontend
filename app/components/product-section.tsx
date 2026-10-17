"use client";

import { FormEvent, useState } from "react";
import { apiRequest } from "../lib/api";
import type { Product } from "../types/warehouse";
import { Icon } from "./icons";
import {
  EmptyState,
  ErrorMessage,
  FormPanel,
  LoadingState,
  PageHeading,
} from "./shared";

export function ProductSection({
  products,
  isLoading,
  onSaved,
}: {
  products: Product[];
  isLoading: boolean;
  onSaved: () => Promise<void>;
}) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const openNewForm = () => {
    setEditingProduct(null);
    setFormError("");
    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (isSaving) return;
    setIsFormOpen(false);
    setEditingProduct(null);
    setFormError("");
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setFormError("");
    setIsFormOpen(true);
  };

  const saveProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const product = {
      name: String(formData.get("name")).trim(),
      sku: String(formData.get("sku")).trim(),
      category: String(formData.get("category")).trim(),
    };
    setIsSaving(true);
    setFormError("");
    try {
      const path = editingProduct
        ? `/products/${editingProduct.id}`
        : "/products";
      await apiRequest<Product>(path, {
        method: editingProduct ? "PATCH" : "POST",
        body: JSON.stringify({ product }),
      });
      setIsFormOpen(false);
      setEditingProduct(null);
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
        eyebrow="KATALOG"
        title="Product"
        description="Kelola informasi product yang tersedia."
        actionLabel="Tambah product"
        onAction={openNewForm}
      />
      {isFormOpen && (
        <FormPanel
          eyebrow={editingProduct ? "EDIT PRODUCT" : "PRODUCT BARU"}
          title={editingProduct ? "Ubah product" : "Informasi product"}
          onClose={closeForm}
        >
          <form
            key={editingProduct?.id ?? "new"}
            onSubmit={saveProduct}
          >
            <div className="form-grid">
              <label className="field">
                <span>Nama product</span>
                <input
                  defaultValue={editingProduct?.name || ""}
                  name="name"
                  placeholder="Contoh: Kopi Arabika"
                  required
                />
              </label>
              <label className="field">
                <span>SKU</span>
                <input
                  defaultValue={editingProduct?.sku || ""}
                  name="sku"
                  placeholder="Contoh: KOP-001"
                  required
                />
              </label>
              <label className="field field-full">
                <span>Kategori</span>
                <input
                  defaultValue={editingProduct?.category || ""}
                  name="category"
                  placeholder="Contoh: Minuman"
                  required
                />
              </label>
            </div>
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
                disabled={isSaving}
                type="submit"
              >
                {isSaving
                  ? "Menyimpan..."
                  : editingProduct
                    ? "Simpan perubahan"
                    : "Simpan product"}
              </button>
            </div>
          </form>
        </FormPanel>
      )}
      {isLoading ? (
        <LoadingState>Memuat product...</LoadingState>
      ) : products.length === 0 ? (
        <EmptyState
          title="Belum ada product"
          detail="Tambahkan product pertama untuk mulai mengelola katalog."
        />
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Kategori</th>
                <th className="action-column">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <span className="product-avatar">
                      {product.name.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="table-primary inline-primary">
                      {product.name}
                    </span>
                  </td>
                  <td>
                    <span className="sku-value">{product.sku}</span>
                  </td>
                  <td>{product.category}</td>
                  <td className="action-column">
                    <button
                      aria-label={`Edit ${product.name}`}
                      className="button button-edit"
                      onClick={() => startEdit(product)}
                      type="button"
                    >
                      <Icon name="edit" size={15} />
                      Edit
                    </button>
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
