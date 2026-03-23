import { supabase } from "../supabaseClient";

export default function Logout({ setUser }) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return <button onClick={handleLogout}>Logout</button>;
}