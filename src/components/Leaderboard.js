import React, { useEffect, useState } from "react";
import { fetchLeaderboard } from "../api";

function Leaderboard() {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    fetchLeaderboard().then(setLeaders);
  }, []);

  return (
    <div>
      <h2>🏆 Leaderboard</h2>
      <ul>
        {leaders.map((user, idx) => (
          <li key={idx}>
            #{idx + 1} — {user.user_id} → {user.points} pts
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Leaderboard;
