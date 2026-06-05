import React from 'react';
import { SocketProvider } from './context/SocketContext';
import ConnectionBanner from './components/ConnectionBanner';
import TicketBoard from './components/TicketBoard';

function App() {
  return (
    <SocketProvider>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
        <ConnectionBanner />
        
        <header style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', margin: '0 0 8px 0' }}>
            Live Support Board
          </h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '16px' }}>
            Real-time synchronization console monitoring live agent work locks.
          </p>
        </header>

        <TicketBoard />
      </div>
    </SocketProvider>
  );
}

export default App;