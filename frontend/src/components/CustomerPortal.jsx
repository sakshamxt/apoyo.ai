import { useState } from 'react';
import { Send, Bot, Loader2, CheckCircle2, Copy, ArrowRight, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function CustomerPortal() {
  const [name, setName] = useState('');
  const [ticketText, setTicketText] = useState('');
  const [loading, setLoading] = useState(false);
  
  // New state variables for the success screen
  const [submittedTicketId, setSubmittedTicketId] = useState(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('https://backend-node-1069744995127.europe-west1.run.app/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName: name, ticketText }),
      });

      if (response.ok) {
        const data = await response.json();
        setSubmittedTicketId(data.ticket.id); // Save the ID for the UI
        setName('');
        setTicketText('');
      }
    } catch (err) {
      alert('Failed to submit ticket. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(submittedTicketId.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans relative">
      <div className="max-w-md w-full">
        
        {/* The Big Tracking Link */}
        <div className="flex justify-end mb-4">
          <Link to="/track" className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 text-sm font-semibold text-blue-600 hover:bg-blue-50 flex items-center gap-2 transition">
            <Search size={16} /> Track My Ticket
          </Link>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-center mb-8">
            <Bot size={48} className="text-blue-600 mx-auto mb-3" />
            <h1 className="text-3xl font-extrabold text-gray-900">Support Center</h1>
            <p className="text-gray-500 mt-2">How can we help you today?</p>
          </div>

          {submittedTicketId ? (
            <div className="text-center animate-in zoom-in-95 duration-300">
              <div className="bg-green-50 border border-green-200 p-6 rounded-xl mb-6">
                <CheckCircle2 size={40} className="text-green-500 mx-auto mb-3" />
                <h2 className="text-xl font-bold text-green-900 mb-2">Ticket Submitted!</h2>
                <p className="text-green-800 text-sm mb-4">Please save your Ticket ID to check the status of your request.</p>
                
                <div className="flex items-center justify-center gap-2 bg-white p-3 rounded-lg border border-green-200">
                  <span className="text-2xl font-mono font-bold text-gray-800">#{submittedTicketId}</span>
                  <button 
                    onClick={handleCopy}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                    title="Copy to clipboard"
                  >
                    {copied ? <CheckCircle2 size={20} className="text-green-500" /> : <Copy size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => navigate('/track')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg flex justify-center items-center gap-2 transition"
                >
                  Go to Tracking Portal <ArrowRight size={18} />
                </button>
                <button 
                  onClick={() => setSubmittedTicketId(null)}
                  className="text-sm text-gray-500 hover:text-gray-700 py-2"
                >
                  Submit another ticket
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Description</label>
                <textarea required value={ticketText} onChange={(e) => setTicketText(e.target.value)} rows="5" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Please describe your problem in detail..."></textarea>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg flex justify-center items-center gap-2 transition">
                {loading ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Submit Ticket</>}
              </button>
            </form>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link to="/admin" className="text-sm text-gray-400 hover:text-gray-600 transition">
            Employee Login
          </Link>
        </div>
      </div>
    </div>
  );
}