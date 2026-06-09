import React, { useState, useEffect, useContext } from 'react';
import { SocketContext } from '../context/SocketContext';
import TicketRow from './TicketRow';


import styles from './TicketBoard.module.css';


const AVAILABLE_AGENTS = [
  { id: 'agent_a', label: 'Agent A' },
  { id: 'agent_b', label: 'Agent B' },
  { id: 'agent_c', label: 'Agent C' } 
];

export default function TicketBoard() {
  const context = useContext(SocketContext);
  const [tickets, setTickets] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  
  
  const [agentName, setAgentName] = useState(AVAILABLE_AGENTS[0].label);

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
    <div className={styles.container}>
      
      
      <div className={styles.identityPanel}>
        <span className={styles.panelLabel}>
          Choose Active Profile Identity:
        </span>
        
        
        {AVAILABLE_AGENTS.map((agent) => (
          <button 
            key={agent.id}
            type="button"
            onClick={() => setAgentName(agent.label)}
            className={agentName === agent.label ? styles.agentButtonActive : styles.agentButton}
          >
            {agent.label}
          </button>
        ))}

        <div className={styles.workspaceLabel}>
          Acting Workspace Label: <strong className={styles.workspaceName}>{agentName}</strong>
        </div>
      </div>

      <form onSubmit={handleCreateTicket} className={styles.ticketForm}>
        <input 
          type="text" 
          value={newTitle} 
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Type ticket problem summary details here..."
          className={styles.ticketInput}
        />
        <button type="submit" className={styles.submitButton}>
          File Ticket
        </button>
      </form>

      <div className={styles.boardTableWrapper}>
        <table className={styles.ticketTable}>
          <thead>
            <tr className={styles.tableHeaderRow}>
              <th className={styles.tableHeader}>ID</th>
              <th className={styles.tableHeader}>Topic Description Summary</th>
              <th className={styles.tableHeader}>Lock Status Presence</th>
              <th className={styles.tableHeader}>Execution Controls</th>
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