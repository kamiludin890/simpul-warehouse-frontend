"use client";

import { useCallback, useEffect, useState } from "react";
import { HomeSection } from "./components/home-section";
import { OrderSection } from "./components/order-section";
import { PageError, ManagementFooter } from "./components/shared";
import { ProductSection } from "./components/product-section";
import { Sidebar } from "./components/sidebar";
import { Topbar } from "./components/topbar";
import { WarehouseSection } from "./components/warehouse-section";
import { fetchWarehouseData } from "./lib/api";
import type { Order, Product, Section, Warehouse } from "./types/warehouse";

export default function Home() {
  const [section, setSection] = useState<Section>("Home");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const fetchData = useCallback(async () => {
    const data = await fetchWarehouseData();
    setOrders(data.orders);
    setProducts(data.products);
    setWarehouses(data.warehouses);
  }, []);

  useEffect(() => {
    let isActive = true;
    fetchWarehouseData()
      .then((data) => {
        if (!isActive) return;
        setOrders(data.orders);
        setProducts(data.products);
        setWarehouses(data.warehouses);
        setLoadError("");
      })
      .catch((error: unknown) => {
        if (!isActive) return;
        setLoadError(
          error instanceof Error
            ? error.message
            : "Data tidak dapat dimuat dari server.",
        );
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const loadData = useCallback(async () => {
    try {
      await fetchData();
      setLoadError("");
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Data tidak dapat dimuat dari server.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [fetchData]);

  const retryLoad = () => {
    setIsLoading(true);
    setLoadError("");
    void loadData();
  };

  const navigate = (nextSection: Section) => {
    setSection(nextSection);
  };

  return (
    <div className="app-shell">
      <Sidebar
        section={section}
        orderCount={orders.length}
        onNavigate={navigate}
      />
      <main className="main-area">
        <Topbar section={section} hasError={Boolean(loadError)} />
        <div className="page-content">
          {loadError && <PageError message={loadError} onRetry={retryLoad} />}
          {section === "Home" && <HomeSection />}
          {section === "Order" && (
            <OrderSection
              orders={orders}
              products={products}
              isLoading={isLoading}
              onSaved={loadData}
            />
          )}
          {section === "Product" && (
            <ProductSection
              products={products}
              isLoading={isLoading}
              onSaved={loadData}
            />
          )}
          {section === "Warehouse" && (
            <WarehouseSection
              warehouses={warehouses}
              isLoading={isLoading}
              onSaved={loadData}
            />
          )}
          {section !== "Home" && <ManagementFooter section={section} />}
        </div>
      </main>
    </div>
  );
}
