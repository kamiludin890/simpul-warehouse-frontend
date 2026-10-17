"use client";

import { FormEvent, useState } from "react";
import { apiRequest } from "../lib/api";
import type { Inventory, Product, Warehouse } from "../types/warehouse";
import { Icon } from "./icons";
import {
  EmptyState,
  ErrorMessage,
  FormPanel,
  LoadingState,
  PageHeading,
} from "./shared";

export function WarehouseSection({
  warehouses,
  products,
  inventories,
  isLoading,
  onSaved,
}: {
  warehouses: Warehouse[];
  products: Product[];
  inventories: Inventory[];
  isLoading: boolean;
  onSaved: () => Promise<void>;
}) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [editingWarehouse, setEditingWarehouse] =
    useState<Warehouse | null>(null);
  const [stockWarehouse, setStockWarehouse] = useState<Warehouse | null>(null);

  const openNewForm = () => {
    setEditingWarehouse(null);
    setStockWarehouse(null);
    setFormError("");
    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (isSaving) return;
    setIsFormOpen(false);
    setEditingWarehouse(null);
    setFormError("");
  };

  const startEdit = (warehouse: Warehouse) => {
    setStockWarehouse(null);
    setEditingWarehouse(warehouse);
    setFormError("");
    setIsFormOpen(true);
  };

  const openStockForm = (warehouse: Warehouse) => {
    setIsFormOpen(false);
    setEditingWarehouse(null);
    setStockWarehouse(warehouse);
    setFormError("");
  };

  const closeStockForm = () => {
    if (isSaving) return;
    setStockWarehouse(null);
    setFormError("");
  };

  const addStock = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!stockWarehouse) return;
    const formData = new FormData(event.currentTarget);
    const inventory = {
      warehouse_id: stockWarehouse.id,
      product_id: Number(formData.get("product_id")),
      quantity: Number(formData.get("quantity")),
    };
    setIsSaving(true);
    setFormError("");
    try {
      await apiRequest<Inventory>("/inventories", {
        method: "POST",
        body: JSON.stringify({ inventory }),
      });
      setStockWarehouse(null);
      await onSaved();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menambahkan stok.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const saveWarehouse = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const warehouse = {
      code: String(formData.get("code")).trim(),
      name: String(formData.get("name")).trim(),
      city: String(formData.get("city")).trim(),
      distance_km: Number(formData.get("distance_km")),
      has_refrigerated_storage:
        formData.get("has_refrigerated_storage") === "on",
      has_refrigerated_vehicles:
        formData.get("has_refrigerated_vehicles") === "on",
    };
    setIsSaving(true);
    setFormError("");
    try {
      const path = editingWarehouse
        ? `/warehouses/${editingWarehouse.id}`
        : "/warehouses";
      await apiRequest<Warehouse>(path, {
        method: editingWarehouse ? "PATCH" : "POST",
        body: JSON.stringify({ warehouse }),
      });
      setIsFormOpen(false);
      setEditingWarehouse(null);
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
        eyebrow="LOKASI"
        title="Warehouse"
        description="Kelola lokasi dan fasilitas penyimpanan."
        actionLabel="Tambah warehouse"
        onAction={openNewForm}
      />
      {isFormOpen && (
        <FormPanel
          eyebrow={editingWarehouse ? "EDIT WAREHOUSE" : "WAREHOUSE BARU"}
          title={
            editingWarehouse ? "Ubah warehouse" : "Informasi warehouse"
          }
          onClose={closeForm}
        >
          <form
            key={editingWarehouse?.id ?? "new"}
            onSubmit={saveWarehouse}
          >
            <div className="form-grid">
              <label className="field">
                <span>Nama warehouse</span>
                <input
                  defaultValue={editingWarehouse?.name || ""}
                  name="name"
                  placeholder="Contoh: Gudang Jakarta"
                  required
                />
              </label>
              <label className="field">
                <span>Kode warehouse</span>
                <input
                  defaultValue={editingWarehouse?.code || ""}
                  name="code"
                  placeholder="Contoh: WH-JKT"
                  required
                />
              </label>
              <label className="field">
                <span>Kota</span>
                <input
                  defaultValue={editingWarehouse?.city || ""}
                  name="city"
                  placeholder="Contoh: Jakarta"
                  required
                />
              </label>
              <label className="field">
                <span>Jarak (km)</span>
                <input
                  defaultValue={editingWarehouse?.distance_km ?? ""}
                  min="0"
                  name="distance_km"
                  placeholder="0"
                  required
                  type="number"
                />
              </label>
              <label className="checkbox-field">
                <input
                  defaultChecked={
                    editingWarehouse?.has_refrigerated_storage || false
                  }
                  name="has_refrigerated_storage"
                  type="checkbox"
                />
                <span>Memiliki penyimpanan berpendingin</span>
              </label>
              <label className="checkbox-field">
                <input
                  defaultChecked={
                    editingWarehouse?.has_refrigerated_vehicles || false
                  }
                  name="has_refrigerated_vehicles"
                  type="checkbox"
                />
                <span>Memiliki kendaraan berpendingin</span>
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
                  : editingWarehouse
                    ? "Simpan perubahan"
                    : "Simpan warehouse"}
              </button>
            </div>
          </form>
        </FormPanel>
      )}
      {stockWarehouse && (
        <FormPanel
          eyebrow="STOK BARU"
          title={`Tambah stok · ${stockWarehouse.name}`}
          onClose={closeStockForm}
        >
          <form onSubmit={addStock}>
            <div className="form-grid">
              <label className="field field-full">
                <span>Produk</span>
                <select defaultValue="" name="product_id" required>
                  <option disabled value="">
                    Pilih produk
                  </option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} · {product.sku}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Jumlah stok yang ditambahkan</span>
                <input
                  min="1"
                  name="quantity"
                  placeholder="Contoh: 25"
                  required
                  step="1"
                  type="number"
                />
              </label>
            </div>
            {products.length === 0 && (
              <p className="inline-note">
                Tambahkan produk terlebih dahulu sebelum mengisi stok.
              </p>
            )}
            {formError && <ErrorMessage message={formError} />}
            <div className="form-actions">
              <button
                className="button button-secondary"
                onClick={closeStockForm}
                type="button"
              >
                Batal
              </button>
              <button
                className="button button-primary"
                disabled={isSaving || products.length === 0}
                type="submit"
              >
                {isSaving ? "Menyimpan..." : "Tambahkan stok"}
              </button>
            </div>
          </form>
        </FormPanel>
      )}
      {isLoading ? (
        <LoadingState>Memuat warehouse...</LoadingState>
      ) : warehouses.length === 0 ? (
        <EmptyState
          title="Belum ada warehouse"
          detail="Tambahkan warehouse untuk mulai mengelola lokasi."
        />
      ) : (
        <div className="warehouse-grid">
          {warehouses.map((warehouse) => {
            const warehouseInventories = inventories.filter(
              (inventory) => inventory.warehouse_id === warehouse.id,
            );

            return (
              <article className="warehouse-card" key={warehouse.id}>
                <div className="warehouse-card-top">
                  <span className="warehouse-icon">
                    <Icon name="warehouse" size={20} />
                  </span>
                  <button
                    aria-label={`Edit ${warehouse.name}`}
                    className="icon-button"
                    onClick={() => startEdit(warehouse)}
                    type="button"
                  >
                    <Icon name="edit" size={17} />
                  </button>
                </div>
                <div className="warehouse-code">{warehouse.code}</div>
                <h2>{warehouse.name}</h2>
                <p className="warehouse-location">
                  {warehouse.city} <span>·</span> {warehouse.distance_km} km
                </p>
                <div className="facility-list">
                  <span
                    className={
                      warehouse.has_refrigerated_storage
                        ? "facility available"
                        : "facility"
                    }
                  >
                    <span className="facility-dot" />
                    Penyimpanan dingin
                  </span>
                  <span
                    className={
                      warehouse.has_refrigerated_vehicles
                        ? "facility available"
                        : "facility"
                    }
                  >
                    <span className="facility-dot" />
                    Kendaraan dingin
                  </span>
                </div>
                <div className="warehouse-stock">
                  <div className="warehouse-stock-heading">
                    <h3>Stok produk</h3>
                    <button
                      className="button button-secondary stock-add-button"
                      disabled={products.length === 0}
                      onClick={() => openStockForm(warehouse)}
                      title={
                        products.length === 0
                          ? "Tambahkan produk terlebih dahulu"
                          : undefined
                      }
                      type="button"
                    >
                      <Icon name="plus" size={14} />
                      Tambah stok
                    </button>
                  </div>
                  {warehouseInventories.length > 0 ? (
                    <ul className="warehouse-stock-list">
                      {warehouseInventories.map((inventory) => {
                        const product = products.find(
                          (item) => item.id === inventory.product_id,
                        );
                        return (
                          <li key={inventory.id}>
                            <span>
                              <strong>
                                {product?.name ??
                                  `Produk #${inventory.product_id}`}
                              </strong>
                              {product && <small>{product.sku}</small>}
                            </span>
                            <b>{inventory.quantity_available}</b>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="warehouse-stock-empty">
                      Belum ada stok produk.
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
