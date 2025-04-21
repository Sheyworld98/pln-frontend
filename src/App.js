import React, { useEffect, useState } from "react";

function App() {
  const [userId, setUserId] = useState("1df6fbc4");
  const [allUsers, setAllUsers] = useState([]);
  const [profile, setProfile] = useState(null);
  const [score, setScore] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE = "https://pln-blackend.onrender.com"; // replace with your backend

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [profileRes, scoreRes, leaderboardRes, historyRes] = await Promise.all([
        fetch(`${API_BASE}/profile/${userId}`),
        fetch(`${API_BASE}/score/${userId}`),
        fetch(`${API_BASE}/leaderboard`),
        fetch(`${API_BASE}/history/${userId}`),
      ]);

      setProfile(await profileRes.json());
      setScore(await scoreRes.json());
      setLeaderboard(await leaderboardRes.json());
      setHistory(await historyRes.json());
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getBadge = (points) => {
    if (points >= 100) return "🥇 Gold";
    if (points >= 60) return "🥈 Silver";
    if (points >= 30) return "🥉 Bronze";
    return "🔰 Newbie";
  };

  useEffect(() => {
    fetch(`${API_BASE}/users`)
      .then(res => res.json())
      .then(data => setAllUsers(data.users || []));
  }, []);

  useEffect(() => {
    fetchAll();
  }, [userId]);

  return (
    <div style={{ fontFamily: "Arial", padding: "20px" }}>
      <h1>🔠 PLN Contributor Dashboard</h1>

      <label><strong>👥 Select User:</strong> </label>
      <select value={userId} onChange={(e) => setUserId(e.target.value)}>
        {allUsers.map(uid => <option key={uid} value={uid}>{uid}</option>)}
      </select>

      <button onClick={fetchAll} disabled={loading} style={{ marginLeft: "10px" }}>
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
        {score ? (
          <>
            <p><strong>{score[userId] || 0}</strong> points</p>
            <p><strong>Badge:</strong> {getBadge(score[userId] || 0)}</p>
          </>
        ) : <p>Loading score...</p>}
      </section>

      <section>
        <h2>🏆 Leaderboard</h2>
        {leaderboard.length ? (
          <ul>{leaderboard.map((entry, i) => (
            <li key={i}>{entry.user_id} — {entry.score} pts</li>
          ))}</ul>
        ) : <p>Loading leaderboard...</p>}
      </section>

      <section>
        <h2>📅 Labeling History</h2>
        {history.length ? (
          <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Time</th><th>Question</th><th>Label</th><th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, i) => (
                <tr key={i}>
                  <td>{item.timestamp?.slice(0, 19) || "N/A"}</td>
                  <td>{item.question || "N/A"}</td>
                  <td>{item.label}</td>
                  <td>{item.confidence?.toFixed(2)}</td>
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
