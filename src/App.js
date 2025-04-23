// ==== Frontend: App.js ====

import React, { useEffect, useState } from "react";

function App() {
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState("");
  const [newUserId, setNewUserId] = useState("");
  const [profile, setProfile] = useState(null);
  const [score, setScore] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [history, setHistory] = useState([]);
  const [task, setTask] = useState(null);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(null);
  const [lang, setLang] = useState("en");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [consent, setConsent] = useState(false);

  const BACKEND = "https://pln-backend1-1.onrender.com";

  const fetchAll = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [profileRes, scoreRes, leaderboardRes, historyRes] = await Promise.all([
        fetch(`${BACKEND}/profile/${userId}`),
        fetch(`${BACKEND}/score/${userId}`),
        fetch(`${BACKEND}/leaderboard`),
        fetch(`${BACKEND}/history/${userId}`),
      ]);
      const profileData = await profileRes.json();
      const scoreData = await scoreRes.json();
      const leaderboardData = await leaderboardRes.json();
      const historyData = await historyRes.json();
      setProfile(profileData);
      setScore(scoreData);
      setLeaderboard(leaderboardData);
      setHistory(historyData);
    } catch (err) {
      console.error("Fetch error:", err);
    }
    setLoading(false);
  };

  const fetchTask = async () => {
    if (!userId) return;
    const query = new URLSearchParams({ lang, topic }).toString();
    const res = await fetch(`${BACKEND}/task/fetch/${userId}?${query}`);
    const data = await res.json();
    setTask(data);
    setAnswer("");
    setSubmitted(null);
  };

  const submitAnswer = async () => {
    const payload = {
      user_id: userId,
      track_id: task.track_id,
      solution: answer,
      question: task.task?.text || ""
    };
    const timestamp = new Date().toISOString();
    const res = await fetch(`${BACKEND}/task/submit/${task.id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Timestamp": timestamp,
      },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    setSubmitted(result);
    fetchAll();
  };

  useEffect(() => {
    fetch(`${BACKEND}/users`).then(res => res.json()).then(setUsers);
  }, []);

  useEffect(() => {
    if (userId) fetchAll();
  }, [userId]);

  const getBadge = (points) => {
    if (points >= 100) return "🥇 Gold";
    if (points >= 60) return "🥈 Silver";
    if (points >= 30) return "🥉 Bronze";
    return "🔰 Newbie";
  };

  const themeStyles = darkMode ? { backgroundColor: "#121212", color: "#f0f0f0" } : { backgroundColor: "#fff", color: "#000" };

  return (
    <div style={{ fontFamily: "Arial", padding: 20, minHeight: "100vh", ...themeStyles }}>
      <h1>🔠 PLN Contributor Dashboard</h1>
      <button onClick={() => setDarkMode(!darkMode)}>🌓 Toggle {darkMode ? "Light" : "Dark"} Mode</button>

      <section>
        <h2>👥 Select User: </h2>
        <select value={userId} onChange={e => setUserId(e.target.value)}>
          <option>-- Select --</option>
          {users.map(u => <option key={u}>{u}</option>)}
        </select>
        <input placeholder="or enter new user..." value={newUserId} onChange={e => setNewUserId(e.target.value)} />
        <button onClick={() => setUserId(newUserId)}>Set User</button>
      </section>

      <button onClick={fetchAll} disabled={loading}>🔄 Refresh</button>

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
        <ul>
          {leaderboard.map((entry, index) => (
            <li key={index}>{entry.user_id} — {entry.score} pts</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>📅 Labeling History</h2>
        <button onClick={() => {
          const csv = ["Time,Question,Label,Confidence"].concat(history.map(h =>
            `${h.timestamp},"${h.question}",${h.label},${h.confidence.toFixed(2)}`
          ));
          const blob = new Blob([csv.join("\n")], { type: "text/csv" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `history_${userId}.csv`;
          a.click();
        }}>📥 Download CSV</button>

        <table border="1" cellPadding="6" style={{ marginTop: 10 }}>
          <thead>
            <tr><th>Time</th><th>Question</th><th>Label</th><th>Confidence</th></tr>
          </thead>
          <tbody>
            {history.map((h, i) => (
              <tr key={i}>
                <td>{h.timestamp?.slice(0, 19) || "N/A"}</td>
                <td>{h.question || "N/A"}</td>
                <td>{h.label}</td>
                <td>{h.confidence?.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>🧩 New Task</h2>
        <label>🌐 Language: <input value={lang} onChange={e => setLang(e.target.value)} /></label>
        <label>📚 Topic: <input value={topic} onChange={e => setTopic(e.target.value)} /></label>
        <button onClick={fetchTask}>📥 Fetch Task</button>

        {task?.task && (
          <div>
            <p><strong>{task.task.text}</strong></p>
            {task.task.choices?.map(c => (
              <label key={c.key}><input type="radio" name="ans" value={c.key} onChange={e => setAnswer(e.target.value)} /> {c.value}</label>
            ))}
            <button disabled={!answer} onClick={submitAnswer}>✅ Submit Answer</button>
            {submitted && <p>✅ Submitted with confidence: {submitted.confidence?.toFixed(2)}</p>}
          </div>
        )}
      </section>

      <section>
        <h4>🔒 Would you like to help us improve this app for better service? Your participation is anonymous and your data is protected.</h4>
        <label><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} /> I agree to help improve the service anonymously</label>
      </section>
    </div>
  );
}

export default App;
