function OrderClientInfo({ order, fallbackUser, labels, theme = "dark", compact = false }) {
  const client = order?.client || {};
  const clientName = client.nom || fallbackUser?.name || labels.unknown;
  const clientEmail = client.email || fallbackUser?.email || labels.noData;
  const clientPhone = client.telephone || labels.noData;

  return (
    <div className={`space-y-1 text-xs ${theme === "light" ? "text-slate-600" : "text-slate-400"}`}>
      <p>
        <span className="font-medium">{labels.clientName}:</span> {clientName}
      </p>
      {!compact && (
        <p>
          <span className="font-medium">{labels.clientEmail}:</span> {clientEmail}
        </p>
      )}
      <p>
        <span className="font-medium">{labels.clientPhone}:</span> {clientPhone}
      </p>
    </div>
  );
}

export default OrderClientInfo;
