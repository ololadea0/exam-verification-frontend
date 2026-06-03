import { useEffect, useState } from "react";
import { RefreshCw, Search, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { getAuditLogs, reset } from "../slices/auditLogSlice";

const formatDate = (value) => {
  if (!value) {
    return "Unavailable";
  }

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date(value));
};

const formatMetadata = (metadata) => {
  if (!metadata || typeof metadata !== "object") {
    return "None";
  }

  return Object.entries(metadata)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(", ");
};

function AuditTrail() {
  const dispatch = useDispatch();
  const { auditLogs, pagination, isLoading, isError, message } = useSelector(
    (state) => state.auditLogs,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(
        getAuditLogs({
          page,
          limit: pagination.limit,
          search: searchQuery.trim() || undefined,
        }),
      );
    }, 250);

    return () => clearTimeout(timer);
  }, [dispatch, page, pagination.limit, searchQuery]);

  useEffect(() => () => {
    dispatch(reset());
  }, [dispatch]);

  useEffect(() => {
    if (isError && message) {
      toast.error(message);
    }
  }, [isError, message]);

  const refreshAuditLogs = () => {
    dispatch(
      getAuditLogs({
        page,
        limit: pagination.limit,
        search: searchQuery.trim() || undefined,
      }),
    );
  };

  return (
    <div>
      <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-foreground">Audit Trail</h2>
        <button
          type="button"
          onClick={refreshAuditLogs}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-md hover:bg-accent transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="bg-card rounded-lg shadow-sm border border-border">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search by admin, action, or entity..."
              className="w-full pl-10 pr-4 py-2.5 bg-input-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-accent border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-foreground">Admin</th>
                <th className="px-6 py-3 text-left text-foreground">Action</th>
                <th className="px-6 py-3 text-left text-foreground">Entity</th>
                <th className="px-6 py-3 text-left text-foreground">
                  Metadata
                </th>
                <th className="px-6 py-3 text-left text-foreground">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {auditLogs.map((log) => (
                <tr key={log._id} className="hover:bg-accent/50 transition-colors">
                  <td className="px-6 py-4 text-foreground">
                    {log.admin_email || log.admin?.email || "Unknown admin"}
                  </td>
                  <td className="px-6 py-4 text-foreground">{log.action}</td>
                  <td className="px-6 py-4 text-foreground">
                    {log.entity}
                    {log.entity_id ? ` (${log.entity_id})` : ""}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground max-w-md">
                    <span className="line-clamp-2">
                      {formatMetadata(log.metadata)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {formatDate(log.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!isLoading && auditLogs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <ShieldCheck className="w-10 h-10 mx-auto mb-3" />
            No audit records found
          </div>
        ) : null}

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading audit trail...
          </div>
        ) : null}

        {pagination.total > 0 ? (
          <div className="p-4 border-t border-border flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.pages || 1} -{" "}
              {pagination.total} records
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((currentPage) => currentPage - 1)}
                disabled={isLoading || pagination.page <= 1}
                className="px-3 py-2 border border-border rounded-md hover:bg-accent transition-colors disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((currentPage) => currentPage + 1)}
                disabled={isLoading || pagination.page >= pagination.pages}
                className="px-3 py-2 border border-border rounded-md hover:bg-accent transition-colors disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default AuditTrail;
