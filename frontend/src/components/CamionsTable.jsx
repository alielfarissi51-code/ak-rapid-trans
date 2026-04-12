export default function CamionsTable({ camions, onEdit, onDelete }) {
    const getStatusBadgeColor = (status) => {
        const colors = {
            disponible: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
            en_maintenance: "border-amber-400/20 bg-amber-400/10 text-amber-300",
            indisponible: "border-rose-400/20 bg-rose-400/10 text-rose-300",
        };
        return colors[status] || "border-white/10 bg-white/5 text-slate-300";
    };

    const formatStatus = (status) => {
        const labels = {
            disponible: "Available",
            en_maintenance: "In Maintenance",
            indisponible: "Unavailable",
        };
        return labels[status] || status;
    };

    return (
        <div className="overflow-hidden rounded-3xl border border-white/8 bg-[#0b1324]/70 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
            <table className="min-w-full divide-y divide-white/5 text-left text-sm">
                <thead className="bg-white/[0.03] text-slate-400">
                    <tr>
                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider">
                            License Plate
                        </th>
                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider">
                            Brand
                        </th>
                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider">
                            Capacity (kg)
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
                    {camions.length > 0 ? (
                        camions.map((camion) => (
                            <tr key={camion.id} className="transition hover:bg-white/[0.03]">
                                <td className="whitespace-nowrap px-5 py-4 font-medium text-white">
                                    {camion.matricule}
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 text-slate-300">
                                    {camion.marque}
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 text-slate-300">
                                    {camion.capacite.toLocaleString()}
                                </td>
                                <td className="whitespace-nowrap px-5 py-4">
                                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadgeColor(camion.statut)}`}>
                                        {formatStatus(camion.statut)}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 text-sm font-medium space-x-3">
                                    <button
                                        onClick={() => onEdit(camion)}
                                        className="text-sky-300 transition hover:text-sky-200"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => onDelete(camion.id)}
                                        className="text-rose-300 transition hover:text-rose-200"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="px-5 py-8 text-center text-slate-400">
                                No trucks found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
