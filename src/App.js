// App.js
import React, { useEffect, useState } from "react";

function App() {
  const userId = "1df6fbc4";
  const API_URL = "https://pln-backend1-1.onrender.com";

  const [profile, setProfile] = useState(null);
  const [score, setScore] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const profileRes = await fetch(`${API_URL}/profile/${userId}`);
      const profileData = await profileRes.json();
      setProfile(profileData);

      const scoreRes = await fetch(`${API_URL}/score/${userId}`);
      const scoreData = await scoreRes.json();
      setScore(scoreData);

      const leaderboardRes = await fetch(`${API_URL}/leaderboard`);
      const leaderboardData = await leaderboardRes.json();
      setLeaderboard(leaderboardData);

      const historyRes = await fetch(`${API_URL}/history/${userId}`);
      const historyData = await historyRes.json();
      setHistory(historyData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const getBadge = (points) => {
    if (points >= 100) return "🥇 Gold";
    if (points >= 60) return "🥈 Silver";
    if (points >= 30) return "🥉 Bronze";
    return "🔰 Newbie";
  };

  return (
    <div style={{ fontFamily: "Arial", padding: "20px" }}>
      <h1>🔠 PLN Contributor Dashboard</h1>
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
