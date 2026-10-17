"use client";

import { useState } from "react";
import type { Product } from "../types/warehouse";
import { Icon } from "./icons";

export function OrderItemFields({ products }: { products: Product[] }) {
  const [rows, setRows] = useState([0]);

  const addRow = () => {
    setRows((current) => [...current, Math.max(...current) + 1]);
  };

  const removeRow = (rowId: number) => {
    setRows((current) => current.filter((id) => id !== rowId));
  };

  return (
    <div className="order-items">
      <div className="order-items-heading">
        <span>Produk order</span>
        <button className="text-button" onClick={addRow} type="button">
          <Icon name="plus" size={14} />
          Tambah item
        </button>
      </div>
      {rows.map((rowId, index) => (
        <div className="order-item-row" key={rowId}>
          <label className="field">
            {index === 0 && <span>Product</span>}
            <select defaultValue="" name="product_id" required>
              <option disabled value="">
                Pilih product
              </option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} · {product.sku}
                </option>
              ))}
            </select>
          </label>
          <label className="field quantity-field">
            {index === 0 && <span>Jumlah</span>}
            <input
              defaultValue={1}
              min="1"
              name="quantity"
              required
              type="number"
            />
          </label>
          {rows.length > 1 && (
            <button
              aria-label="Hapus item"
              className="icon-button remove-item"
              onClick={() => removeRow(rowId)}
              type="button"
            >
              <Icon name="close" size={16} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
