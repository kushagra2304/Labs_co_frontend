import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ color: "#1f2937" }}>Employee Dashboard</h1>
      <p style={{ color: "#4b5563", fontSize: "16px" }}>Welcome, <strong>{user?.name}</strong> ({user?.role})</p>
      <p style={{ color: "#6b7280", marginBottom: "24px" }}>This page is only visible to employees.</p>
      
      <div style={{ display: "flex", gap: "12px" }}>
        <button 
          onClick={() => navigate("/chat")} 
          style={{
            padding: "10px 20px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
            transition: "background 0.2s"
          }}
        >
          Go to Chat
        </button>
        <button 
          onClick={handleLogout} 
          style={{
            padding: "10px 20px",
            background: "#ef4444",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
            transition: "background 0.2s"
          }}
        >
          Log out
        </button>
      </div>
    </div>
  );
};

export default EmployeeDashboard;