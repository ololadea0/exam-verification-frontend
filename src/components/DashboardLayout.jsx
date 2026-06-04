import { useEffect, useState } from "react";
import {
  UserPlus,
  Camera,
  Users,
  FileText,
  CalendarCheck,
  BookOpen,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentAdmin, logoutUser, reset } from "../slices/authSlice";

function DashBoardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { admin } = useSelector((state) => state.auth);
  const navLinkClass = ({ isActive }) =>
    [
      "flex items-center gap-3 px-4 py-3 rounded-md transition-colors",
      isActive
        ? "bg-sidebar-primary text-sidebar-primary-foreground"
        : "text-sidebar-foreground hover:bg-sidebar-accent",
    ].join(" ");

  useEffect(() => {
    if (admin) {
      return;
    }

    dispatch(getCurrentAdmin()).then((action) => {
      if (getCurrentAdmin.rejected.match(action)) {
        navigate("/");
      }
    });
  }, [admin, dispatch, navigate]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    dispatch(reset());
    navigate("/");
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="h-dvh bg-background flex overflow-hidden">
      {isSidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          aria-label="Close navigation menu"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 w-72 max-w-[82vw] bg-sidebar border-r border-sidebar-border overflow-y-auto transition-transform duration-200 md:static md:z-auto md:w-64 md:max-w-none md:flex-shrink-0 md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="p-4 sm:p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <img
              src="https://res.cloudinary.com/djw640wo2/image/upload/v1778417037/LAUTECH_logo_rd63if.png"
              alt="LAUTECH Logo"
              className="w-12 h-12 object-contain flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h2 className="text-sidebar-foreground">LAUTECH</h2>
              <p className="text-muted-foreground text-sm">Exam Verification</p>
            </div>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-sidebar-foreground hover:bg-sidebar-accent md:hidden"
              aria-label="Close navigation menu"
              onClick={closeSidebar}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <nav className="p-4">
          <ul className="space-y-1">
            <li>
              <NavLink
                className={navLinkClass}
                to="/dashboard/register"
                onClick={closeSidebar}
              >
                <UserPlus className="w-5 h-5" />
                <span>Register Student</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                className={navLinkClass}
                to="/dashboard/verify"
                onClick={closeSidebar}
              >
                <Camera className="w-5 h-5" />
                <span>Verify Student</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                className={navLinkClass}
                to="/dashboard/students"
                onClick={closeSidebar}
              >
                <Users className="w-5 h-5" />
                <span>Students List</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                className={navLinkClass}
                to="/dashboard/courses"
                onClick={closeSidebar}
              >
                <BookOpen className="w-5 h-5" />
                <span>Courses</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                className={navLinkClass}
                to="/dashboard/logs"
                onClick={closeSidebar}
              >
                <FileText className="w-5 h-5" />
                <span>Logs</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                className={navLinkClass}
                to="/dashboard/attendance"
                onClick={closeSidebar}
              >
                <CalendarCheck className="w-5 h-5" />
                <span>Attendance</span>
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>
      <div className="flex-1 min-w-0 flex flex-col h-dvh">
        <header className="flex-shrink-0 bg-card border-b border-border px-3 py-3 shadow-sm sm:px-6 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <button
                type="button"
                className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md text-foreground hover:bg-accent md:hidden"
                aria-label="Open navigation menu"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
              <img
                src="https://res.cloudinary.com/djw640wo2/image/upload/v1778417037/LAUTECH_logo_rd63if.png"
                alt="LAUTECH"
                className="hidden w-10 h-10 object-contain sm:block"
              />
              <h1 className="text-base leading-tight text-foreground sm:text-xl truncate">
                Facial Recognition Exam Verification System
              </h1>
            </div>
            <button
              className="flex flex-shrink-0 items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors sm:px-4"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-3 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashBoardLayout;
