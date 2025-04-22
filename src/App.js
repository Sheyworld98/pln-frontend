import React, { useState, useEffect } from "react";

const BACKEND_URL = "https://pln-backend1-1.onrender.com"; // Your deployed backend

function App() {
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState("");
  const [newUser, setNewUser] = useState("");
  const [profile, setProfile] = useState(null);
  const [score, setScore] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [history, setHistory] = useState([]);
  const [task, setTask] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");

  const fetchAll = async (uid = userId) => {
    if (!uid) return;

    try {
      const [profileRes, scoreRes, leaderboardRes, historyRes] = await Promise.all([
        fetch(`${BACKEND_URL}/profile/${uid}`),
        fetch(`${BACKEND_URL}/score/${uid}`),
        fetch(`${BACKEND_URL}/leaderboard`),
        fetch(`${BACKEND_URL}/history/${uid}`)
      ]);
      setProfile(await profileRes.json());
      setScore(await scoreRes.json());
      setLeaderboard(await leaderboardRes.json());
      setHistory(await historyRes.json());
    } catch (err) {
      console.error("Data fetch failed", err);
    }
  };

  const fetchUsers = async () => {
    const res = await fetch(`${BACKEND_URL}/users`);
    setUsers(await res.json());
  };

  const fetchTask = async () => {
    if (!userId) return;
    const res = await fetch(`${BACKEND_URL}/task/fetch/${userId}`);
    const taskData = await res.json();
    setTask(taskData);
    setSelectedOption("");
  };

  const submitTask = async () => {
    if (!task || !selectedOption) return;
    const res = await fetch(`${BACKEND_URL}/task/submit/${task.id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Timestamp": new Date().toISOString()
      },
      body: JSON.stringify({ user_id: userId, solution: selectedOption })
    });
    const result = await res.json();
    alert(`✅ Submitted with confidence: ${result.confidence}`);
    fetchAll();
    setTask(null);
  };

  useEffect(() => {
    fetchUsers();
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

  return (
    <div style={{ fontFamily: "Arial", padding: 20 }}>
      <h1>🔠 PLN Contributor Dashboard</h1>

      <label>👥 Select User: </label>
      <select value={userId} onChange={(e) => setUserId(e.target.value)}>
        <option value="">-- Select --</option>
        {users.map((id) => (
          <option key={id} value={id}>{id}</option>
        ))}
      </select>

      <div>
        <input
          type="text"
          placeholder="or enter new user..."
          value={newUser}
          onChange={(e) => setNewUser(e.target.value)}
        />
        <button onClick={() => { setUserId(newUser); setNewUser(""); }}>Set User</button>
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
        {leaderboard.length ? (
          <ul>{leaderboard.map((u, i) => <li key={i}>{u.user_id} — {u.score} pts</li>)}</ul>
        ) : <p>Loading leaderboard...</p>}
      </section>

      <section>
        <h2>📅 Labeling History</h2>
        {history.length ? (
          <table border="1" cellPadding="8">
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

      <section>
        <h2>🧩 New Task</h2>
        {task ? (
          <div>
            <p><strong>Q:</strong> {task.task?.text}</p>
            {task.task?.choices?.map((c) => (
              <label key={c.key} style={{ marginRight: 10 }}>
                <input
                  type="radio"
                  name="choice"
                  value={c.key}
                  checked={selectedOption === c.key}
                  onChange={(e) => setSelectedOption(e.target.value)}
                />
                {c.value}
              </label>
            ))}
            <br />
            <button onClick={submitTask}>✅ Submit</button>
          </div>
        ) : (
          <button onClick={fetchTask}>📥 Fetch Task</button>
        )}
      </section>
    </div>
  );
}

export default App;
