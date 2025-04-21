// 📄 src/App.js
import React, { useEffect, useState } from "react";

const BACKEND_URL = "https://pln-backend1-1.onrender.com";

function App() {
  const [userId, setUserId] = useState("");
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState("");

  const [profile, setProfile] = useState(null);
  const [score, setScore] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAll = async (uid = userId) => {
    if (!uid) return;
    setLoading(true);
    try {
      const [p, s, l, h] = await Promise.all([
        fetch(`${BACKEND_URL}/profile/${uid}`).then(r => r.json()),
        fetch(`${BACKEND_URL}/score/${uid}`).then(r => r.json()),
        fetch(`${BACKEND_URL}/leaderboard`).then(r => r.json()),
        fetch(`${BACKEND_URL}/history/${uid}`).then(r => r.json())
      ]);
      setProfile(p);
      setScore(s.score);
      setLeaderboard(l);
      setHistory(h);
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch(`${BACKEND_URL}/users`)
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        if (data.length > 0) setUserId(data[0]);
      });
  }, []);

  useEffect(() => {
    if (userId) fetchAll(userId);
  }, [userId]);

  const getBadge = (points) => {
    if (points >= 100) return "🥇 Gold";
    if (points >= 60) return "🥈 Silver";
    if (points >= 30) return "🥉 Bronze";
    return "🔰 Newbie";
  };

  return (
    <div style={{ fontFamily: "Arial", padding: 20 }}>
      <h1>🔠 PLN Contributor Dashboard</h1>

      <div>
        <label>👥 Select User: </label>
        <select value={userId} onChange={e => setUserId(e.target.value)}>
          <option value="">-- Select --</option>
          {users.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
        <input
          placeholder="or enter new user..."
          value={newUser}
          onChange={e => setNewUser(e.target.value)}
          onBlur={() => {
            if (newUser.trim()) setUserId(newUser.trim());
            setNewUser("");
          }}
          style={{ marginLeft: 10 }}
        />
      </div>

      <button onClick={() => fetchAll()} disabled={loading} style={{ marginTop: 10 }}>
        🔄 Refresh
      </button>

      <section>
        <h2>👤 Profile</h2>
        {profile ? (
          <>
            <p><strong>Languages:</strong> {profile.languages?.join(", ") || "N/A"}</p>
            <p><strong>Expertise:</strong> {profile.expertise_domains?.join(", ") || "N/A"}</p>
            <p><strong>Preferred Complexity:</strong> {profile.complexity_level ?? "N/A"}</p>
          </>
        ) : <p>Loading profile...</p>}
      </section>

      <section>
        <h2>📊 Score</h2>
        {score !== null ? (
          <>
            <p><strong>{score}</strong> points</p>
            <p><strong>Badge:</strong> {getBadge(score)}</p>
          </>
        ) : <p>Loading score...</p>}
      </section>

      <section>
        <h2>🏆 Leaderboard</h2>
        {leaderboard.length > 0 ? (
          <ul>{leaderboard.map((e, i) => (
            <li key={i}>{e.user_id} — {e.score} pts</li>
          ))}</ul>
        ) : <p>Loading leaderboard...</p>}
      </section>

      <section>
        <h2>📅 Labeling History</h2>
        {history.length > 0 ? (
          <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
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
        ) : <p>No labeling history yet.</p>}
      </section>
    </div>
  );
}

export default App;
