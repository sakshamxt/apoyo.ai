import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UploadCloud, CheckCircle, Clock, Search, Bot, Loader2, Send } from 'lucide-react';

export default function AdminDashboard({ session }) {
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  
  // Doc Upload State
  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');

  // AI Analysis State
  const [analyzingId, setAnalyzingId] = useState(null);
  const [editingReply, setEditingReply] = useState({});

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoadingTickets(true);
    // Fetch directly from Supabase
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setTickets(data);
    }
    setLoadingTickets(false);
  };

  const handleUploadDoc = async (e) => {
    e.preventDefault();
    setUploading(true);
    setUploadMsg('');

    try {
      const res = await fetch('https://apoyo-ai-1069744995127.asia-south1.run.app/upload-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: docTitle, content: docContent })
      });
      
      if (res.ok) {
        setUploadMsg('Document memorized by AI successfully!');
        setDocTitle('');
        setDocContent('');
      } else {
        setUploadMsg('Error uploading document.');
      }
    } catch (err) {
      setUploadMsg('Failed to connect to AI server.');
    }
    setUploading(false);
  };

  const handleAnalyze = async (ticket) => {
    setAnalyzingId(ticket.id);
    
    try {
      const res = await fetch('https://apoyo-ai-1069744995127.asia-south1.run.app/analyze-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // FIX: Send the raw DB column name to Python
        body: JSON.stringify({ ticket_text: ticket.ticket_text }) 
      });
      
      const aiData = await res.json();
      
      setEditingReply(prev => ({
        ...prev,
        [ticket.id]: aiData.reply
      }));

      // FIX: Update using raw DB column names
      await supabase.from('tickets').update({
        ai_category: aiData.category,
        ai_sentiment: aiData.sentiment,
      }).eq('id', ticket.id);
      
      fetchTickets();

    } catch (err) {
      alert("AI Analysis failed. Is Python running?");
    }
    setAnalyzingId(null);
  };

  const handleApprove = async (ticketId) => {
    const finalReply = editingReply[ticketId];
    if (!finalReply) return;

    // FIX: Update using raw DB column names
    await supabase.from('tickets').update({
      status: 'Resolved',
      ai_reply: finalReply
    }).eq('id', ticketId);

    setEditingReply(prev => {
      const newState = { ...prev };
      delete newState[ticketId];
      return newState;
    });
    fetchTickets();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-7xl mx-auto flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Bot className="text-blue-600" /> Apoyo.ai
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Admin: {session.user.email}</span>
          <button onClick={() => supabase.auth.signOut()} className="text-sm text-red-600 hover:underline">Sign Out</button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
            <UploadCloud size={20} className="text-purple-500" />
            Train AI Knowledge Base
          </h2>
          <form onSubmit={handleUploadDoc} className="space-y-4">
            <input type="text" required value={docTitle} onChange={(e) => setDocTitle(e.target.value)} placeholder="Document Title" className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500"/>
            <textarea required value={docContent} onChange={(e) => setDocContent(e.target.value)} rows="6" placeholder="Paste policy text here..." className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500 resize-none"></textarea>
            <button type="submit" disabled={uploading} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium flex justify-center items-center gap-2 disabled:opacity-70">
              {uploading ? <Loader2 size={18} className="animate-spin" /> : 'Upload & Memorize'}
            </button>
            {uploadMsg && <p className="text-sm text-center text-purple-700 font-medium">{uploadMsg}</p>}
          </form>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2 text-gray-800"><Clock size={20} className="text-blue-500" /> Live Ticket Queue</h2>
            <button onClick={fetchTickets} className="text-sm text-blue-600 hover:underline">Refresh List</button>
          </div>

          {loadingTickets ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-500" /></div>
          ) : tickets.length === 0 ? (
            <p className="text-center text-gray-500 p-8">No tickets in the queue! 🎉</p>
          ) : (
            <div className="space-y-4">
              {tickets.map(ticket => (
                <div key={ticket.id} className={`p-4 border rounded-xl transition ${ticket.status === 'Resolved' ? 'bg-gray-50 border-gray-200 opacity-70' : 'bg-white border-blue-100 shadow-sm'}`}>
                  
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      {/* FIX: customer_name instead of customerName */}
                      <span className="font-bold text-gray-800">{ticket.customer_name}</span> 
                      <span className="text-xs text-gray-400 ml-2">Ticket #{ticket.id}</span>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${ticket.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {ticket.status}
                    </span>
                  </div>
                  
                  {/* FIX: ticket_text instead of ticketText */}
                  <p className="text-sm text-gray-700 mb-4 bg-gray-50 p-3 rounded border border-gray-100">"{ticket.ticket_text}"</p>

                  {ticket.status === 'Pending' && (
                    <div className="border-t pt-4">
                      {editingReply[ticket.id] ? (
                        <div className="space-y-3 animate-in fade-in">
                          <div className="flex gap-2 mb-2">
                            {/* FIX: ai_category and ai_sentiment */}
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Cat: {ticket.ai_category}</span>
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Mood: {ticket.ai_sentiment}</span>
                          </div>
                          <label className="text-xs font-bold text-gray-500 uppercase">Review AI Draft:</label>
                          <textarea
                            value={editingReply[ticket.id]}
                            onChange={(e) => setEditingReply({...editingReply, [ticket.id]: e.target.value})}
                            className="w-full p-2 text-sm border border-green-300 rounded focus:ring-2 focus:ring-green-500 bg-green-50 outline-none"
                            rows="3"
                          />
                          <button onClick={() => handleApprove(ticket.id)} className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg font-medium flex items-center gap-2">
                            <CheckCircle size={16} /> Approve & Resolve
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => handleAnalyze(ticket)} disabled={analyzingId === ticket.id} className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-sm px-4 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50">
                          {analyzingId === ticket.id ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                          {analyzingId === ticket.id ? 'Analyzing...' : 'Ask AI to Draft Reply'}
                        </button>
                      )}
                    </div>
                  )}

                  {ticket.status === 'Resolved' && (
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <p className="text-xs font-bold text-green-600 mb-1 flex items-center gap-1"><Send size={12}/> Final Response Sent:</p>
                      {/* FIX: ai_reply instead of aiReply */}
                      <p className="text-sm text-gray-600 italic">{ticket.ai_reply}</p>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}