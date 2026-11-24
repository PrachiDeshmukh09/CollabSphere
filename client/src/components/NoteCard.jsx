
import MDEditor from "@uiw/react-md-editor";

function NoteCard({
  note,
  isOwner,
  canEdit,
  onTogglePublic,
  onDelete,
  onEdit
}) {
  return (
    <div className="project-card">
      <h3>{note.title}</h3>

      <div data-color-mode="dark">
        <MDEditor.Markdown source={note.content} />
      </div>

      <small>
        Created by: {note.author?.name || "Unknown"}
      </small>

      <p>
        Status: {note.isPublic ? "🌍 Public" : "🔒 Private"}
      </p>

      {isOwner && (
        <button onClick={() => onTogglePublic(note)}>
          {note.isPublic ? "Make Private" : "Make Public"}
        </button>
      )}

      {canEdit && (
        <>
          <button onClick={() => onEdit(note)}>
            Edit
          </button>

          <button onClick={() => onDelete(note._id)}>
            Delete
          </button>
        </>
      )}
    </div>
  );
}

export default NoteCard;
