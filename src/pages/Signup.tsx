import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "employee">("employee");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/register", {
        name,
        email,
        password,
        role,
      });
      const { token, user } = res.data;

      login(token, user);

      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/employee");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.heading}>Sign up</h2>

        {error && <p style={styles.error}>{error}</p>}

        <label style={styles.label}>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
          required
        />

        <label style={styles.label}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          required
        />

        <label style={styles.label}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />

        <label style={styles.label}>Role (for testing only)</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "admin" | "employee")}
          style={styles.input}
        >
          <option value="employee">Employee</option>
          <option value="admin">Admin</option>
        </select>

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Signing up..." : "Sign up"}
        </button>

        <p style={styles.switchText}>
          Already have an account? <a href="/login">Log in</a>
        </p>
      </form>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "#f5f5f5",
  },
  form: {
    background: "#fff",
    padding: "32px",
    borderRadius: "8px",
    width: "320px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  heading: {
    marginBottom: "20px",
    textAlign: "center",
  },
  label: {
    display: "block",
    marginBottom: "4px",
    fontSize: "14px",
    color: "#333",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "16px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "10px",
    background: "#16a34a",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  error: {
    color: "red",
    fontSize: "13px",
    marginBottom: "12px",
  },
  switchText: {
    fontSize: "13px",
    textAlign: "center",
    marginTop: "16px",
  },
};

export default Signup;