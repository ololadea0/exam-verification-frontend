import { useEffect, useState } from "react";
import { BookOpen, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import {
  createCourse,
  deleteCourse,
  getCourses,
  reset,
} from "../slices/courseSlice";

const initialForm = {
  course_code: "",
  course_title: "",
  department: "",
};

function Courses() {
  const dispatch = useDispatch();
  const { courses, isLoading, isError, message } = useSelector(
    (state) => state.courses,
  );
  const [form, setForm] = useState(initialForm);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(getCourses({ search: searchQuery.trim() || undefined }));
    }, 250);

    return () => clearTimeout(timer);
  }, [dispatch, searchQuery]);

  useEffect(() => () => {
    dispatch(reset());
  }, [dispatch]);

  useEffect(() => {
    if (isError && message) {
      toast.error(message);
    }
  }, [isError, message]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      course_code: form.course_code.trim().toUpperCase(),
      course_title: form.course_title.trim(),
      department: form.department.trim(),
    };

    if (!payload.course_code || !payload.course_title) {
      toast.error("Course code and course title are required.");
      return;
    }

    const action = await dispatch(createCourse(payload));

    if (createCourse.fulfilled.match(action)) {
      toast.success("Course added successfully");
      setForm(initialForm);
    }
  };

  const handleDelete = async (course) => {
    const confirmed = window.confirm(`Delete ${course.course_code}?`);

    if (!confirmed) {
      return;
    }

    const action = await dispatch(deleteCourse(course._id));

    if (deleteCourse.fulfilled.match(action)) {
      toast.success("Course deleted successfully");
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-foreground">Courses</h2>
        <button
          type="button"
          onClick={() =>
            dispatch(getCourses({ search: searchQuery.trim() || undefined }))
          }
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-md hover:bg-accent transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
        <form
          className="bg-card rounded-lg shadow-sm border border-border p-6 space-y-4"
          onSubmit={handleSubmit}
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h3 className="text-foreground">Add Course</h3>
          </div>
          <div>
            <label className="block text-foreground mb-2" htmlFor="course_code">
              Course Code
            </label>
            <input
              id="course_code"
              type="text"
              value={form.course_code}
              onChange={(event) =>
                setForm({ ...form, course_code: event.target.value })
              }
              onBlur={(event) =>
                setForm({
                  ...form,
                  course_code: event.target.value.trim().toUpperCase(),
                })
              }
              placeholder="CSE501"
              className="w-full px-4 py-2.5 bg-input-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label
              className="block text-foreground mb-2"
              htmlFor="course_title"
            >
              Course Title
            </label>
            <input
              id="course_title"
              type="text"
              value={form.course_title}
              onChange={(event) =>
                setForm({ ...form, course_title: event.target.value })
              }
              placeholder="Artificial Intelligence"
              className="w-full px-4 py-2.5 bg-input-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-foreground mb-2" htmlFor="department">
              Department
            </label>
            <input
              id="department"
              type="text"
              value={form.department}
              onChange={(event) =>
                setForm({ ...form, department: event.target.value })
              }
              placeholder="Computer Science"
              className="w-full px-4 py-2.5 bg-input-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex w-full items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {isLoading ? "Saving..." : "Add Course"}
          </button>
        </form>

        <div className="bg-card rounded-lg shadow-sm border border-border">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search courses..."
                className="w-full pl-10 pr-4 py-2.5 bg-input-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-accent border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-foreground">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-foreground">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-foreground">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {courses.map((course) => (
                  <tr
                    key={course._id}
                    className="hover:bg-accent/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-foreground">
                      {course.course_code}
                    </td>
                    <td className="px-6 py-4 text-foreground">
                      {course.course_title}
                    </td>
                    <td className="px-6 py-4 text-foreground">
                      {course.department || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => handleDelete(course)}
                        disabled={isLoading}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-accent rounded-md transition-colors disabled:opacity-50"
                        title="Delete course"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!isLoading && courses.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No courses found
            </div>
          ) : null}
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading courses...
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default Courses;
