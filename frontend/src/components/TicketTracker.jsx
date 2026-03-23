import { useState } from 'react';
import { Search, ArrowLeft, Loader2, Bot, CheckCircle2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TicketTracker() {
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    
    setLoading(true);
    setError('');
    setTicket(null);

    try {
      const response = await fetch(`https://backend-node-1069744995127.europe-west1.run.app/api/tickets/${searchId}`);
      if (!response.ok) {
        throw new Error('Ticket not found. Please check the ID and try again.');
      }
      const data = await response.json();
      setTicket(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 font-sans">
      <div className="max-w-xl w-full">
        
        <Link to="/" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-6 transition">
          <ArrowLeft size={16} className="mr-1" /> Back to Support Form
        </Link>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-center mb-8">
            <Search size={40} className="text-blue-500 mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-gray-900">Track Your Ticket</h1>
            <p className="text-gray-500 mt-2">Enter your Ticket ID below to check its current status.</p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-3 mb-8">
            <input
              type="text"
              required
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="e.g. 15"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-lg"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition flex items-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Track'}
            </button>
          </form>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg text-center border border-red-100 animate-in fade-in">
              {error}
            </div>
          )}

          {ticket && (
            <div className="animate-in slide-in-from-bottom-4 fade-in duration-300">
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-gray-800">Ticket #{ticket.id}</h3>
                    <p className="text-sm text-gray-500">Submitted by {ticket.customerName}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                    ticket.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {ticket.status === 'Resolved' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                    {ticket.status}
                  </span>
                </div>
                
                <div className="p-6">
                  <div className="mb-6">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Your Message</p>
                    <p className="text-gray-700 text-sm bg-gray-50 p-4 rounded-lg">"{ticket.ticketText}"</p>
                  </div>

                  {ticket.status === 'Resolved' && ticket.aiReply ? (
                    <div>
                      <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Bot size={14} /> Support Response
                      </p>
                      <div className="bg-blue-50 border border-blue-100 text-blue-900 p-4 rounded-lg text-sm leading-relaxed">
                        {ticket.aiReply}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                      <p className="text-sm text-yellow-800">Our team is currently reviewing your ticket. Please check back later!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}