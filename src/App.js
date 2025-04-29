import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import "./App.css";

const API_BASE = "https://pln-backend1-1.onrender.com";

const EXPERTISE_OPTIONS = [
  "animals",
  "construction-site",
  "fashion",
  "garage-workshop",
  "kitchen",
  "living-room",
  "medical-field",
  "music",
  "office",
  "school",
  "uae",
  "underwater"
];

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load user preferences from extension (if available)
    if (window.chrome?.storage) {
      chrome.storage.sync.get(["lang", "expertise", "complexity"], (prefs) => {
        if (prefs.lang) setLang(prefs.lang);
        if (prefs.expertise) setExpertise(prefs.expertise);
        if (prefs.complexity) setComplexity(prefs.complexity);
      });
    }
  
    fetch(`${API_BASE}/users`).then(res => res.json()).then(setUsers);
  }, []);  

  const fetchAll = async (user) => {
    try {
      const profileRes = await axios.get(`${API_BASE}/profile/${user}`);
      const lbRes = await axios.get(`${API_BASE}/leaderboard`);
      const histRes = await axios.get(`${API_BASE}/history/${user}`);
      const scoreRes = await axios.get(`${API_BASE}/score/${user}`);
      setProfile(profileRes.data);
      setLeaderboard(lbRes.data);
      setHistory(histRes.data);
      setScore(scoreRes.data[user] || 0);
    } catch (err) {
      console.error("Error fetching all data:", err);
    }
  };

  const setUser = async () => {
    const user = newUser || selectedUser;
    if (!user) return;
    setSelectedUser(user);
    await fetchAll(user);
  };

  const fetchTask = async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      const profileUpdateRes = await axios.post(`${API_BASE}/profile/update/${selectedUser}`, { lang, expertise, complexity });
      const res = await axios.get(`${API_BASE}/task/fetch/${selectedUser}`, {
        params: { lang, topic: expertise, complexity }
      });
      if (res.data && res.data.task) {
        setTask(res.data);
        setAnswer("");
        toast.success("Task fetched successfully!");
      } else {
        toast.error(res.data.error || "No new task available.");
        setTask(null);
      }
      await fetchAll(selectedUser);
    } catch (err) {
      console.error("Fetch task error:", err);
      toast.error("Failed to fetch task.");
      setTask(null);
    }
    setLoading(false);
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
      toast.success("Answer submitted successfully!");
      setTask(null);
      await fetchAll(selectedUser);

      if (score + 20 >= 50 && score < 50) {
        toast("🎉 Good job reaching 50 points! 🎉");
      }
    } catch (err) {
      console.error("Submit error:", err);
      toast.error("Failed to submit answer.");
    }
  };

  const getBadge = (score) => {
    if (score >= 100) return "🥇 Gold";
    if (score >= 50) return "🥈 Silver";
    return "🔰 Newbie";
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className={`App ${showDarkMode ? "dark fade-in" : "fade-in"}`}>
      <ToastContainer />
      <h1 className="logo" style={{ fontWeight: "bold", fontStyle: "italic", background: "linear-gradient(to right, yellow, purple, blue)", WebkitBackgroundClip: "text", color: "transparent" }}>
        Peripheral <span role="img" aria-label="party">🎉</span>
      </h1>
      <h2><span role="img" aria-label="dashboard">🔠</span> PLN Contributor Dashboard</h2>

      <button onClick={() => setShowDarkMode(!showDarkMode)}>
        <span role="img" aria-label="theme-toggle">🌓</span> Toggle {showDarkMode ? "Light" : "Dark"} Mode
      </button>

      <div style={{ marginTop: "20px" }}>
        <h4>🔧 Preferences</h4>
        <label>🌐 Language:
          <input value={lang} onChange={(e) => setLang(e.target.value)} placeholder="en or ar" />
        </label>
        <br />
        <label>🎓 Expertise:
          <select value={expertise} onChange={(e) => setExpertise(e.target.value)}>
            <option value="">-- Select Topic --</option>
            {EXPERTISE_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </label>
        <br />
        <label>📏 Complexity:
          <input value={complexity} onChange={(e) => setComplexity(e.target.value)} placeholder="1 to 4" />
        </label>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h4>🔒 Will you take a minute to help us improve our services to you?</h4>
        <label>
          <input type="checkbox" checked={feedbackConsent} onChange={() => setFeedbackConsent(!feedbackConsent)} />
          I agree to help improve the service anonymously.
        </label>
        <p>🛡️ Your participation is anonymous, as well as any data you provide.</p>
      </div>

      {/* rest of your UI here ... unchanged */}
    </div>
  );
}

export default App;
