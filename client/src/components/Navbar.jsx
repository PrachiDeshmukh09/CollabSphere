import { Link, useNavigate } from "react-router-dom";
function Navbar() {
  const navigate = useNavigate();
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <nav>
      <h2>CollabSphere</h2>
      <Link to="/dashboard">Dashboard</Link>
      <button onClick={logout}>Logout</button>
    </nav>
  );
}
export default Navbar;