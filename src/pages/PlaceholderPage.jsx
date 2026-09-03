import "./PlaceholderPage.css";

export default function PlaceholderPage({ title, description }) {
  return (
    <div className="placeholder-page">
      <div className="placeholder-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>
      <h1 className="placeholder-title">{title}</h1>
      <p className="placeholder-desc">{description || "Esta sección estará disponible pronto."}</p>
      <div className="placeholder-badge">Próximamente</div>
    </div>
  );
}
