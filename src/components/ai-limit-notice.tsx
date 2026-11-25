export function formatResetTime(resetAt: string): string {
  const date = new Date(resetAt);
  const sameDay = date.toDateString() === new Date().toDateString();
  const time = new Intl.DateTimeFormat("es", { hour: "2-digit", minute: "2-digit" }).format(date);
  return sameDay
    ? `hoy a las ${time}`
    : `${new Intl.DateTimeFormat("es", { weekday: "long", day: "numeric", month: "long" }).format(date)} a las ${time}`;
}

export function AiLimitNotice({ resetAt, message }: { resetAt: string; message?: string }) {
  return (
    <div className="ai-limit-notice" role="alert" data-testid="ai-limit-notice">
      <p className="eyebrow">LÍMITE DE IA ALCANZADO</p>
      <p>{message ?? "La IA alcanzó su límite de uso gratuito."}</p>
      <p data-testid="ai-limit-reset-time">
        <strong>Volverá a estar disponible {formatResetTime(resetAt)}</strong> (tu hora local).
        Mientras tanto puedes consultar las fuentes originales.
      </p>
    </div>
  );
}
