import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [emails, setEmails] = useState({});
  const [readme, setReadme] = useState(null);
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState({
    totalProjects: 0,
    totalNotes: 0,
    totalFiles: 0,
    memberContributions: []
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  async function getProjects() {
    const res = await fetch("http://localhost:5000/api/projects", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) setProjects(data.projects || data);
  }

  async function getStats() {
    const res = await fetch("http://localhost:5000/api/analytics", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) setStats(data);
  }
  async function createProject(e) {
    e.preventDefault();
    const res = await fetch("http://localhost:5000/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name, description })
    });
    const data = await res.json();
    if (res.ok) {
      setName("");
      setDescription("");
      getProjects();
      getStats();
    } else {
      alert(data.message);
    }
  }
  async function addMember(id) {
    const email = emails[id]?.trim();
    if (!email) return alert("Enter member email");
    const res = await fetch(`http://localhost:5000/api/projects/${id}/members`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    alert(data.message);
    if (res.ok) {
      setEmails({ ...emails, [id]: "" });
      getProjects();
      getStats();
    }
  }
  async function shareProject(id) {
    try {
      const res = await fetch(`http://localhost:5000/api/share/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) return alert(data.message);
      await navigator.clipboard.writeText(data.shareLink);
      alert("Share link copied successfully!\n" + data.shareLink);
    } catch {
      alert("Unable to generate share link");
    }
  }
  async function generateReadme(project) {
    try {
      setLoading(true);
      setReadme(null);
      const res = await fetch("http://localhost:5000/api/ai/readme", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          projectName: project.name,
          description: project.description
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setReadme({
        projectName: project.name,
        result: data.result
      });
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }
  function downloadReadme() {
    if (!readme) return;
    const blob = new Blob([readme.result], {
      type: "text/markdown"
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "README.md";
    link.click();
    window.URL.revokeObjectURL(url);
  }
  async function deleteProject(id) {
    if (!window.confirm("Delete this project?")) return;
    const res = await fetch(`http://localhost:5000/api/projects/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) {
      getProjects();
      getStats();
    } else {
      alert(data.message);
    }
  }
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.replace("/login");
  }
  useEffect(() => {
    if (!token) {
      window.location.replace("/login");
      return;
    }
    getProjects();
    getStats();
  }, []);

  return (
    <div className="dashboard">
      <header className="dash-header">
        <h1>✦ CollabSphere</h1>
        <button className="logout-btn" onClick={logout}>Logout ↗</button>
      </header>
      <main className="dash-main">
        <div className="welcome-box">
          <div>
            <p className="welcome-tag">YOUR WORKSPACE</p>
            <h2>Welcome to CollabSphere 👋</h2>
            <p>Manage your projects, collaborate and create something amazing.</p>
          </div>
          <div className="welcome-icon">✦</div>
        </div>
        <div className="stats">
          <div className="stat-card purple-card">
            <span>📁</span>
            <p>Total Projects</p>
            <h2>{stats.totalProjects}</h2>
          </div>
          <div className="stat-card blue-card">
            <span>📝</span>
            <p>Total Notes</p>
            <h2>{stats.totalNotes}</h2>
          </div>

          <div className="stat-card pink-card">
            <span>📂</span>
            <p>Total Files</p>
            <h2>{stats.totalFiles}</h2>
          </div>
        </div>
        <section className="dash-section">
          <div className="section-heading">
            <div>
              <p className="section-label">TEAM ACTIVITY</p>
              <h2>Member Contributions</h2>
            </div>
            <span className="section-icon">👥</span>
          </div>

          {stats.memberContributions?.length === 0 ? (
            <p className="empty-text">No contributions found</p>
          ) : (
            <div className="projects">
              {stats.memberContributions?.map((item, index) => (
                <div className="contribution-card" key={index}>
                  <h3>{item.projectName}</h3>
                  <p>👤 {item.memberName}</p>
                  <p>✉️ {item.email}</p>
                  <p>📝 Notes Created: {item.notesCreated}</p>
                  <p>📂 Files Uploaded: {item.filesUploaded}</p>
                </div>
              ))}
            </div>
          )}
        </section>
        <section className="dash-section create-section">
          <div className="section-heading">
            <div>
              <p className="section-label">GET STARTED</p>
              <h2>Create New Project</h2>
              <p>Start a new workspace for your ideas.</p>
            </div>
            <span className="section-icon">🚀</span>
          </div>
          <form onSubmit={createProject}>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter project name" required />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Write project description..." required />
            <button className="primary-btn">+ Create Project</button>
          </form>
        </section>

        <section className="dash-section">
          <div className="section-heading">
            <div>
              <p className="section-label">YOUR WORK</p>
              <h2>My Projects</h2>
              <p>All your projects in one place.</p>
            </div>
            <span className="section-icon">💻</span>
          </div>

          <div className="projects">
            {projects.length === 0 ? (
              <p className="empty-text">
                No projects found. Create your first project!
              </p>
            ) : (
              projects.map((project) => (
                <div className="project-card" key={project._id}>
                  <div className="project-title">
                    <span>📁</span>
                    <h3>{project.name}</h3>
                  </div>
                  <p>{project.description}</p>
                  <div className="project-actions">
                    <button onClick={() => navigate(`/editor/${project._id}`)}> 📝 Editor</button>
                    <button onClick={() => navigate(`/files/${project._id}`)}>📂 Files</button>
                    <button onClick={() => shareProject(project._id)}>🔗 Share</button>
                    <button onClick={() => generateReadme(project)} disabled={loading}>✨ Generate README </button>
                  </div>
                  <div className="members-box">
                    <h4>Team Members</h4>
                    {project.members?.map((member) => (
                      <p key={member._id}>
                        👤 {member.name} - {member.email}
                      </p>
                    ))}
                  </div>
                  <input
                    value={emails[project._id] || ""}
                    onChange={(e) => setEmails({
                      ...emails,
                      [project._id]: e.target.value
                    })}
                    placeholder="Enter member email" />
                  <button onClick={() => addMember(project._id)}>+ Add Member</button>
                  <button className="delete-btn" onClick={() => deleteProject(project._id)}>Delete Project</button>
                </div>
              ))
            )}
          </div>
        </section>
        {loading && (
          <section className="dash-section">
            <h3>✨ Gemini is generating README...</h3>
          </section>
        )}
        {readme && (
          <section className="dash-section">
            <h2>📄 README - {readme.projectName}</h2>
            <button className="primary-btn" onClick={downloadReadme}>Download README.md</button>
            <pre>{readme.result}</pre>
          </section>
        )}

      </main>
    </div>
  );
}
export default Dashboard;