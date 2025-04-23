import React, { useEffect, useState } from "react";
const API_BASE = "https://pln-backend1-1.onrender.com";

function App() {
  const [userId, setUserId] = useState("");
  const [users, setUsers] = useState([]);
  const [profile, setProfile] = useState(null);
  const [score, setScore] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [history, setHistory] = useState([]);
  const [task, setTask] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/users`).then(res => res.json()).then(setUsers);
  }, []);

  const fetchAll = () => {
    if (!userId) return;
    fetch(`${API_BASE}/profile/${userId}`).then(res => res.json()).then(setProfile);
    fetch(`${API_BASE}/score/${userId}`).then(res => res.json()).then(setScore);
    fetch(`${API_BASE}/leaderboard`).then(res => res.json()).then(setLeaderboard);
    fetch(`${API_BASE}/history/${userId}`).then(res => res.json()).then(setHistory);
  };

  const fetchTask = () => {
    setTask(null);
    setSelectedAnswer("");
    setFeedback("");
    fetch(`${API_BASE}/task/fetch/${userId}`)
      .then(res => res.json())
      .then(setTask)
      .catch(() => setFeedback("❌ Failed to fetch task"));
  };

  const submitTask = () => {
    if (!selectedAnswer || !task) return;
    fetch(`${API_BASE}/task/submit/${task.id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Timestamp": new Date().toISOString()
      },
      body: JSON.stringify({
        user_id: userId,
        solution: selectedAnswer,
        track_id: task.track_id,
        question: task.task?.text || ""
      })
    })
      .then(res => res.json())
      .then(data => {
        setFeedback(`✅ Submitted with confidence: ${data.confidence}`);
        fetchAll();
      })
      .catch(() => setFeedback("❌ Submission failed"));
  };

  const downloadCSV = () => {
    const csvContent = [
      ["Time", "Question", "Label", "Confidence"],
      ...history.map(h => [h.timestamp, h.question, h.label, h.confidence])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `${userId}_labeling_history.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getBadge = (points) => {
    if (points >= 100) return "🥇 Gold";
    if (points >= 60) return "🥈 Silver";
    if (points >= 30) return "🥉 Bronze";
    return "🔰 Newbie";
  };

  return (
    <div style={{ fontFamily: "Arial", padding: "20px", background: darkMode ? "#121212" : "#fff", color: darkMode ? "#eee" : "#000" }}>
      <h1>🔠 PLN Contributor Dashboard</h1>

      <button onClick={() => setDarkMode(!darkMode)}>🌓 Toggle {darkMode ? "Light" : "Dark"} Mode</button>

      <div>
        <label>👥 Select User: </label>
        <select value={userId} onChange={(e) => setUserId(e.target.value)}>
          <option value="">-- Select --</option>
          {users.map(id => <option key={id} value={id}>{id}</option>)}
        </select>
        <input type="text" placeholder="or enter new user..." value={userId} onChange={(e) => setUserId(e.target.value)} />
        <button onClick={fetchAll}>Set User</button>
      </div>

      <button onClick={fetchAll}>🔄 Refresh</button>

      <section>
        <h2>👤 Profile</h2>
        {profile ? (
          <div>
            <p><strong>Languages:</strong> {profile.languages?.join(", ") || "N/A"}</p>
            <p><strong>Expertise:</strong> {profile.expertise_domains?.join(", ") || "N/A"}</p>
            <p><strong>Preferred Complexity:</strong> {profile.complexity_level ?? "N/A"}</p>
          </div>
        ) : <p>Loading profile...</p>}
      </section>

      <section>
        <h2>📊 Score</h2>
        {score ? (
          <div>
            <p><strong>{score[userId] || 0}</strong> points</p>
            <p><strong>Badge:</strong> {getBadge(score[userId] || 0)}</p>
          </div>
        ) : <p>Loading score...</p>}
      </section>

      <section>
        <h2>🏆 Leaderboard</h2>
        {leaderboard.length > 0 ? (
          <ul>{leaderboard.map((entry, i) => <li key={i}>{entry.user_id} — {entry.score} pts</li>)}</ul>
        ) : <p>Loading leaderboard...</p>}
      </section>

      <section>
        <h2>📅 Labeling History</h2>
        <button onClick={downloadCSV}>📥 Download CSV</button>
        {history.length > 0 ? (
          <table border="1" cellPadding="8">
            <thead><tr><th>Time</th><th>Question</th><th>Label</th><th>Confidence</th></tr></thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={i}>
                  <td>{h.timestamp?.slice(0, 19)}</td>
                  <td>{h.question || "N/A"}</td>
                  <td>{h.label}</td>
                  <td>{h.confidence?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p>No labeling history yet.</p>}
      </section>

      <section>
        <h2>🧩 New Task</h2>
        <button onClick={fetchTask}>📥 Fetch Task</button>
        {task && (
          <div>
            <p><strong>{task.task?.text}</strong></p>
            {task.content?.image?.url && <img src={task.content.image.url} alt="task visual" style={{ maxWidth: "300px" }} />}
            <ul>
              {task.task?.choices.map((choice, i) => (
                <li key={i}>
                  <label>
                    <input type="radio" name="choice" value={choice.key} checked={selectedAnswer === choice.key} onChange={() => setSelectedAnswer(choice.key)} /> {choice.value}
                  </label>
                </li>
              ))}
            </ul>
            <button onClick={submitTask}>✅ Submit Answer</button>
            <p>{feedback}</p>
          </div>
        )}
      </section>

      <footer style={{ marginTop: 40, fontStyle: "italic" }}>
        <p>🔒 Would you like to help us improve this app for better service? Your participation is anonymous and your data is protected.</p>
        <label><input type="checkbox" checked={consent} onChange={() => setConsent(!consent)} /> I agree to help improve the service anonymously</label>
      </footer>
    </div>
  );
}

export default App;