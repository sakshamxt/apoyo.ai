import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Login from './components/Login';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if a user is already logged in when the app loads
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for login/logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // If no session exists, show the Login screen
  if (!session) {
    return <Login />;
  }

  // If a session exists, show the Secure Admin Dashboard!
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Apoyo.ai Admin</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{session.user.email}</span>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="text-sm bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition"
          >
            Sign Out
          </button>
        </div>
      </div>
      
      <div className="text-center mt-20 text-gray-500">
        <p className="text-xl">Welcome to the secure zone.</p>
        <p>...</p>
      </div>
    </div>
  );
}

export default App;