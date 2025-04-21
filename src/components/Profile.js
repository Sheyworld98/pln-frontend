import React, { useEffect, useState } from "react";
import { fetchProfile } from "../api";

function Profile({ userId }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchProfile(userId).then(setProfile);
  }, [userId]);

  if (!profile) return <p>Loading profile...</p>;

  return (
    <div>
      <h2>👤 User Profile</h2>
      <p><strong>User ID:</strong> {profile.user_id}</p>
      <p><strong>Languages:</strong> {profile.languages.join(", ")}</p>
      <p><strong>Domains:</strong> {profile.expertise_domains.join(", ")}</p>
      <p><strong>Preferred Complexity:</strong> {profile.complexity_level}</p>
    </div>
  );
}

export default Profile;
