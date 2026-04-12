export default function CommandesTable({ commandes, onEdit, onDelete }) {
    const getStatusBadgeColor = (status) => {
        const colors = {
            en_attente: "border-amber-400/20 bg-amber-400/10 text-amber-300",
            validee: "border-blue-400/20 bg-blue-400/10 text-blue-300",
            en_cours: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
            livree: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
            annulee: "border-rose-400/20 bg-rose-400/10 text-rose-300",
        };
        return colors[status] || "border-white/10 bg-white/5 text-slate-300";
    };

    const formatStatus = (status) => {
        const labels = {
            en_attente: "Pending",
            validee: "Validated",
            en_cours: "In Progress",
            livree: "Delivered",
            annulee: "Cancelled",
        };
        return labels[status] || status;
    };

    return (
        <div className="overflow-hidden rounded-3xl border border-white/8 bg-[#0b1324]/70 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
            <table className="min-w-full divide-y divide-white/5 text-left text-sm">
                <thead className="bg-white/[0.03] text-slate-400">
                    <tr>
                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider">
                            Order ID
                        </th>
                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider">
                            Client
                        </th>
                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider">
                            Truck
                        </th>
                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider">
                            Route
                        </th>
                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider">
                            Date
                        </th>
                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider">
                            Price
                        </th>
                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {commandes.length > 0 ? (
                        commandes.map((commande) => (
                            <tr key={commande.id} className="transition hover:bg-white/[0.03]">
                                <td className="whitespace-nowrap px-5 py-4 font-medium text-white">
                                    #{commande.id}
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 text-slate-300">
                                    {commande.client?.nom || "N/A"}
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 text-slate-300">
                                    {commande.camion?.matricule || "Not assigned"}
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 text-slate-300">
                                    {commande.lieu_depart} → {commande.lieu_arrivee}
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 text-slate-400">
                                    {new Date(commande.date_transport).toLocaleDateString()}
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 text-slate-300">
                                    {commande.prix ? (
                                        <>DZD {parseFloat(commande.prix).toLocaleString()}</>
                                    ) : (
                                        "N/A"
                                    )}
                                </td>
                                <td className="whitespace-nowrap px-5 py-4">
                                    <span
                                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadgeColor(
                                            commande.statut
                                        )}`}
                                    >
                                        {formatStatus(commande.statut)}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 text-sm font-medium space-x-3">
                                    <button
                                        onClick={() => onEdit(commande)}
                                        className="text-sky-300 transition hover:text-sky-200"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => onDelete(commande.id)}
                                        className="text-rose-300 transition hover:text-rose-200"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" className="px-5 py-8 text-center text-slate-400">
                                No orders found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
