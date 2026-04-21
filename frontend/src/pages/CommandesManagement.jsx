import { useEffect, useMemo, useState } from "react";
import {
    getCommandes,
    createCommande,
    updateCommande,
    deleteCommande,
    getCamions,
    downloadCommandesPdf,
    exportCommandesXml,
    importCommandesXml,
    getCommandesSummary,
} from "../services/api";
import CommandeForm from "../components/CommandeForm";
import CommandesTable from "../components/CommandesTable";
import Sidebar from "../components/Sidebar";
import { getStoredPreferences, PREFERENCES_EVENT } from "../utils/preferences";

export default function CommandesManagement() {
    const [commandes, setCommandes] = useState([]);
    const [camions, setCamions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCommande, setEditingCommande] = useState(null);
    const [summary, setSummary] = useState([]);
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState("");
    const [lang, setLang] = useState(() => getStoredPreferences().lang);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const t = useMemo(() => getTranslations(lang), [lang]);

    useEffect(() => {
        fetchCommandes();
        fetchCamions();
        fetchSummary();
    }, []);

    useEffect(() => {
        const syncLanguage = (event) => {
            const nextLang = event?.detail?.lang || getStoredPreferences().lang;
            setLang(nextLang === "fr" ? "fr" : "en");
        };

        window.addEventListener(PREFERENCES_EVENT, syncLanguage);

        return () => {
            window.removeEventListener(PREFERENCES_EVENT, syncLanguage);
        };
    }, []);

    const fetchCommandes = async () => {
        try {
            setLoading(true);
            const data = await getCommandes();
            setCommandes(data);
            setError("");
        } catch (err) {
            setError(t.failedLoadOrders + err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchCamions = async () => {
        try {
            const data = await getCamions();
            setCamions(data);
        } catch (err) {
            console.error(t.failedLoadTrucks);
        }
    };

    const fetchSummary = async () => {
        try {
            setSummaryLoading(true);
            const payload = await getCommandesSummary();
            setSummary(payload?.data || []);
        } catch (err) {
            console.error(t.failedLoadSummary);
            setSummary([]);
        } finally {
            setSummaryLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingCommande(null);
        setShowForm(true);
    };

    const handleEdit = (commande) => {
        setEditingCommande(commande);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (confirm(t.confirmDeleteOrder)) {
            try {
                await deleteCommande(id);
                setSuccess(t.orderDeletedSuccessfully);
                fetchCommandes();
                fetchSummary();
                setTimeout(() => setSuccess(""), 3000);
            } catch (err) {
                setError(t.failedDeleteOrder + err.message);
            }
        }
    };

    const handleSubmit = async (formData) => {
        try {
            if (editingCommande) {
                await updateCommande(editingCommande.id, formData);
                setSuccess(t.orderUpdatedSuccessfully);
            } else {
                await createCommande(formData);
                setSuccess(t.orderCreatedSuccessfully);
            }
            setShowForm(false);
            setEditingCommande(null);
            fetchCommandes();
            fetchSummary();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(t.failedSaveOrder + err.message);
        }
    };

    const handlePdfExport = async () => {
        try {
            setActionLoading("pdf");
            await downloadCommandesPdf();
            setSuccess(t.pdfExportedSuccessfully);
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(t.failedExportPdf + err.message);
        } finally {
            setActionLoading("");
        }
    };

    const handleXmlExport = async () => {
        try {
            setActionLoading("xml-export");
            await exportCommandesXml();
            setSuccess(t.xmlExportedSuccessfully);
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(t.failedExportXml + err.message);
        } finally {
            setActionLoading("");
        }
    };

    const handleXmlImport = async (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        try {
            setActionLoading("xml-import");
            const result = await importCommandesXml(file);
            setSuccess(`${result.message} (${result.created})`);
            fetchCommandes();
            fetchSummary();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(t.failedImportXml + err.message);
        } finally {
            setActionLoading("");
            event.target.value = "";
        }
    };

    return (
        <div className="app-dashboard h-screen overflow-hidden bg-[#050814] text-slate-100">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col lg:pl-[260px]">
                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
                    <div className="mx-auto flex max-w-7xl flex-col gap-6">
                        <section className="rounded-[28px] border border-white/8 bg-white/[0.03] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
                            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm uppercase tracking-[0.24em] text-sky-300/70">Admin Tools</p>
                                    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">{t.ordersManagement}</h1>
                                    <p className="mt-2 text-sm text-slate-400">{t.ordersManagementSubtitle}</p>
                                </div>
                                <button
                                    onClick={handleCreate}
                                    className="rounded-2xl border border-sky-400/20 bg-sky-500/15 px-5 py-3 text-sm font-semibold text-sky-100 transition hover:border-sky-300/40 hover:bg-sky-500/25"
                                >
                                    {t.addOrder}
                                </button>
                            </div>

                            <div className="mb-6 grid gap-3 md:grid-cols-4">
                                <button
                                    type="button"
                                    onClick={handlePdfExport}
                                    disabled={actionLoading !== ""}
                                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-slate-100 transition hover:bg-white/[0.07]"
                                >
                                    {actionLoading === "pdf" ? t.exportingPdf : t.exportPdf}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleXmlExport}
                                    disabled={actionLoading !== ""}
                                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-slate-100 transition hover:bg-white/[0.07]"
                                >
                                    {actionLoading === "xml-export" ? t.exportingXml : t.exportXml}
                                </button>
                                <label className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-slate-100 transition hover:bg-white/[0.07] cursor-pointer text-center">
                                    {actionLoading === "xml-import" ? t.importingXml : t.importXml}
                                    <input
                                        type="file"
                                        accept=".xml,text/xml"
                                        onChange={handleXmlImport}
                                        disabled={actionLoading !== ""}
                                        className="hidden"
                                    />
                                </label>
                                <button
                                    type="button"
                                    onClick={fetchSummary}
                                    disabled={summaryLoading || actionLoading !== ""}
                                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-slate-100 transition hover:bg-white/[0.07]"
                                >
                                    {summaryLoading ? t.refreshing : t.refreshSummary}
                                </button>
                            </div>

                            {summaryLoading && (
                                <div className="mb-4 rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3 text-sm text-slate-300">
                                    {t.loadingSummary}
                                </div>
                            )}

                            {!summaryLoading && summary.length > 0 && (
                                <div className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
                                    <table className="min-w-full text-left text-sm">
                                        <thead className="bg-white/[0.04] text-slate-300">
                                            <tr>
                                                <th className="px-4 py-3">{t.status}</th>
                                                <th className="px-4 py-3">{t.totalOrders}</th>
                                                <th className="px-4 py-3">{t.totalAmount}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {summary.map((row) => (
                                                <tr key={row.statut} className="border-t border-white/10 text-slate-200">
                                                    <td className="px-4 py-3">{row.statut}</td>
                                                    <td className="px-4 py-3">{row.total}</td>
                                                    <td className="px-4 py-3">{row.total_amount}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {error && (
                                <div className="mb-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                                    {success}
                                </div>
                            )}

                            {showForm && (
                                <CommandeForm
                                    commande={editingCommande}
                                    camions={camions}
                                    onSubmit={handleSubmit}
                                    onCancel={() => setShowForm(false)}
                                />
                            )}

                            {loading ? (
                                <div className="rounded-2xl border border-white/8 bg-white/[0.02] py-10 text-center text-slate-300">
                                    {t.loadingOrders}
                                </div>
                            ) : (
                                <CommandesTable commandes={commandes} onEdit={handleEdit} onDelete={handleDelete} />
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

function getTranslations(lang = "en") {
    const translations = {
        en: {
            ordersManagement: "Orders Management",
            ordersManagementSubtitle: "Create, update and monitor all transport orders.",
            addOrder: "+ Add Order",
            exportPdf: "Export PDF",
            exportingPdf: "Exporting PDF...",
            exportXml: "Export XML",
            exportingXml: "Exporting XML...",
            importXml: "Import XML",
            importingXml: "Importing XML...",
            refreshSummary: "Refresh Summary",
            refreshing: "Refreshing...",
            loadingSummary: "Loading summary...",
            loadingOrders: "Loading orders...",
            status: "Status",
            totalOrders: "Total Orders",
            totalAmount: "Total Amount",
            confirmDeleteOrder: "Are you sure you want to delete this order?",
            orderDeletedSuccessfully: "Order deleted successfully",
            orderUpdatedSuccessfully: "Order updated successfully",
            orderCreatedSuccessfully: "Order created successfully",
            pdfExportedSuccessfully: "PDF exported successfully",
            xmlExportedSuccessfully: "XML exported successfully",
            failedLoadOrders: "Failed to load orders: ",
            failedLoadTrucks: "Failed to load trucks",
            failedLoadSummary: "Failed to load summary",
            failedDeleteOrder: "Failed to delete order: ",
            failedSaveOrder: "Failed to save order: ",
            failedExportPdf: "Failed to export PDF: ",
            failedExportXml: "Failed to export XML: ",
            failedImportXml: "Failed to import XML: ",
        },
        fr: {
            ordersManagement: "Gestion des commandes",
            ordersManagementSubtitle: "Creer, mettre a jour et suivre toutes les commandes de transport.",
            addOrder: "+ Ajouter une commande",
            exportPdf: "Exporter PDF",
            exportingPdf: "Export PDF en cours...",
            exportXml: "Exporter XML",
            exportingXml: "Export XML en cours...",
            importXml: "Importer XML",
            importingXml: "Import XML en cours...",
            refreshSummary: "Actualiser le resume",
            refreshing: "Actualisation...",
            loadingSummary: "Chargement du resume...",
            loadingOrders: "Chargement des commandes...",
            status: "Statut",
            totalOrders: "Total commandes",
            totalAmount: "Montant total",
            confirmDeleteOrder: "Voulez-vous vraiment supprimer cette commande ?",
            orderDeletedSuccessfully: "Commande supprimee avec succes",
            orderUpdatedSuccessfully: "Commande mise a jour avec succes",
            orderCreatedSuccessfully: "Commande creee avec succes",
            pdfExportedSuccessfully: "PDF exporte avec succes",
            xmlExportedSuccessfully: "XML exporte avec succes",
            failedLoadOrders: "Echec du chargement des commandes : ",
            failedLoadTrucks: "Echec du chargement des camions",
            failedLoadSummary: "Echec du chargement du resume",
            failedDeleteOrder: "Echec de suppression de la commande : ",
            failedSaveOrder: "Echec d'enregistrement de la commande : ",
            failedExportPdf: "Echec de l'export PDF : ",
            failedExportXml: "Echec de l'export XML : ",
            failedImportXml: "Echec de l'import XML : ",
        },
    };

    return translations[lang] || translations.en;
}
