import type { Section } from "../types/warehouse";
import { Icon } from "./icons";

const navigation: { section: Section; icon: "home" | "order" | "product" | "warehouse" }[] = [
  { section: "Home", icon: "home" },
  { section: "Order", icon: "order" },
  { section: "Product", icon: "product" },
  { section: "Warehouse", icon: "warehouse" },
];

export function Sidebar({
  section,
  orderCount,
  onNavigate,
}: {
  section: Section;
  orderCount: number;
  onNavigate: (section: Section) => void;
}) {
  return (
    <aside className="sidebar">
      <button className="brand" onClick={() => onNavigate("Home")} type="button">
        <span className="brand-icon">
          <Icon name="warehouse" size={20} />
        </span>
        <span>Stockroom</span>
      </button>
      <div className="sidebar-caption">MENU</div>
      <nav className="nav-list" aria-label="Navigasi utama">
        {navigation.map(({ section: item, icon }) => (
          <button
            className={`nav-item ${section === item ? "active" : ""}`}
            key={item}
            onClick={() => onNavigate(item)}
            type="button"
          >
            <Icon name={icon} />
            <span>{item}</span>
            {item === "Order" && orderCount > 0 && (
              <span className="nav-count">{orderCount}</span>
            )}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <span className="status-dot" />
        <span>Inventory workspace</span>
      </div>
    </aside>
  );
}
