import { useEffect, useState } from "react";
import { BookOpen, Plus, RefreshCw, Search, Trash2, X } from "lucide-react";
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
};

function Courses() {
  const dispatch = useDispatch();
  const { courses, isLoading, isError, message } = useSelector(
    (state) => state.courses,
  );
  const [form, setForm] = useState(initialForm);
  const [searchQuery, setSearchQuery] = useState("");
  const [courseToDelete, setCourseToDelete] = useState(null);

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

  const handleDelete = async () => {
    if (!courseToDelete?._id) {
      return;
    }

    const action = await dispatch(deleteCourse(courseToDelete._id));

    if (deleteCourse.fulfilled.match(action)) {
      toast.success("Course deleted successfully");
      setCourseToDelete(null);
    }
  };

  return (
    <div>
      {courseToDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-card shadow-lg">
            <div className="flex items-center justify-between border-b border-border p-6">
              <h3 className="text-foreground">Delete Course</h3>
              <button
                type="button"
                onClick={() => setCourseToDelete(null)}
                className="p-1 hover:bg-accent rounded-md transition-colors"
                aria-label="Close confirmation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-foreground">
                Delete {courseToDelete.course_code}?
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 border-t border-border p-6">
              <button
                type="button"
                onClick={() => setCourseToDelete(null)}
                className="flex-1 border border-border py-2.5 rounded-md hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isLoading}
                className="flex-1 bg-destructive text-destructive-foreground py-2.5 rounded-md hover:bg-destructive/90 transition-colors disabled:opacity-50"
              >
                {isLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

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
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => setCourseToDelete(course)}
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
