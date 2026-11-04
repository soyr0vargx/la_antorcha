type ArchiveEmptyStateProps = {
  label?: string;
  title: string;
  description: string;
};

export function ArchiveEmptyState({
  label = "SIN REGISTROS PUBLICADOS",
  title,
  description,
}: ArchiveEmptyStateProps) {
  return (
    <div className="archive-empty-state">
      <p className="eyebrow">{label}</p>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}