import { useEffect, useState } from "react";
import { CheckCircle, RefreshCw, Search, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { getLogs, getTimingSummary, reset } from "../slices/logSlice";

const formatConfidence = (confidence) => {
  if (typeof confidence !== "number") {
    return "Unavailable";
  }

  const percentage =
    confidence <= 1 ? Math.round(confidence * 100) : Math.round(confidence);

  return `${percentage}%`;
};

const getConfidenceClass = (confidence) => {
  const percentage = confidence <= 1 ? confidence * 100 : confidence;

  if (percentage >= 80) {
    return "text-green-700";
  }

  if (percentage >= 60) {
    return "text-yellow-700";
  }

  return "text-red-700";
};

const formatDate = (value) => {
  if (!value) {
    return "Unavailable";
  }

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date(value));
};

const formatMetricMs = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return String(Math.round(number * 100) / 100);
};

function Logs() {
  const dispatch = useDispatch();
  const {
    logs,
    pagination,
    timingSummary,
    isLoading,
    isLoadingTimingSummary,
    isError,
    message,
  } = useSelector(
    (state) => state.logs,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(getTimingSummary());
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(
        getLogs({
          page,
          limit: pagination.limit,
          search: searchQuery.trim() || undefined,
        }),
      );
    }, 250);

    return () => {
      clearTimeout(timer);
    };
  }, [dispatch, page, pagination.limit, searchQuery]);

  useEffect(() => () => {
    dispatch(reset());
  }, [dispatch]);

  useEffect(() => {
    if (isError && message) {
      toast.error(message);
    }
  }, [isError, message]);

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-foreground">Verification Logs</h2>
        <button
          type="button"
          onClick={() => {
            dispatch(getTimingSummary());
            dispatch(
              getLogs({
                page,
                limit: pagination.limit,
                search: searchQuery.trim() || undefined,
              }),
            );
          }}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-border rounded-md hover:bg-accent transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="bg-card rounded-lg shadow-sm border border-border mb-6">
        <div className="p-4 border-b border-border flex items-center justify-between gap-4">
          <div>
            <h3 className="text-foreground">Verification Timing Summary</h3>
            <p className="text-sm text-muted-foreground">
              {timingSummary?.attempts || 0} successful verification attempts
            </p>
          </div>
          {isLoadingTimingSummary ? (
            <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : null}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-accent border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-foreground">Stage</th>
                <th className="px-6 py-3 text-left text-foreground">
                  Minimum Time (ms)
                </th>
                <th className="px-6 py-3 text-left text-foreground">
                  Maximum Time (ms)
                </th>
                <th className="px-6 py-3 text-left text-foreground">
                  Mean Time (μ) (ms)
                </th>
                <th className="px-6 py-3 text-left text-foreground">
                  Standard Deviation (σ)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(timingSummary?.stages || []).map((stage) => (
                <tr key={stage.stage} className="hover:bg-accent/50">
                  <td className="px-6 py-4 text-foreground">{stage.stage}</td>
                  <td className="px-6 py-4 text-foreground">
                    {formatMetricMs(stage.min_ms)}
                  </td>
                  <td className="px-6 py-4 text-foreground">
                    {formatMetricMs(stage.max_ms)}
                  </td>
                  <td className="px-6 py-4 text-foreground">
                    {formatMetricMs(stage.mean_ms)}
                  </td>
                  <td className="px-6 py-4 text-foreground">
                    {formatMetricMs(stage.std_dev_ms)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
              placeholder="Search by matric number..."
              className="w-full pl-10 pr-4 py-2.5 bg-input-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-accent border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-foreground">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-foreground">
                  Matric Number
                </th>
                <th className="px-6 py-3 text-left text-foreground">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-foreground">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-foreground">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-foreground">
                  Confidence
                </th>
                <th className="px-6 py-3 text-left text-foreground">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.map((log) => {
                const student = log.student || {};
                const verified = Boolean(log.verified);

                return (
                  <tr
                    key={log._id}
                    className="hover:bg-accent/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-foreground">
                      {student.name || "Unknown Student"}
                    </td>
                    <td className="px-6 py-4 text-foreground">
                      {log.matric_number || student.matric_number || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-foreground">
                      {student.department || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-foreground">
                      {log.course_code || log.course?.course_code || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {verified ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="text-green-700">Success</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-5 h-5 text-red-500" />
                            <span className="text-red-700">Failure</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={getConfidenceClass(log.confidence)}>
                        {formatConfidence(log.confidence)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {formatDate(log.timestamp || log.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!isLoading && logs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No verification logs found
          </div>
        ) : null}

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading verification logs...
          </div>
        ) : null}

        {pagination.total > 0 ? (
          <div className="p-4 border-t border-border flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.pages || 1} ·{" "}
              {pagination.total} logs
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

export default Logs;
