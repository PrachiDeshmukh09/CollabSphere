import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MDEditor from "@uiw/react-md-editor";
import AIchat from "../components/Aichat";
import NoteCard from "../components/NoteCard";

function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState([]);
  const [editId, setEditId] = useState(null);
  const [ownerId, setOwnerId] = useState("");
  const API = "http://localhost:5000/api/notes";

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.id || user._id;
  async function request(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        ...options.headers
      }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }
    return data;
  }

  async function getNotes() {
    try {
      const data = await request(`${API}/${id}`);
      setNotes(data.notes || []);
      setOwnerId(data.ownerId || "");
    } catch (error) {
      alert(error.message);
    }
  }
  async function saveNote(e) {
    e.preventDefault();
    try {
      await request(
        editId ? `${API}/${editId}` : API,
        {
          method: editId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            title,
            content,
            projectId: id
          })
        }
      );

      alert(editId ? "Note updated!" : "Note saved!");
      setTitle("");
      setContent("");
      setEditId(null);
      getNotes();
    } catch (error) {
      alert(error.message);
    }
  }
  function editNote(note) {
    setTitle(note.title);
    setContent(note.content);
    setEditId(note._id);
  }
  async function deleteNote(noteId) {
    if (!window.confirm("Delete this note?")) return;
    try {
      await request(`${API}/${noteId}`, {
        method: "DELETE"
      });
      alert("Note deleted!");
      if (editId === noteId) {
        cancelEdit();
      }
      getNotes();
    } catch (error) {
      alert(error.message);
    }
  }
  async function togglePublic(note) {
    const newStatus = !note.isPublic;

    try {
      await request(`${API}/${note._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          isPublic: newStatus
        })
      });
      alert(newStatus ? "Note is now Public!" : "Note is now Private!");
      getNotes();
    } catch (error) {
      alert(error.message);
    }
  }
  function cancelEdit() {
    setEditId(null);
    setTitle("");
    setContent("");
  }

  useEffect(() => {
    getNotes();
  }, [id]);
  const isOwner = userId === ownerId;

  return (
    <div>
      <h1>Project Editor</h1>

      <button onClick={() => navigate("/dashboard")}>Back</button>
      <h2>{editId ? "Edit Note" : "Create Note"}</h2>
      <form onSubmit={saveNote}>
        <input type="text" placeholder="Note Title" value={title} onChange={(e) => setTitle(e.target.value)} required />

        <div data-color-mode="dark">
          <MDEditor value={content} onChange={(value) => setContent(value || "")} height={300} />
        </div>

        <button type="submit">
          {editId ? "Update Note" : "Save Note"}
        </button>

        {editId && (
          <button type="button" onClick={cancelEdit}>Cancel</button>
        )}
      </form>

      <AIchat text={content} />
      <h2>My Notes</h2>
      {notes.length === 0 ? (
        <p>No notes found</p>
      ) : (
        notes.map((note) => {
          const canEdit =
            isOwner ||
            userId === note.author?._id;

          return (
            <NoteCard
              key={note._id}
              note={note}
              isOwner={isOwner}
              canEdit={canEdit}
              onTogglePublic={togglePublic}
              onEdit={editNote}
              onDelete={deleteNote}
            />
          );
        })
      )}
    </div>
  );
}
export default Editor;