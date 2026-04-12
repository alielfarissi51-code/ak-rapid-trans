export default function UsersTable({ users, onEdit, onDelete }) {
    return (
        <div className="overflow-hidden rounded-3xl border border-white/8 bg-[#0b1324]/70 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
            <table className="min-w-full divide-y divide-white/5 text-left text-sm">
                <thead className="bg-white/[0.03] text-slate-400">
                    <tr>
                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider">
                            Name
                        </th>
                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider">
                            Email
                        </th>
                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider">
                            Role
                        </th>
                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {users.length > 0 ? (
                        users.map((user) => (
                            <tr key={user.id} className="transition hover:bg-white/[0.03]">
                                <td className="whitespace-nowrap px-5 py-4 font-medium text-white">
                                    {user.name}
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 text-slate-300">
                                    {user.email}
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 text-slate-300">
                                    <span className="inline-flex rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-semibold text-sky-300">
                                        {user.role?.name || "N/A"}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 text-sm font-medium space-x-3">
                                    <button
                                        onClick={() => onEdit(user)}
                                        className="text-sky-300 transition hover:text-sky-200"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => onDelete(user.id)}
                                        className="text-rose-300 transition hover:text-rose-200"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="px-5 py-8 text-center text-slate-400">
                                No users found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
