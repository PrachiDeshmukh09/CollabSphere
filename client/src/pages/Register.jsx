import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleRegister(e) {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.message);
        return;
      }

      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (error) {
      setError("Server se connection nahi ho paya.");
    }
  }

  return (
    <div>
      <h1>CollabSphere Register</h1>
      <form onSubmit={handleRegister}>
        <input type="text"placeholder="Enter Name"value={name}onChange={(e) => setName(e.target.value)}required/>
        <br /><br />

        <input type="email"placeholder="Enter Email" value={email}onChange={(e) => setEmail(e.target.value)}required/>
        <br /><br />

        <input type="password"placeholder="Enter Password"value={password}onChange={(e) => setPassword(e.target.value)}required/>
        <br /><br />

        <button type="submit">Register</button>
      </form>
      {error && <p>{error}</p>}

      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}
export default Register;