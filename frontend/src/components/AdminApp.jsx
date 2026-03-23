import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Login from './Login';
import AdminDashboard from './AdminDashboard';
import { Loader2 } from 'lucide-react';

export default function AdminApp() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={40}/></div>;
  }

  if (!session) {
    return <Login />;
  }

  return <AdminDashboard session={session} />;
}