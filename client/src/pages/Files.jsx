
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function Files() {
  const { id } = useParams();
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [explanation, setExplanation] = useState("");
  const [documentation, setDocumentation] = useState("");
  const [loading, setLoading] = useState(false);

  const API = "http://localhost:5000/api/files";
  const AI_API = "http://localhost:5000/api/ai";
  const token = localStorage.getItem("token");
  async function getFiles() {
    try {
      const response = await fetch(`${API}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }

      setFiles(data);
    } catch (error) {
      alert(error.message);
    }
  }
  async function uploadFile(e) {
    e.preventDefault();
    if (!file) {
      alert("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("projectId", id);

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }

      alert("File uploaded successfully!");
      setFile(null);
      e.target.reset();
      getFiles();
    } catch (error) {
      alert(error.message);
    }
  }
  async function explainCode(fileId) {
    try {
      setLoading(true);
      const response = await fetch(
        `${AI_API}/explain-file/${fileId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      setExplanation(data.result);
      setDocumentation("");

    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }
  async function generateDocumentation(item) {
    try {
      setLoading(true);
      const fileResponse = await fetch(
        `http://localhost:5000${item.url}`
      );
      if (!fileResponse.ok) {
        throw new Error("Unable to read uploaded file");
      }

      const code = await fileResponse.text();
      if (!code.trim()) {
        throw new Error("File is empty");
      }
      if (code.length > 100000) {
        throw new Error("File is too large");
      }

      const response = await fetch(`${AI_API}/documentation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ code })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      setDocumentation(data.result);
      setExplanation("");

    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }
  async function deleteFile(fileId) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this file?"
    );
    if (!confirmDelete) return;
    try {
      const response = await fetch(`${API}/${fileId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      alert("File deleted successfully!");
      const updatedFiles = files.filter(
        (item) => item._id !== fileId
      );

      setFiles(updatedFiles);
    } catch (error) {
      alert(error.message);
    }
  }
  useEffect(() => {
    getFiles();
  }, [id]);

  return (
    <div>
      <h1>Project Files</h1>
      <form onSubmit={uploadFile}>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button type="submit">Upload File</button>
      </form>

      <h2>Uploaded Files</h2>
      {files.length === 0 ? (
        <p>No files uploaded yet</p>
      ) : (
        files.map((item) => {
          const extension = item.originalName
            .split(".")
            .pop()
            .toLowerCase();

          const isCodeFile = [
            "js", "jsx", "ts", "tsx", "py",
            "java", "c", "cpp", "html", "css",
            "json", "txt"
          ].includes(extension);

          return (
            <div className="project-card" key={item._id}>
              <h3>{item.originalName}</h3>
              {item.mimeType?.startsWith("image/") && (
                <img
                  src={`http://localhost:5000${item.url}`}
                  alt={item.originalName}
                  width="200"
                />
              )}

              {item.mimeType === "application/pdf" && (
                <iframe
                  src={`http://localhost:5000${item.url}`}
                  title={item.originalName}
                  width="100%"
                  height="300"
                />
              )}

              <br />
              <a href={`http://localhost:5000${item.url}`} target="_blank" rel="noreferrer"> Open / Download </a>
              <br />

              {isCodeFile && item.size <= 100000 && (
                <>
                  <button type="button" onClick={() => explainCode(item._id)}>🤖 Explain Code</button>
                  <button type="button" onClick={() => generateDocumentation(item)}>📄 Generate Documentation</button>
                </>
              )}
              <button type="button" onClick={() => deleteFile(item._id)}> Delete File</button>
            </div>
          );
        })
      )}

      {loading && (
        <h3>Gemini is processing your code...</h3>
      )}

      {explanation && (
        <div className="project-card">
          <h2>🤖 Gemini Code Explanation</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {explanation}
          </pre>
        </div>
      )}
      {documentation && (
        <div className="project-card">
          <h2>📄 Generated Documentation</h2>

          <pre style={{ whiteSpace: "pre-wrap" }}>
            {documentation}
          </pre>
        </div>
      )}

    </div>
  );
}
export default Files;
