import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function PublicProject() {
  const { shareId } = useParams();

  const [project, setProject] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  async function getPublicProject() {
    try {
      const response = await fetch(
        `http://localhost:5000/api/share/public/${shareId}`
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      setProject(data.project);
      setNotes(data.notes);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getPublicProject();
  }, [shareId]);

  if (loading) return <h2>Loading Project...</h2>;
  if (!project) return <h2>Project not found</h2>;

  return (
    <div className="dashboard">
      <h1>CollabSphere - Public Project</h1>

      <div className="project-card">
        <h2>{project.name}</h2>
        <p>{project.description}</p>
        <p>🔒 Read Only Access</p>
      </div>

      <h2>Project Notes</h2>
      {notes.length === 0 ? (
        <p>No notes available</p>
      ) : (
        notes.map((note) => (
          <div className="project-card" key={note._id}>
            <h3>{note.title}</h3>
            <pre style={{ whiteSpace: "pre-wrap" }}>
              {note.content}
            </pre>
          </div>
        ))
      )}
    </div>
  );
}
export default PublicProject;