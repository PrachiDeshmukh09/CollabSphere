import { useState } from "react";
import { Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.message);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "/dashboard";

    } catch (error) {
      setError("Server se connection nahi ho paya.");
    }
  }

  return (
    <div className="login-page">
      <form className="login-box" onSubmit={handleLogin}>
        <h1>Welcome Back!</h1>
        <p>Login to your CollabSphere account</p>
        <input type="email" placeholder="Enter Email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <input type="password" placeholder="Enter Password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        {error && <p className="login-error">{error}</p>}
        <button type="submit">Login</button>

        <p>Don't have an account? <Link to="/register">Register</Link></p>
      </form>
    </div>
  );
}
export default Login;