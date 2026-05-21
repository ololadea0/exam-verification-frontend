import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Camera, Edit, Eye, RefreshCw, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  deleteStudent,
  editStudent,
  getStudents,
  reset,
} from "../slices/studentSlice";
import FACULTIES from "../constants/faculties";
import {
  formatNigerianPhoneNumber,
  isValidNigerianPhoneNumber,
  normalizeNigerianPhoneNumber,
} from "../utils/phoneNumber";

const formatDate = (value) => {
  if (!value) {
    return "Unavailable";
  }

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const getStudentId = (student) => student?._id || student?.id;

const capitalizeNamePart = (value) =>
  value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

const getFacultyForDepartment = (department) =>
  FACULTIES.find((faculty) => faculty.departments.includes(department))?.name ||
  "";

const splitStudentName = (name = "") => {
  const [firstName = "", ...lastNameParts] = name.trim().split(/\s+/);

  return {
    first_name: firstName,
    last_name: lastNameParts.join(" "),
  };
};

const toEditForm = (student) => {
  const nameParts = splitStudentName(student?.name);

  return {
    ...nameParts,
    matric_number: student?.matric_number || "",
    faculty: getFacultyForDepartment(student?.department),
    department: student?.department || "",
    phone_number: formatNigerianPhoneNumber(student?.phone_number || ""),
  };
};

function StudentsList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { students, pagination, isLoading, isError, message } = useSelector(
    (state) => state.students,
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [viewStudent, setViewStudent] = useState(null);
  const [editStudentRecord, setEditStudentRecord] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const selectedEditFaculty = FACULTIES.find(
    (faculty) => faculty.name === editForm?.faculty,
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(
        getStudents({
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

  const handleView = (student) => {
    setViewStudent(student);
  };

  const handleEdit = (student) => {
    setEditStudentRecord(student);
    setEditForm(toEditForm(student));
  };

  const closeEdit = () => {
    setEditStudentRecord(null);
    setEditForm(null);
  };

  const handleSaveEdit = async () => {
    const id = getStudentId(editStudentRecord);

    if (!id || !editForm) {
      return;
    }

    const payload = {
      name: [
        capitalizeNamePart(editForm.first_name),
        capitalizeNamePart(editForm.last_name),
      ]
        .filter(Boolean)
        .join(" "),
      department: editForm.department.trim(),
      phone_number: normalizeNigerianPhoneNumber(editForm.phone_number),
    };

    if (!payload.name || !payload.department || !payload.phone_number) {
      toast.error("Name, department, and phone number are required.");
      return;
    }

    if (!isValidNigerianPhoneNumber(editForm.phone_number)) {
      toast.error("Please enter a valid Nigerian phone number.");
      return;
    }

    const action = await dispatch(editStudent({ id, studentData: payload }));

    if (editStudent.fulfilled.match(action)) {
      toast.success("Student updated successfully");
      closeEdit();
      dispatch(reset());
    }
  };

  const handleReregisterFace = (student) => {
    navigate(`/dashboard/students/${getStudentId(student)}/reregister-face`, {
      state: { student },
    });
  };

  const handleDelete = async (student) => {
    const id = getStudentId(student);

    if (!id) {
      return;
    }

    const confirmed = window.confirm(
      `Delete ${student.name}? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    const action = await dispatch(deleteStudent(id));

    if (deleteStudent.fulfilled.match(action)) {
      toast.success("Student deleted successfully");
      dispatch(reset());
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-foreground">Students List</h2>
        <button
          type="button"
          onClick={() =>
            dispatch(
              getStudents({
                page,
                limit: pagination.limit,
                search: searchQuery.trim() || undefined,
              }),
            )
          }
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-border rounded-md hover:bg-accent transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {viewStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-card rounded-lg shadow-lg max-w-lg w-full max-h-[calc(100vh-2rem)] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
              <h3 className="text-foreground">Student Details</h3>
              <button
                type="button"
                onClick={() => setViewStudent(null)}
                className="p-1 hover:bg-accent rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="text-muted-foreground text-sm">
                  Full Name
                </label>
                <p className="text-foreground">{viewStudent.name}</p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm">
                  Matric Number
                </label>
                <p className="text-foreground">{viewStudent.matric_number}</p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm">
                  Department
                </label>
                <p className="text-foreground">{viewStudent.department}</p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm">
                  Phone Number
                </label>
                <p className="text-foreground">
                  {viewStudent.phone_number || "Unavailable"}
                </p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm">
                  Date Registered
                </label>
                <p className="text-foreground">
                  {formatDate(viewStudent.createdAt)}
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-border flex-shrink-0">
              <button
                type="button"
                onClick={() => setViewStudent(null)}
                className="w-full bg-primary text-primary-foreground py-2.5 rounded-md hover:bg-primary/90 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {editStudentRecord && editForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-card rounded-lg shadow-lg max-w-lg w-full max-h-[calc(100vh-2rem)] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
              <h3 className="text-foreground">Edit Student</h3>
              <button
                type="button"
                onClick={closeEdit}
                className="p-1 hover:bg-accent rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-foreground mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={editForm.first_name}
                    onChange={(event) =>
                      setEditForm({
                        ...editForm,
                        first_name: event.target.value,
                      })
                    }
                    onBlur={(event) =>
                      setEditForm({
                        ...editForm,
                        first_name: capitalizeNamePart(event.target.value),
                      })
                    }
                    className="w-full px-4 py-2.5 bg-input-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-foreground mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={editForm.last_name}
                    onChange={(event) =>
                      setEditForm({
                        ...editForm,
                        last_name: event.target.value,
                      })
                    }
                    onBlur={(event) =>
                      setEditForm({
                        ...editForm,
                        last_name: capitalizeNamePart(event.target.value),
                      })
                    }
                    className="w-full px-4 py-2.5 bg-input-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-foreground mb-2">
                  Matric Number
                </label>
                <input
                  type="text"
                  value={editForm.matric_number}
                  readOnly
                  className="w-full px-4 py-2.5 bg-muted border border-input rounded-md cursor-not-allowed opacity-60"
                  title="Matric number cannot be changed"
                />
                <p className="text-muted-foreground text-sm mt-1">
                  Matric number is read-only
                </p>
              </div>
              <div>
                <label className="block text-foreground mb-2">Faculty</label>
                <select
                  value={editForm.faculty}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      faculty: event.target.value,
                      department: "",
                    })
                  }
                  className="w-full px-4 py-2.5 bg-input-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select faculty</option>
                  {FACULTIES.map((faculty) => (
                    <option value={faculty.name} key={faculty.name}>
                      {faculty.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-foreground mb-2">Department</label>
                <select
                  value={editForm.department}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      department: event.target.value,
                    })
                  }
                  disabled={!selectedEditFaculty}
                  className="w-full px-4 py-2.5 bg-input-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {selectedEditFaculty
                      ? "Select department"
                      : "Select faculty first"}
                  </option>
                  {selectedEditFaculty?.departments.map((department) => (
                    <option value={department} key={department}>
                      {department}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-foreground mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={17}
                  placeholder="+234 803 123 4567"
                  value={editForm.phone_number}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      phone_number: formatNigerianPhoneNumber(
                        event.target.value,
                      ),
                    })
                  }
                  className="w-full px-4 py-2.5 bg-input-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="bg-accent border border-border rounded-md p-4">
                <p className="text-muted-foreground text-sm">
                  <strong>Note:</strong> biometric data is captured from the
                  registration workflow.
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-border flex gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={closeEdit}
                className="flex-1 border border-border py-2.5 rounded-md hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isLoading}
                className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

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
              placeholder="Search by name, matric number, department, or phone..."
              className="w-full pl-10 pr-4 py-2.5 bg-input-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-accent border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-foreground">Name</th>
                <th className="px-6 py-3 text-left text-foreground">
                  Matric Number
                </th>
                <th className="px-6 py-3 text-left text-foreground">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-foreground">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {students.map((student) => (
                <tr
                  key={getStudentId(student)}
                  className="hover:bg-accent/50 transition-colors"
                >
                  <td className="px-6 py-4 text-foreground">{student.name}</td>
                  <td className="px-6 py-4 text-foreground">
                    {student.matric_number}
                  </td>
                  <td className="px-6 py-4 text-foreground">
                    {student.department}
                  </td>
                  <td className="px-6 py-4 text-foreground">
                    {student.phone_number || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleView(student)}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-accent rounded-md transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEdit(student)}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-accent rounded-md transition-colors"
                        title="Edit Info"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReregisterFace(student)}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-accent rounded-md transition-colors border border-primary/20"
                        title="Re-register Face"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(student)}
                        disabled={isLoading}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-accent rounded-md transition-colors disabled:opacity-50"
                        title="Delete Student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!isLoading && students.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No students found
          </div>
        ) : null}

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading students...
          </div>
        ) : null}

        {pagination.total > 0 ? (
          <div className="p-4 border-t border-border flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.pages || 1} ·{" "}
              {pagination.total} students
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
    </>
  );
}

export default StudentsList;
