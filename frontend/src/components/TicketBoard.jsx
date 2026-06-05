import React, { useState, useEffect, useContext } from 'react';
import { SocketContext } from '../context/SocketContext';
import TicketRow from './TicketRow';

export default function TicketBoard() {
  const context = useContext(SocketContext);
  const [tickets, setTickets] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  
  
  const [agentName, setAgentName] = useState('Agent A');

  const socket = context ? context.socket : null;

  useEffect(() => {
    if (!socket) return;

    socket.on('initial_tickets', (initialList) => {
      const formatted = initialList.map(t => ({ ...t, myCurrentSocketId: socket.id }));
      setTickets(formatted);
    });

    socket.on('ticket_created', (newTicket) => {
      setTickets(prev => [{ ...newTicket, myCurrentSocketId: socket.id }, ...prev]);
    });

    socket.on('ticket_locked', ({ ticketId, lockedBy, lockedById }) => {
      setTickets(prev => prev.map(t => 
        t.id === ticketId ? { ...t, isLocked: true, lockedBy, lockedById } : t
      ));
    });

    socket.on('ticket_unlocked', ({ ticketId }) => {
      setTickets(prev => prev.map(t => 
        t.id === ticketId ? { ...t, isLocked: false, lockedBy: null, lockedById: null } : t
      ));
    });

    return () => {
      socket.off('initial_tickets');
      socket.off('ticket_created');
      socket.off('ticket_locked');
      socket.off('ticket_unlocked');
    };
  }, [socket]);

  const handleCreateTicket = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !socket) return;
    socket.emit('create_ticket', newTitle);
    setNewTitle('');
  };

  const handleLock = (id) => {
    if (!socket) return;
    socket.emit('lock_ticket', { ticketId: id, agentName });
    setTickets(prev => prev.map(t => 
      t.id === id ? { ...t, isLocked: true, lockedBy: agentName, lockedById: socket.id } : t
    ));
  };

  const handleUnlock = (id) => {
    if (!socket) return;
    socket.emit('unlock_ticket', { ticketId: id });
    setTickets(prev => prev.map(t => 
      t.id === id ? { ...t, isLocked: false, lockedBy: null, lockedById: null } : t
    ));
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      
      
      <div style={{ 
        marginBottom: '24px', 
        padding: '16px', 
        backgroundColor: '#f0fdf4', 
        borderRadius: '8px', 
        border: '1px solid #bbf7d0', 
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <span style={{ fontSize: '14px', fontWeight: '500', color: '#166534' }}>
           Choose Active Profile Identity:
        </span>
        
        <button 
          type="button"
          onClick={() => setAgentName('Agent A')}
          style={{
            padding: '6px 16px',
            backgroundColor: agentName === 'Agent A' ? '#16a34a' : '#ffffff',
            color: agentName === 'Agent A' ? '#ffffff' : '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '13px',
            boxShadow: agentName === 'Agent A' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
          }}
        >
          Agent A
        </button>

        <button 
          type="button"
          onClick={() => setAgentName('Agent B')}
          style={{
            padding: '6px 16px',
            backgroundColor: agentName === 'Agent B' ? '#16a34a' : '#ffffff',
            color: agentName === 'Agent B' ? '#ffffff' : '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '13px',
            boxShadow: agentName === 'Agent B' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
          }}
        >
          Agent B
        </button>

        <div style={{ marginLeft: 'auto', fontSize: '14px', color: '#374151' }}>
          Acting Workspace Label: <strong style={{ color: '#16a34a' }}>{agentName}</strong>
        </div>
      </div>

      <form onSubmit={handleCreateTicket} style={{ marginBottom: '32px', display: 'flex', gap: '12px' }}>
        <input 
          type="text" 
          value={newTitle} 
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Type ticket problem summary details here..."
          style={{ padding: '10px 14px', width: '360px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px' }}
        />
        <button type="submit" style={{ padding: '10px 18px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
          File Ticket
        </button>
      </form>

      <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '14px 16px', fontWeight: '600', color: '#4b5563' }}>ID</th>
              <th style={{ padding: '14px 16px', fontWeight: '600', color: '#4b5563' }}>Topic Description Summary</th>
              <th style={{ padding: '14px 16px', fontWeight: '600', color: '#4b5563' }}>Lock Status Presence</th>
              <th style={{ padding: '14px 16px', fontWeight: '600', color: '#4b5563' }}>Execution Controls</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(ticket => (
              <TicketRow 
                key={ticket.id} 
                ticket={ticket} 
                onLock={handleLock}
                onUnlock={handleUnlock}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}