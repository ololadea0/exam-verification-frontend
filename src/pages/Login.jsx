import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { loginAdmin } from "../slices/authSlice";
import { toast } from "sonner";
import Loading from "../components/Loading";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, isError, message } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (isError && message) {
      toast.error(message);
    }
  }, [isError, message]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const userData = {
      email: formData.email,
      password: formData.password,
    };
    const result = await dispatch(loginAdmin(userData));

    if (loginAdmin.fulfilled.match(result)) {
      navigate("/dashboard");
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-accent via-white to-secondary flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <img
                src="https://res.cloudinary.com/djw640wo2/image/upload/v1778417037/LAUTECH_logo_rd63if.png"
                alt="LAUTECH Logo"
                className="w-24 h-24 object-contain"
              />
            </div>
            <h1 className="text-foreground mb-2">LAUTECH</h1>
            <p className="text-muted-foreground">Exam Verification Portal</p>
          </div>
          <div className="bg-card rounded-lg shadow-sm border border-border p-8">
            <h2 className="text-foreground mb-6">Admin Login</h2>
            {isError && message ? (
              <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {message}
              </p>
            ) : null}
            <form className="space-y-5" onSubmit={onSubmit}>
              <div>
                <label className="block text-foreground mb-2">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="w-full px-4 py-2.5 bg-input-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required=""
                  value={formData.email}
                  onChange={onChange}
                />
              </div>
              <div>
                <label className="block text-foreground mb-2">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  className="w-full px-4 py-2.5 bg-input-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required=""
                  value={formData.password}
                  onChange={onChange}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground py-2.5 rounded-md hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70 transition-colors"
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>
          <p className="text-center text-muted-foreground mt-6">
            Ladoke Akintola University of Technology, Ogbomoso
          </p>
        </div>
      </div>
    </>
  );
}

export default Login;
