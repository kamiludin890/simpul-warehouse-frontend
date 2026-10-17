"use client";

import { FormEvent, useState } from "react";
import { apiRequest } from "../lib/api";
import type { Warehouse } from "../types/warehouse";
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
  isLoading,
  onSaved,
}: {
  warehouses: Warehouse[];
  isLoading: boolean;
  onSaved: () => Promise<void>;
}) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [editingWarehouse, setEditingWarehouse] =
    useState<Warehouse | null>(null);

  const openNewForm = () => {
    setEditingWarehouse(null);
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
    setEditingWarehouse(warehouse);
    setFormError("");
    setIsFormOpen(true);
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
      {isLoading ? (
        <LoadingState>Memuat warehouse...</LoadingState>
      ) : warehouses.length === 0 ? (
        <EmptyState
          title="Belum ada warehouse"
          detail="Tambahkan warehouse untuk mulai mengelola lokasi."
        />
      ) : (
        <div className="warehouse-grid">
          {warehouses.map((warehouse) => (
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
            </article>
          ))}
        </div>
      )}
    </>
  );
}
