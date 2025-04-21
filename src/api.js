const BASE_URL = "http://127.0.0.1:5000";

export async function fetchProfile(userId) {
  const res = await fetch(`${BASE_URL}/profile/${userId}`);
  return res.json();
}

export async function fetchScore(userId) {
  const res = await fetch(`${BASE_URL}/score/${userId}`);
  return res.json();
}

export async function fetchLeaderboard() {
  const res = await fetch(`${BASE_URL}/leaderboard`);
  return res.json();
}
