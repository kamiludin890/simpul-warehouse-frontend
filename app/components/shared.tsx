import type { ReactNode } from "react";
import { Icon } from "./icons";

export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="error-message" role="alert">
      <span>{message}</span>
    </div>
  );
}

export function EmptyState({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <div className="empty-state">
      <span className="empty-state-mark">—</span>
      <strong>{title}</strong>
      <p>{detail}</p>
    </div>
  );
}

export function PageHeading({
  eyebrow,
  title,
  description,
  actionLabel,
  onAction,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <button
        className="button button-primary"
        onClick={onAction}
        type="button"
      >
        <Icon name="plus" size={17} />
        {actionLabel}
      </button>
    </div>
  );
}

export function FormPanel({
  eyebrow,
  title,
  onClose,
  children,
}: {
  eyebrow: string;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <section className="form-panel">
      <div className="form-panel-heading">
        <div>
          <div className="eyebrow">{eyebrow}</div>
          <h2>{title}</h2>
        </div>
        <button
          aria-label="Tutup form"
          className="icon-button"
          onClick={onClose}
          type="button"
        >
          <Icon name="close" />
        </button>
      </div>
      {children}
    </section>
  );
}

export function LoadingState({ children }: { children: ReactNode }) {
  return <div className="loading-state">{children}</div>;
}

export function PageError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="page-error" role="alert">
      <div>
        <strong>Gagal memuat data</strong>
        <p>{message}</p>
      </div>
      <button className="button button-secondary" onClick={onRetry}>
        Coba lagi
      </button>
    </div>
  );
}

export function ManagementFooter({ section }: { section: string }) {
  return (
    <footer className="page-footer">
      <span>{section} management</span>
      <span>Data tersinkronisasi dengan Warehouse API</span>
    </footer>
  );
}
