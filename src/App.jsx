import {
  BrowserRouter as Router,
  Navigate,
  Routes,
  Route,
} from "react-router-dom";
import { Toaster } from "sonner";
import Login from "./pages/Login";
import RegisterStudent from "./pages/Register";
import Logs from "./pages/Logs";
import Attendance from "./pages/Attendance";
import Courses from "./pages/Courses";
import VerifyStudent from "./pages/VerifyStudent";
import StudentsList from "./pages/StudentsList";
import ReregisterFace from "./pages/Re-RegisterFace";
import DashboardLayout from "./components/DashboardLayout";
function App() {
  return (
    <>
      <div id="container">
        <div className="tailwind">
          <div id="fig-code-root">
            <Router>
              <Routes>
                <Route path="/" element={<Login />}></Route>
                <Route path="/dashboard" element={<DashboardLayout />}>
                  <Route
                    index
                    element={<Navigate to="/dashboard/register" replace />}
                  />
                  <Route path="register" element={<RegisterStudent />} />
                  <Route path="verify" element={<VerifyStudent />} />
                  <Route path="students" element={<StudentsList />} />
                  <Route path="courses" element={<Courses />} />
                  <Route
                    path="students/:id/reregister-face"
                    element={<ReregisterFace />}
                  />
                  <Route path="logs" element={<Logs />} />
                  <Route path="attendance" element={<Attendance />} />
                </Route>
              </Routes>
            </Router>
            <Toaster position="top-right" />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
