import { useEffect, useMemo, useState } from "react";
import {
    getCommandes,
    createCommande,
    updateCommande,
    deleteCommande,
    getCommandeStatusLogs,
    getCamions,
    downloadCommandesPdf,
    exportCommandesXml,
    importCommandesXml,
    getCommandesSummary,
} from "../services/api";
import CommandeForm from "../components/CommandeForm";
import CommandesTable from "../components/CommandesTable";
import Sidebar from "../components/Sidebar";
import { useToast } from "../components/ToastProvider";
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
    const [logsLoading, setLogsLoading] = useState(false);
    const [selectedCommandeForLogs, setSelectedCommandeForLogs] = useState(null);
    const [statusLogs, setStatusLogs] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [lang, setLang] = useState(() => getStoredPreferences().lang);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const t = useMemo(() => getTranslations(lang), [lang]);
    const { addToast } = useToast();

    const showSuccessToast = (title, description) => {
        addToast({ type: "success", title, description });
    };

    const showErrorToast = (title, description) => {
        addToast({ type: "error", title, description });
    };

    const showWarningToast = (title, description) => {
        addToast({ type: "warning", title, description });
    };

    const filteredCommandes = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        return commandes.filter((commande) => {
            const clientName = commande.client?.nom?.toLowerCase() || "";
            const route = `${commande.lieu_depart || ""} ${commande.lieu_arrivee || ""}`.toLowerCase();
            const idText = String(commande.id || "");
            const matchesSearch = !normalizedSearch
                || clientName.includes(normalizedSearch)
                || route.includes(normalizedSearch)
                || idText.includes(normalizedSearch);
            const matchesStatus = statusFilter === "all" || commande.statut === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [commandes, searchTerm, statusFilter]);

    const totalPages = Math.ceil(filteredCommandes.length / itemsPerPage);
    const paginatedCommandes = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredCommandes.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredCommandes, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

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
        } catch (err) {
            showErrorToast(t.toastLoadFailedTitle, `${t.failedLoadOrders}${err.message}`);
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
            showWarningToast(t.toastTrucksUnavailableTitle, t.toastTrucksUnavailableDescription);
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
            showWarningToast(t.toastSummaryUnavailableTitle, t.toastSummaryUnavailableDescription);
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
                showSuccessToast(t.toastOrderDeletedTitle, t.toastOrderDeletedDescription);
                fetchCommandes();
                fetchSummary();
            } catch (err) {
                showErrorToast(t.toastDeleteFailedTitle, `${t.failedDeleteOrder}${err.message}`);
            }
        }
    };

    const handleSubmit = async (formData) => {
        try {
            if (editingCommande) {
                await updateCommande(editingCommande.id, formData);
                showSuccessToast(t.toastOrderUpdatedTitle, t.toastOrderUpdatedDescription);
            } else {
                await createCommande(formData);
                showSuccessToast(t.toastOrderCreatedTitle, t.toastOrderCreatedDescription);
            }
            setShowForm(false);
            setEditingCommande(null);
            fetchCommandes();
            fetchSummary();
        } catch (err) {
            showErrorToast(t.toastSaveFailedTitle, `${t.failedSaveOrder}${err.message}`);
        }
    };

    const handleViewStatusLogs = async (commande) => {
        try {
            setLogsLoading(true);
            setSelectedCommandeForLogs(commande);
            const payload = await getCommandeStatusLogs(commande.id);
            setStatusLogs(payload?.data || []);
        } catch (err) {
            setStatusLogs([]);
            showErrorToast(t.toastLogsUnavailableTitle, `${t.failedLoadLogs}${err.message}`);
        } finally {
            setLogsLoading(false);
        }
    };

    const handlePdfExport = async () => {
        try {
            setActionLoading("pdf");
            await downloadCommandesPdf();
            showSuccessToast(t.toastPdfExportedTitle, t.toastPdfExportedDescription);
        } catch (err) {
            showErrorToast(t.toastPdfExportFailedTitle, `${t.failedExportPdf}${err.message}`);
        } finally {
            setActionLoading("");
        }
    };

    const handleXmlExport = async () => {
        try {
            setActionLoading("xml-export");
            await exportCommandesXml();
            showSuccessToast(t.toastXmlExportedTitle, t.toastXmlExportedDescription);
        } catch (err) {
            showErrorToast(t.toastXmlExportFailedTitle, `${t.failedExportXml}${err.message}`);
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
            showSuccessToast(
                t.toastXmlImportedTitle,
                `${t.toastXmlImportedDescription} (${result.created})`
            );
            fetchCommandes();
            fetchSummary();
        } catch (err) {
            showErrorToast(t.toastXmlImportFailedTitle, `${t.failedImportXml}${err.message}`);
        } finally {
            setActionLoading("");
            event.target.value = "";
        }
    };

    return (
        <div className="app-dashboard min-h-screen overflow-x-hidden bg-white text-slate-900">
            <Sidebar />
            <div className="flex min-h-screen min-w-0 flex-col lg:pl-[260px]">
                <div className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
                    <div className="mx-auto flex max-w-7xl flex-col gap-6">
                        <section className="rounded-xl border border-slate-200 bg-slate-50 p-6 shadow-[0_24px_70px_rgba(2,6,23,0.05)]">
                            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm uppercase tracking-[0.24em] text-sky-600/70">Admin Tools</p>
                                    <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">{t.ordersManagement}</h1>
                                    <p className="mt-2 text-sm text-slate-500">{t.ordersManagementSubtitle}</p>
                                </div>
                                <button
                                    onClick={handleCreate}
                                    className="inline-flex h-11 items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 text-sm font-semibold text-sky-700 transition duration-200 hover:border-sky-300 hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                                >
                                    <AddIcon className="h-4 w-4" />
                                    {t.addOrder}
                                </button>
                            </div>

                            <div className="mb-8 grid gap-3 md:grid-cols-4">
                                <button
                                    type="button"
                                    onClick={handlePdfExport}
                                    disabled={actionLoading !== ""}
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 transition duration-200 hover:border-sky-300 hover:bg-sky-50 hover:shadow-[0_0_0_1px_rgba(56,189,248,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <PdfIcon className="h-4 w-4" />
                                    {actionLoading === "pdf" ? t.exportingPdf : t.exportPdf}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleXmlExport}
                                    disabled={actionLoading !== ""}
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 transition duration-200 hover:border-sky-300 hover:bg-sky-50 hover:shadow-[0_0_0_1px_rgba(56,189,248,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <CodeIcon className="h-4 w-4" />
                                    {actionLoading === "xml-export" ? t.exportingXml : t.exportXml}
                                </button>
                                <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 transition duration-200 hover:border-sky-300 hover:bg-sky-50 hover:shadow-[0_0_0_1px_rgba(56,189,248,0.22)] focus-within:ring-2 focus-within:ring-sky-300">
                                    <UploadIcon className="h-4 w-4" />
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
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 transition duration-200 hover:border-sky-300 hover:bg-sky-50 hover:shadow-[0_0_0_1px_rgba(56,189,248,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <RefreshIcon className="h-4 w-4" />
                                    {summaryLoading ? t.refreshing : t.refreshSummary}
                                </button>
                            </div>

                            {summaryLoading && (
                                <div className="mb-6 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                                    {t.loadingSummary}
                                </div>
                            )}

                            {!summaryLoading && summary.length > 0 && (
                                <div className="mb-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_8px_28px_rgba(2,6,23,0.05)]">
                                    <table className="min-w-full text-left text-sm">
                                        <thead className="bg-slate-100 text-slate-600">
                                            <tr>
                                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em]">{t.status}</th>
                                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em]">{t.totalOrders}</th>
                                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em]">{t.totalAmount}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {summary.map((row) => (
                                                <tr key={row.statut} className="border-t border-slate-200 text-slate-900 transition duration-200 hover:bg-slate-50">
                                                    <td className="px-4 py-3.5">{row.statut}</td>
                                                    <td className="px-4 py-3.5">{row.total}</td>
                                                    <td className="px-4 py-3.5">DHS {parseFloat(row.total_amount || 0).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            <div className="mb-6 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto]">
                                <div className="relative">
                                    <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        value={searchTerm}
                                        onChange={(event) => setSearchTerm(event.target.value)}
                                        placeholder={t.searchOrdersPlaceholder}
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                                    />
                                </div>
                                <select
                                    value={statusFilter}
                                    onChange={(event) => setStatusFilter(event.target.value)}
                                    className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition duration-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                                >
                                    <option value="all">{t.allStatuses}</option>
                                    <option value="livree">{t.delivered}</option>
                                    <option value="validee">{t.validated}</option>
                                    <option value="en_cours">{t.inProgress}</option>
                                    <option value="en_attente">{t.pending}</option>
                                    <option value="annulee">{t.cancelled}</option>
                                </select>
                                <div className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-500">
                                    {filteredCommandes.length} {t.records}
                                </div>
                            </div>

                            {showForm && (
                                <CommandeForm
                                    commande={editingCommande}
                                    camions={camions}
                                    onSubmit={handleSubmit}
                                    onCancel={() => setShowForm(false)}
                                />
                            )}

                            {loading ? (
                                <div className="rounded-xl border border-slate-200 bg-white py-10 text-center text-slate-500">
                                    {t.loadingOrders}
                                </div>
                            ) : (
                                <>
                                    <CommandesTable commandes={paginatedCommandes} onEdit={handleEdit} onDelete={handleDelete} onViewStatusLogs={handleViewStatusLogs} />

                                    {selectedCommandeForLogs && (
                                        <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_8px_28px_rgba(2,6,23,0.05)]">
                                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
                                                <h3 className="text-sm font-semibold text-slate-900">
                                                    {t.statusLogsTitle} #{selectedCommandeForLogs.id}
                                                </h3>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedCommandeForLogs(null);
                                                        setStatusLogs([]);
                                                    }}
                                                    className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition duration-200 hover:bg-slate-100"
                                                >
                                                    {t.closeLogs}
                                                </button>
                                            </div>

                                            {logsLoading ? (
                                                <div className="px-4 py-4 text-sm text-slate-500">{t.loadingLogs}</div>
                                            ) : statusLogs.length === 0 ? (
                                                <div className="px-4 py-4 text-sm text-slate-500">{t.noStatusLogs}</div>
                                            ) : (
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full text-left text-sm">
                                                        <thead className="bg-slate-100 text-slate-600">
                                                            <tr>
                                                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em]">{t.oldStatus}</th>
                                                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em]">{t.newStatus}</th>
                                                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em]">{t.changedAt}</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {statusLogs.map((log) => (
                                                                <tr key={log.id} className="border-t border-slate-200 text-slate-900">
                                                                    <td className="px-4 py-3.5">{log.old_status || "-"}</td>
                                                                    <td className="px-4 py-3.5">{log.new_status || "-"}</td>
                                                                    <td className="px-4 py-3.5">{new Date(log.changed_at).toLocaleString()}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </section>
                                    )}

                                    {totalPages > 1 && (
                                        <div className="mt-6 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-4">
                                            <div className="text-sm text-slate-600">
                                                {t.page || "Page"} {currentPage} {t.of || "of"} {totalPages}
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                    disabled={currentPage === 1}
                                                    className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 transition duration-200 hover:border-sky-300 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                                                >
                                                    ← {t.previous || "Previous"}
                                                </button>
                                                <button
                                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                    disabled={currentPage === totalPages}
                                                    className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 transition duration-200 hover:border-sky-300 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                                                >
                                                    {t.next || "Next"} →
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AddIcon({ className }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

function PdfIcon({ className }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M7 3h7l5 5v13H7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
    );
}

function CodeIcon({ className }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="m9 8-4 4 4 4M15 8l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function UploadIcon({ className }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M12 16V5m0 0-4 4m4-4 4 4M5 19h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function RefreshIcon({ className }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M20 11a8 8 0 1 0 2 5.3M20 4v7h-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function SearchIcon({ className }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
            <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
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
            searchOrdersPlaceholder: "Search by order id, client, route",
            status: "Status",
            allStatuses: "All statuses",
            delivered: "Delivered",
            validated: "Validated",
            inProgress: "In Progress",
            pending: "Pending",
            cancelled: "Cancelled",
            records: "records",
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
            toastLoadFailedTitle: "Orders unavailable",
            toastTrucksUnavailableTitle: "Truck list unavailable",
            toastTrucksUnavailableDescription: "Some truck assignments may be temporarily unavailable.",
            toastSummaryUnavailableTitle: "Summary unavailable",
            toastSummaryUnavailableDescription: "Order summary could not be refreshed right now.",
            toastOrderDeletedTitle: "Order deleted",
            toastOrderDeletedDescription: "The order has been removed successfully.",
            toastDeleteFailedTitle: "Delete failed",
            toastOrderUpdatedTitle: "Order updated",
            toastOrderUpdatedDescription: "Your changes have been saved successfully.",
            toastOrderCreatedTitle: "Order created",
            toastOrderCreatedDescription: "The new order has been created successfully.",
            toastSaveFailedTitle: "Save failed",
            toastPdfExportedTitle: "PDF exported",
            toastPdfExportedDescription: "The orders report is ready for download.",
            toastPdfExportFailedTitle: "PDF export failed",
            toastXmlExportedTitle: "XML exported",
            toastXmlExportedDescription: "The XML file has been generated successfully.",
            toastXmlExportFailedTitle: "XML export failed",
            toastXmlImportedTitle: "XML imported",
            toastXmlImportedDescription: "Orders were imported successfully",
            toastXmlImportFailedTitle: "XML import failed",
            statusLogsTitle: "Status logs for order",
            closeLogs: "Close",
            loadingLogs: "Loading status logs...",
            noStatusLogs: "No status changes recorded yet.",
            oldStatus: "Old status",
            newStatus: "New status",
            changedAt: "Changed at",
            toastLogsUnavailableTitle: "Status logs unavailable",
            failedLoadLogs: "Failed to load status logs: ",
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
            searchOrdersPlaceholder: "Rechercher par id, client, trajet",
            status: "Statut",
            allStatuses: "Tous les statuts",
            delivered: "Livree",
            validated: "Validee",
            inProgress: "En cours",
            pending: "En attente",
            cancelled: "Annulee",
            records: "resultats",
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
            toastLoadFailedTitle: "Commandes indisponibles",
            toastTrucksUnavailableTitle: "Liste des camions indisponible",
            toastTrucksUnavailableDescription: "Certaines affectations de camions peuvent etre indisponibles temporairement.",
            toastSummaryUnavailableTitle: "Resume indisponible",
            toastSummaryUnavailableDescription: "Le resume des commandes ne peut pas etre actualise pour le moment.",
            toastOrderDeletedTitle: "Commande supprimee",
            toastOrderDeletedDescription: "La commande a ete supprimee avec succes.",
            toastDeleteFailedTitle: "Echec de suppression",
            toastOrderUpdatedTitle: "Commande mise a jour",
            toastOrderUpdatedDescription: "Vos modifications ont ete enregistrees avec succes.",
            toastOrderCreatedTitle: "Commande creee",
            toastOrderCreatedDescription: "La nouvelle commande a ete creee avec succes.",
            toastSaveFailedTitle: "Echec d'enregistrement",
            toastPdfExportedTitle: "PDF exporte",
            toastPdfExportedDescription: "Le rapport des commandes est pret au telechargement.",
            toastPdfExportFailedTitle: "Echec export PDF",
            toastXmlExportedTitle: "XML exporte",
            toastXmlExportedDescription: "Le fichier XML a ete genere avec succes.",
            toastXmlExportFailedTitle: "Echec export XML",
            toastXmlImportedTitle: "XML importe",
            toastXmlImportedDescription: "Les commandes ont ete importees avec succes",
            toastXmlImportFailedTitle: "Echec import XML",
            statusLogsTitle: "Historique de statut pour la commande",
            closeLogs: "Fermer",
            loadingLogs: "Chargement des logs de statut...",
            noStatusLogs: "Aucun changement de statut enregistre pour le moment.",
            oldStatus: "Ancien statut",
            newStatus: "Nouveau statut",
            changedAt: "Date de changement",
            toastLogsUnavailableTitle: "Logs de statut indisponibles",
            failedLoadLogs: "Echec du chargement des logs de statut : ",
        },
    };

    return translations[lang] || translations.en;
}
