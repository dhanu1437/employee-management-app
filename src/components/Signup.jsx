import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

 const handleSignup = async (e) => {
  e.preventDefault();

  console.log("EMAIL:", email);
  console.log("PASSWORD:", password);

  if (!email || !password) {
    return alert("Email and Password are required");
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) alert(error.message);
  else alert("Signup successful!");
};
  return (
    <form onSubmit={handleSignup}>
      <h2>Signup</h2>

      <input
  type="email"
  value={email}
  placeholder="Email"
  onChange={(e) => setEmail(e.target.value)}
/>

<input
  type="password"
  value={password}
  placeholder="Password"
  onChange={(e) => setPassword(e.target.value)}
/>

      <button type="submit">Signup</button>
    </form>
  );
}