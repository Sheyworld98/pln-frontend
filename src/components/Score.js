import React, { useEffect, useState } from "react";
import { fetchScore } from "../api";

function Score({ userId }) {
  const [points, setPoints] = useState(null);

  useEffect(() => {
    fetchScore(userId).then(data => setPoints(data.points));
  }, [userId]);

  return (
    <div>
      <h2>🎯 Your Score</h2>
      <p>{points !== null ? `${points} points` : "Loading..."}</p>
    </div>
  );
}

export default Score;
