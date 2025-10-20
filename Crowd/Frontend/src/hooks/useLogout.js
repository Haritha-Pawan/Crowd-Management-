import { useNavigate } from "react-router-dom";

const useLogout = () => {
  const navigate = useNavigate();

  const logout = () => {
    // ✅ Remove JWT token and any stored user data
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Optional: clear sessionStorage too
    sessionStorage.clear();

    // ✅ Redirect user to login page
    navigate("/");

    // Optional: success toast
    console.log("✅ Logged out successfully");
  };

  return logout;
};

export default useLogout;
