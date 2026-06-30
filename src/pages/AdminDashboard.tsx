import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user?.name} ({user?.role})</p>
      <p>This page is only visible to admins.</p>
      <button onClick={handleLogout}>Log out</button>
    </div>
  );
};

export default AdminDashboard;