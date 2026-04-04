import { supabase } from "../supabaseClient";

export default function Login() {

  // ✅ Google Login
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) alert(error.message);
  };

  // ✅ LinkedIn Login
  const handleLinkedInLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "linkedin_oidc",
      options: {
        redirectTo: window.location.origin
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

      <br /><br />

      <button onClick={handleLinkedInLogin}>
        Sign in with LinkedIn
      </button>
    </>
  );
}