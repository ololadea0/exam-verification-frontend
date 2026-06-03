import { useEffect, useState } from "react";
import { CalendarCheck, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { getAttendance, reset } from "../slices/attendanceSlice";
import { getCourses } from "../slices/courseSlice";

const formatConfidence = (confidence) => {
  if (typeof confidence !== "number") {
    return "Unavailable";
  }

  const percentage =
    confidence <= 1 ? Math.round(confidence * 100) : Math.round(confidence);

  return `${percentage}%`;
};

const formatDateTime = (value) => {
  if (!value) {
    return "Unavailable";
  }

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date(value));
};

function Attendance() {
  const dispatch = useDispatch();
  const { attendance, pagination, isLoading, isError, message } = useSelector(
    (state) => state.attendance,
  );
  const { courses } = useSelector((state) => state.courses);
  const [searchQuery, setSearchQuery] = useState("");
  const [attendanceDate, setAttendanceDate] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(getCourses());
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(
        getAttendance({
          page,
          limit: pagination.limit,
          search: searchQuery.trim() || undefined,
          date: attendanceDate || undefined,
          course_id: selectedCourseId || undefined,
        }),
      );
    }, 250);

    return () => {
      clearTimeout(timer);
    };
  }, [
    attendanceDate,
    dispatch,
    page,
    pagination.limit,
    searchQuery,
    selectedCourseId,
  ]);

  useEffect(
    () => () => {
      dispatch(reset());
    },
    [dispatch],
  );

  useEffect(() => {
    if (isError && message) {
      toast.error(message);
    }
  }, [isError, message]);

  const refreshAttendance = () => {
    dispatch(
      getAttendance({
        page,
        limit: pagination.limit,
        search: searchQuery.trim() || undefined,
        date: attendanceDate || undefined,
        course_id: selectedCourseId || undefined,
      }),
    );
  };

  return (
    <div>
      <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-foreground">Attendance</h2>
        <button
          type="button"
          onClick={refreshAttendance}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-md hover:bg-accent transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="bg-card rounded-lg shadow-sm border border-border">
        <div className="grid grid-cols-1 gap-3 p-4 border-b border-border md:grid-cols-[1fr_220px_260px]">
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
          <input
            type="date"
            value={attendanceDate}
            onChange={(event) => {
              setAttendanceDate(event.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2.5 bg-input-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Filter attendance by date"
          />
          <select
            value={selectedCourseId}
            onChange={(event) => {
              setSelectedCourseId(event.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2.5 bg-input-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Filter attendance by course"
          >
            <option value="">All courses</option>
            {courses.map((course) => (
              <option value={course._id} key={course._id}>
                {course.course_code} - {course.course_title}
              </option>
            ))}
          </select>
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
                  Attendance Date
                </th>
                <th className="px-6 py-3 text-left text-foreground">
                  Verified At
                </th>
                <th className="px-6 py-3 text-left text-foreground">
                  Confidence
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {attendance.map((record) => {
                const student = record.student || {};

                return (
                  <tr
                    key={record._id}
                    className="hover:bg-accent/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-foreground">
                      {student.name || "Unknown Student"}
                    </td>
                    <td className="px-6 py-4 text-foreground">
                      {record.matric_number || student.matric_number || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-foreground">
                      {student.department || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-foreground">
                      {record.course_code ||
                        record.course?.course_code ||
                        "N/A"}
                    </td>
                    <td className="px-6 py-4 text-foreground">
                      {record.attendance_date || "Unavailable"}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {formatDateTime(record.verified_at || record.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-green-700">
                      {formatConfidence(record.confidence)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!isLoading && attendance.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <CalendarCheck className="w-10 h-10 mx-auto mb-3" />
            No attendance records found
          </div>
        ) : null}

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading attendance records...
          </div>
        ) : null}

        {pagination.total > 0 ? (
          <div className="p-4 border-t border-border flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.pages || 1} ·{" "}
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

export default Attendance;
