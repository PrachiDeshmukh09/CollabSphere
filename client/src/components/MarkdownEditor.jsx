function MarkdownEditor({ content, setContent }) {
  return (
    <div>
      <h3>Write Notes</h3>
      <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your notes here..." rows="10" />
      <h3>Preview</h3>
      <pre>{content}</pre>
    </div>
  );
}
export default MarkdownEditor;