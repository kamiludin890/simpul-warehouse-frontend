import type { Section } from "../types/warehouse";

export function Topbar({
  section,
  hasError,
}: {
  section: Section;
  hasError: boolean;
}) {
  return (
    <header className="topbar">
      <div className="breadcrumb">
        <span>Workspace</span>
        <span className="breadcrumb-divider">/</span>
        <strong>{section}</strong>
      </div>
      <div className="topbar-right">
        <span className="connection-indicator">
          <span className={`status-dot ${hasError ? "offline" : ""}`} />
          {hasError ? "API offline" : "Warehouse API"}
        </span>
        <span className="avatar" aria-label="User profile">
          WH
        </span>
      </div>
    </header>
  );
}
