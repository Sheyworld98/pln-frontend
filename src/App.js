import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_BASE = "https://pln-backend1-1.onrender.com";

function App() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [newUser, setNewUser] = useState("");
  const [profile, setProfile] = useState(null);
  const [score, setScore] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [history, setHistory] = useState([]);
  const [task, setTask] = useState(null);
  const [answer, setAnswer] = useState("");
  const [showDarkMode, setShowDarkMode] = useState(false);
  const [lang, setLang] = useState("en");
  const [expertise, setExpertise] = useState("");
  const [complexity, setComplexity] = useState("");
  const [feedbackConsent, setFeedbackConsent] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/users`)
      .then(res => res.json())
      .then(setUsers);
  }, []);

  const fetchAll = async (user) => {
    const profileRes = await axios.get(`${API_BASE}/profile/${user}`);
    const scoreRes = await axios.get(`${API_BASE}/score/${user}`);
    const lbRes = await axios.get(`${API_BASE}/leaderboard`);
    const histRes = await axios.get(`${API_BASE}/history/${user}`);
    setProfile(profileRes.data);
    setScore(scoreRes.data[user] || 0);
    setLeaderboard(lbRes.data);
    setHistory(histRes.data);
  };

  const setUser = () => {
    const user = newUser || selectedUser;
    if (!user) return;
    setSelectedUser(user);
    fetchAll(user);
  };

  const fetchTask = async () => {
    if (!selectedUser) return;
    try {
      await axios.post(`${API_BASE}/profile/update/${selectedUser}`, {
        lang, expertise, complexity
      });

      const res = await axios.get(`${API_BASE}/task/fetch/${selectedUser}`, {
        params: { lang, topic: expertise, complexity }
      });

      if (res.data && res.data.task) {
        setTask(res.data);
        setAnswer("");
      } else {
        setTask(null);
      }
    } catch (err) {
      setTask(null);
    }
  };

  const submitAnswer = async () => {
    if (!task || !answer) return;
    try {
      await axios.post(`${API_BASE}/task/submit/${task.id}`, {
        user_id: selectedUser,
        solution: answer,
        question: task.task.text,
        track_id: task.track_id
      });
      setTask(null);
      fetchAll(selectedUser);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={showDarkMode ? "App dark" : "App"}>
      <h1>Peripheral 🎉</h1>
      <h2>🔠 PLN Contributor Dashboard</h2>
      <button onClick={() => setShowDarkMode(!showDarkMode)}>🌓 Toggle {showDarkMode ? "Light" : "Dark"} Mode</button>

      <section>
        <h2>👥 Set User</h2>
        <select onChange={(e) => setSelectedUser(e.target.value)} value={selectedUser}>
          <option>-- Select User ID --</option>
          {users.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
        <input placeholder="Or enter new user..." value={newUser} onChange={(e) => setNewUser(e.target.value)} />
        <button onClick={setUser}>Set User</button>
        <button onClick={() => fetchAll(selectedUser)}>🔄 Refresh</button>
      </section>

      <section>
        <h2>👤 Profile</h2>
        {profile ? (
          <div>
            <p><strong>Languages:</strong> {profile.languages?.join(", ") || "N/A"}</p>
            <p><strong>Expertise:</strong> {profile.expertise_domains?.join(", ") || "N/A"}</p>
            <p><strong>Preferred Complexity:</strong> {profile.complexity_level ?? "N/A"}</p>
          </div>
        ) : <p>No profile data available.</p>}
      </section>

      <section>
        <h2>📊 Score</h2>
        <p>{score} points</p>
        <p>Badge: {score >= 100 ? "🥇 Gold" : score >= 50 ? "🥈 Silver" : "🔰 Newbie"}</p>
      </section>

      <section>
        <h2>🏆 Leaderboard</h2>
        {leaderboard.map(entry => (
          <div key={entry.user_id}>{entry.user_id} — {entry.score} pts</div>
        ))}
      </section>

      <section>
        <h2>📅 Labeling History</h2>
        {history.map((h, i) => (
          <div key={i}>
            {h.timestamp || "N/A"} — {h.question} — {h.label} — {h.confidence.toFixed(2)}
          </div>
        ))}
      </section>

      <section>
        <h2>🧩 New Task</h2>
        <label>🌐 Language: <input value={lang} onChange={(e) => setLang(e.target.value)} /></label><br />
        <label>📚 Expertise: <input value={expertise} onChange={(e) => setExpertise(e.target.value)} /></label><br />
        <label>📈 Complexity: <input value={complexity} onChange={(e) => setComplexity(e.target.value)} /></label><br />
        <button onClick={fetchTask}>📥 Fetch Task</button>
        {task && (
          <div>
            <p>{task.task.text}</p>
            {task.content?.image?.url && <img src={task.content.image.url} alt="task visual" width="200" />}
            <div>
              {task.task.choices.map(choice => (
                <label key={choice.key}>
                  <input type="radio" name="answer" value={choice.key} onChange={(e) => setAnswer(e.target.value)} /> {choice.value}
                </label>
              ))}
            </div>
            <button onClick={submitAnswer}>✅ Submit Answer</button>
          </div>
        )}
      </section>

      <section>
        <h4>🔒 Will you take a minute to help us improve our services to you?</h4>
        <label>
          <input type="checkbox" checked={feedbackConsent} onChange={() => setFeedbackConsent(!feedbackConsent)} />
          I agree to help improve the service anonymously.
        </label>
        <p>🛡️ Your participation is anonymous, as well as any data you provide.</p>
      </section>
    </div>
  );
}

export default App;
