import { supabase } from "../supabaseClient";

export default function Login() {

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin // ✅ IMPORTANT FIX
      }
    });

    if (error) alert(error.message);
  };

  return (
    <>
      <h2>Login</h2>

      <button onClick={handleGoogleLogin}>
        Sign in with Google
      </button>
    </>
  );
}