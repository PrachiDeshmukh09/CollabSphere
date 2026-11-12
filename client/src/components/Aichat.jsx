import { useState } from "react";
function AIchat({ text }) {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  async function callAI(endpoint) {
    if (!text || !text.trim()) {
      alert("Please write some note content first");
      return;
    }
    try {
      setLoading(true);
      setResult("");
      const response = await fetch(
        `http://localhost:5000/api/ai/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({ text })
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "AI request failed");
      }
      setResult(data.result);
    } catch (error) {
      setResult(error.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="project-card">
      <h3>Gemini AI Assistant</h3>
      <button onClick={() => callAI("explain")} disabled={loading}> Explain Note </button>
      <button onClick={() => callAI("improve")} disabled={loading}> Suggest Improvements</button>
      {loading && <p>Gemini is thinking...</p>}
      {result && (
        <div>
          <h4>AI Result</h4>
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
}
export default AIchat;
