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
  const [lang, setLang] = useState("en");
  const [expertise, setExpertise] = useState("");
  const [complexity, setComplexity] = useState("1");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminSelectedUser, setAdminSelectedUser] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/users`).then(res => res.json()).then(setUsers);
  }, []);

  const fetchAll = async (user) => {
    try {
      const profileRes = await axios.get(`${API_BASE}/profile/${user}`);
      const scoreRes = await axios.get(`${API_BASE}/score/${user}`);
      const lbRes = await axios.get(`${API_BASE}/leaderboard`);
      const histRes = await axios.get(`${API_BASE}/history/${user}`);
      setProfile(profileRes.data);
      setScore(scoreRes.data[user] || 0);
      setLeaderboard(lbRes.data);
      setHistory(histRes.data);
    } catch (err) {
      console.error("Fetch failed", err);
    }
  };

  const activeUser = isAdmin ? adminSelectedUser : selectedUser;

  const setUser = async () => {
    const user = newUser || selectedUser;
    if (!user) return;
    setSelectedUser(user);
    await fetchAll(user);
  };

  const fetchTask = async () => {
    try {
      const user = activeUser;
      if (!user) return;
      await axios.post(`${API_BASE}/profile/update/${user}`, {
        lang, expertise, complexity
      });

      const res = await axios.get(`${API_BASE}/task/fetch/${user}`, {
        params: { lang, topic: expertise, complexity }
      });

      if (res.data?.task) {
        setTask(res.data);
        setAnswer("");
      } else {
        setTask(null);
        alert("No task available");
      }
    } catch (err) {
      console.error("Task fetch failed", err);
    }
  };

  const submitAnswer = async () => {
    try {
      if (!task || !answer) return;
      await axios.post(`${API_BASE}/task/submit/${task.id}`, {
        user_id: activeUser,
        solution: answer,
        question: task.task.text,
        track_id: task.track_id
      });
      alert("✅ Submitted!");
      setTask(null);
      fetchAll(activeUser);
    } catch (err) {
      console.error("Submit failed", err);
    }
  };

  return (
    <div className="App">
      <h1>Peripheral 🎉</h1>
      <h2>🔠 PLN Contributor Dashboard</h2>
      <label>
        <input type="checkbox" checked={isAdmin} onChange={() => setIsAdmin(!isAdmin)} />
        Admin Mode
      </label>

      {isAdmin ? (
        <div>
          <h3>Select user to moderate:</h3>
          <select onChange={(e) => setAdminSelectedUser(e.target.value)} value={adminSelectedUser}>
            <option value="">--Select User--</option>
            {users.map(u => <option key={u}>{u}</option>)}
          </select>
        </div>
      ) : (
        <section>
          <h2>👥 Select User:</h2>
          <select onChange={(e) => setSelectedUser(e.target.value)} value={selectedUser}>
            <option>-- Select --</option>
            {users.map(u => <option key={u}>{u}</option>)}
          </select>
          <input placeholder="or enter new user..." value={newUser} onChange={(e) => setNewUser(e.target.value)} />
          <button onClick={setUser}>Set User</button>
        </section>
      )}

      {activeUser && (
        <>
          <section>
            <h2>🧩 New Task</h2>
            <label>🌐 Language: <input value={lang} onChange={(e) => setLang(e.target.value)} /></label><br />
            <label>📚 Expertise: <input value={expertise} onChange={(e) => setExpertise(e.target.value)} /></label><br />
            <label>📈 Complexity: <input type="number" min="1" max="3" value={complexity} onChange={(e) => setComplexity(e.target.value)} /></label><br />
            <button onClick={fetchTask}>Fetch Task</button>
            {task && (
              <div>
                <p>{task.task.text}</p>
                {task.content?.image?.url && <img src={task.content.image.url} alt="task" width="200" />}
                {task.task.choices.map(choice => (
                  <label key={choice.key}>
                    <input type="radio" name="answer" value={choice.key} onChange={(e) => setAnswer(e.target.value)} />
                    {choice.value}
                  </label>
                ))}
                <br />
                <button onClick={submitAnswer}>✅ Submit</button>
              </div>
            )}
          </section>

          <section>
            <h2>📅 Labeling History</h2>
            {history.map((h, i) => (
              <div key={i}>
                {h.timestamp ? new Date(h.timestamp).toLocaleString() : "N/A"} — {h.question} — {h.label} — {h.confidence?.toFixed(2)}
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
}

export default App;
