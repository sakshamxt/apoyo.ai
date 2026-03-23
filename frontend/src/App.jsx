import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CustomerPortal from './components/CustomerPortal';
import AdminApp from './components/AdminApp';
import TicketTracker from './components/TicketTracker';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Customer Form */}
        <Route path="/" element={<CustomerPortal />} />
        <Route path="/track" element={<TicketTracker />} />
        
        {/* Admin Portal */}
        <Route path="/admin" element={<AdminApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;