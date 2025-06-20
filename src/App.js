import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
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
  const [feedbackConsent, setFeedbackConsent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/users`).then(res => res.json()).then(setUsers);
  }, []);

  const fetchAll = async (userRaw) => {
    const user = userRaw.trim();
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
    const user = (newUser || selectedUser).trim();
    if (!user) return;
    setSelectedUser(user);
    await fetchAll(user);
  };

  const fetchTask = async () => {
    if (!selectedUser.trim()) return;
    setLoading(true);
    const trimmedUser = selectedUser.trim();
    try {
      const res = await axios.get(`${API_BASE}/task/fetch/${trimmedUser}`);
      if (res.data && res.data.task) {
        setTask(res.data);
        setAnswer("");
        toast.success("Task fetched successfully!");
      } else {
        toast.error(res.data.error || "No new task available.");
        setTask(null);
      }
      await fetchAll(trimmedUser);
    } catch (err) {
      console.error("Fetch task error:", err);
      toast.error("Failed to fetch task.");
      setTask(null);
    }
    setLoading(false);
  };

  const submitAnswer = async () => {
    if (!task || !answer) return;
    const trimmedUser = selectedUser.trim();
    const payload = {
      user_id: trimmedUser,
      solution: answer,
      question: task.task?.text || "",
      track_id: task.track_id,
    };
    console.log("Submitting payload:", payload);
    try {
      await axios.post(`${API_BASE}/task/${task.id}/submit`, payload);
      toast.success("Answer submitted successfully!");
      setTask(null);
      await fetchAll(trimmedUser);
      if (score + 20 >= 50 && score < 50) {
        toast("🎉 Good job reaching 50 points! 🎉");
      }
    } catch (err) {
      console.error("Submit error:", err.response?.data || err.message);
      alert(JSON.stringify(err.response?.data || err.message));
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

      {!feedbackConsent ? (
        <section>
          <h2>🎉 Peripheral is here, welcome aboard!</h2>
          <p>🔒 Will you help us improve our service?</p>
          <label><input type="radio" name="consent" onChange={() => setFeedbackConsent(true)} /> Yes</label>
          <label><input type="radio" name="consent" onChange={() => { toast("Thank you!"); setTimeout(() => window.location.reload(), 1500); }} /> No</label>
        </section>
      ) : (
        <>
          <h1 className="logo">Peripheral 🎉</h1>
          <button onClick={() => setShowDarkMode(!showDarkMode)}>🌓 Toggle {showDarkMode ? "Light" : "Dark"} Mode</button>

          <section>
            <h3>👥 Select User</h3>
            <select onChange={(e) => setSelectedUser(e.target.value)} value={selectedUser}>
              <option>-- Select --</option>
              {users.map(u => <option key={u}>{u}</option>)}
            </select>
            <input placeholder="or enter new user" value={newUser} onChange={(e) => setNewUser(e.target.value)} />
            <button onClick={setUser}>Set User</button>
            <button onClick={() => fetchAll(selectedUser.trim())}>🔄 Refresh</button>
          </section>

          <section>
            <h3>🧩 New Task</h3>
            <button onClick={fetchTask}>📥 Fetch Task</button>
            {loading && <p>Loading...</p>}
            {task && (
              <div>
                <p>{task.task?.text || "📝 No question text provided for this task."}</p>
                {task.content?.image?.url && <img src={task.content.image.url} alt="task" style={{ maxWidth: "100%" }} />}
                {Array.isArray(task.task?.choices) && task.task.choices.length > 0 ? (
                  <div>
                    {task.task.choices.map(choice => (
                      <label key={choice.key}>
                        <input type="radio" name="answer" value={choice.key} onChange={(e) => setAnswer(e.target.value)} /> {choice.value}
                      </label>
                    ))}
                  </div>
                ) : (
                  <input type="text" placeholder="Enter answer" value={answer} onChange={(e) => setAnswer(e.target.value)} />
                )}
                <button onClick={submitAnswer}>✅ Submit</button>
              </div>
            )}
          </section>

          <section>
            <h3>📅 History</h3>
            <button onClick={() => {
              const csv = ["Time,Question,Label,Confidence"];
              history.forEach(h => csv.push(`${h.timestamp},${h.question},${h.label},${h.confidence}`));
              const blob = new Blob([csv.join("\n")], { type: "text/csv" });
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = `${selectedUser.trim()}_history.csv`;
              a.click();
            }}>📥 Download CSV</button>
            {history.map((h, i) => (
              <div key={i}>{formatTimestamp(h.timestamp)} — {h.question} — {h.label} — {h.confidence.toFixed(2)}</div>
            ))}
          </section>
        </>
      )}
    </div>
  );
}

export default App;
