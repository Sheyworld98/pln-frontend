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
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingTask, setLoadingTask] = useState(false);
  const [feedbackConsent, setFeedbackConsent] = useState(false);
  const [submission, setSubmission] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/users`).then(res => res.json()).then(setUsers);
  }, []);

  const fetchAll = async (user) => {
    setLoadingProfile(true);
    try {
      const profileRes = await axios.get(`${API_BASE}/profile/${user}`);
      const scoreRes = await axios.get(`${API_BASE}/score/${user}`);
      const lbRes = await axios.get(`${API_BASE}/leaderboard`);
      const histRes = await axios.get(`${API_BASE}/history/${user}`);
      setProfile(profileRes.data);
      setScore(scoreRes.data[user] || 0);
      setLeaderboard(lbRes.data);
      setHistory(histRes.data);
      setSubmission(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  const setUser = () => {
    const user = newUser || selectedUser;
    if (!user) return;
    setSelectedUser(user);
    fetchAll(user);
  };

  const fetchTask = async () => {
    if (!selectedUser) return;
    setLoadingTask(true);
    try {
      const res = await axios.get(`${API_BASE}/task/fetch/${selectedUser}`, {
        params: { lang, topic: expertise, complexity }
      });
      setTask(res.data);
      setAnswer("");
    } catch (err) {
      setTask(null);
    } finally {
      setLoadingTask(false);
    }
  };

  const submitAnswer = async () => {
    if (!task || !answer) return;
    try {
      const res = await axios.post(`${API_BASE}/task/submit/${task.id}`, {
        user_id: selectedUser,
        solution: answer,
        question: task.task.text,
        track_id: task.track_id
      });
      setSubmission(res.data);
      fetchAll(selectedUser);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={showDarkMode ? "App dark" : "App"}>
      <h1>🔠 PLN Contributor Dashboard</h1>
      <button onClick={() => setShowDarkMode(!showDarkMode)} className="animated-button">
        🌓 Toggle {showDarkMode ? "Light" : "Dark"} Mode
      </button>

      <section>
        <h2>👥 Select User:</h2>
        <select onChange={(e) => setSelectedUser(e.target.value)} value={selectedUser}>
          <option>-- Select --</option>
          {users.map(u => <option key={u}>{u}</option>)}
        </select>
        <input placeholder="or enter new user..." value={newUser} onChange={(e) => setNewUser(e.target.value)} />
        <button onClick={setUser} className="animated-button">Set User</button>
        <button onClick={() => fetchAll(selectedUser)} className="animated-button">🔄 Refresh</button>
      </section>

      <section>
        <h2>👤 Profile</h2>
        {loadingProfile ? (
          <p>Loading profile...</p>
        ) : profile ? (
          <div>
            <p><strong>Languages:</strong> {profile.languages?.join(", ") || "N/A"}</p>
            <p><strong>Expertise:</strong> {profile.expertise_domains?.join(", ") || "N/A"}</p>
            <p><strong>Preferred Complexity:</strong> {profile.complexity_level ?? "N/A"}</p>
          </div>
        ) : <p>Select a user to see profile</p>}
      </section>

      <section>
        <h2>📊 Score</h2>
        <p>{score} points</p>
        <p>Badge: {score >= 60 ? "🥈 Silver" : "🔰 Newbie"}</p>
      </section>

      <section>
        <h2>🏆 Leaderboard</h2>
        {leaderboard.map(entry => (
          <div key={entry.user_id}>{entry.user_id} — {entry.score} pts</div>
        ))}
      </section>

      <section>
        <h2>📅 Labeling History</h2>
        <button className="animated-button" onClick={() => {
          const csv = ["Time,Question,Label,Confidence"];
          history.forEach(h => {
            csv.push(`${h.timestamp},${h.question},${h.label},${h.confidence}`);
          });
          const blob = new Blob([csv.join("\n")], { type: "text/csv" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${selectedUser}_history.csv`;
          a.click();
        }}>📥 Download CSV</button>
        {history.map((h, i) => (
          <div key={i}>{h.timestamp} — {h.question} — {h.label} — {h.confidence.toFixed(2)}</div>
        ))}
      </section>

      <section>
        <h2>🧩 New Task</h2>
        <label>🌐 Language:
          <select value={lang} onChange={(e) => setLang(e.target.value)}>
            <option value="en">English</option>
            <option value="ar">Arabic</option>
          </select>
        </label>
        <label>🎓 Expertise:
          <select value={expertise} onChange={(e) => setExpertise(e.target.value)}>
            <option value="">-- Select --</option>
            <option value="animals">Animals</option>
            <option value="construction-site">Construction Site</option>
            <option value="fashion">Fashion</option>
            <option value="garage-workshop">Garage Workshop</option>
            <option value="kitchen">Kitchen</option>
            <option value="living-room">Living Room</option>
            <option value="medical-field">Medical Field</option>
            <option value="music">Music</option>
            <option value="office">Office</option>
            <option value="school">School</option>
            <option value="uae">UAE</option>
            <option value="underwater">Underwater</option>
          </select>
        </label>
        <label>📈 Complexity:
          <select value={complexity} onChange={(e) => setComplexity(e.target.value)}>
            <option value="">-- Any --</option>
            <option value="1">1 (Easy)</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4 (Hard)</option>
          </select>
        </label>
        <button onClick={fetchTask} className="animated-button">📥 Fetch Task</button>

        {loadingTask ? (
          <p>Loading task...</p>
        ) : task && (
          <div>
            <p>{task.task.text}</p>
            {task.content?.image?.url && <img src={task.content.image.url} alt="task visual" />}
            <div>
              {task.task.choices.map(choice => (
                <label key={choice.key}>
                  <input type="radio" name="answer" value={choice.key} onChange={(e) => setAnswer(e.target.value)} /> {choice.value}
                </label>
              ))}
            </div>
            <button onClick={submitAnswer} className="animated-button">✅ Submit Answer</button>
            {submission && <p>✅ Submitted with confidence: {submission.confidence}</p>}
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
