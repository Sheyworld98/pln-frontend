import React, { useEffect, useState } from "react";

const API_BASE = "https://pln-backend1-1.onrender.com"; // Update to your deployed backend URL

function App() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [newUser, setNewUser] = useState("");
  const [profile, setProfile] = useState(null);
  const [score, setScore] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [history, setHistory] = useState([]);

  const fetchAll = async (userId) => {
    if (!userId) return;
    try {
      const profileRes = await fetch(`${API_BASE}/profile/${userId}`);
      const profileData = await profileRes.json();
      setProfile(profileData);

      const scoreRes = await fetch(`${API_BASE}/score/${userId}`);
      const scoreData = await scoreRes.json();
      setScore(scoreData);

      const leaderboardRes = await fetch(`${API_BASE}/leaderboard`);
      const leaderboardData = await leaderboardRes.json();
      setLeaderboard(leaderboardData);

      const historyRes = await fetch(`${API_BASE}/history/${userId}`);
      const historyData = await historyRes.json();
      setHistory(historyData);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetch(`${API_BASE}/users`)
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  const handleUserSelect = (e) => {
    const userId = e.target.value;
    setSelectedUser(userId);
    setNewUser("");
    fetchAll(userId);
  };

  const handleNewUserSubmit = () => {
    if (newUser.trim()) {
      setSelectedUser(newUser.trim());
      fetchAll(newUser.trim());
    }
  };

  const getBadge = (points) => {
    if (points >= 100) return "🥇 Gold";
    if (points >= 60) return "🥈 Silver";
    if (points >= 30) return "🥉 Bronze";
    return "🔰 Newbie";
  };

  return (
    <div style={{ fontFamily: "Arial", padding: "20px" }}>
      <h1>🔠 PLN Contributor Dashboard</h1>

      <div>
        <label>👥 Select User: </label>
        <select value={selectedUser} onChange={handleUserSelect}>
          <option value="">-- Select --</option>
          {users.map((u, idx) => (
            <option key={idx} value={u}>{u}</option>
          ))}
        </select>
        <br /><br />
        <input
          type="text"
          placeholder="or enter new user..."
          value={newUser}
          onChange={(e) => setNewUser(e.target.value)}
        />
        <button onClick={handleNewUserSubmit}>🔄 Refresh</button>
      </div>

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
            <p><strong>{score[selectedUser] || 0}</strong> points</p>
            <p><strong>Badge:</strong> {getBadge(score[selectedUser] || 0)}</p>
          </div>
        ) : <p>Loading score...</p>}
      </section>

      <section>
        <h2>🏆 Leaderboard</h2>
        {leaderboard.length > 0 ? (
          <ul>
            {leaderboard.map((entry, index) => (
              <li key={index}>{entry.user_id} — {entry.score} pts</li>
            ))}
          </ul>
        ) : <p>Loading leaderboard...</p>}
      </section>

      <section>
        <h2>📅 Labeling History</h2>
        {history.length > 0 ? (
          <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Time</th>
                <th>Question</th>
                <th>Label</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, index) => (
                <tr key={index}>
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
