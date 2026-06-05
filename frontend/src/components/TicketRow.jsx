import React from 'react';

export default function TicketRow({ ticket, onLock, onUnlock }) {

  const isLockedByOthers = ticket.isLocked && ticket.lockedById !== ticket.myCurrentSocketId;
  const isLockedByMe = ticket.isLocked && ticket.lockedById === ticket.myCurrentSocketId;

  return (
    <tr style={{
      backgroundColor: isLockedByOthers ? '#f3f4f6' : '#ffffff',
      color: isLockedByOthers ? '#9ca3af' : '#111827',
      transition: 'background-color 0.1s ease'
    }}>
      <td style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>#{ticket.id}</td>
      <td style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', fontWeight: '500' }}>
        {ticket.title}
      </td>
      <td style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
        {isLockedByOthers && (
          <span style={{ color: '#d97706', fontWeight: '600' }}>
            🔒 Locked by {ticket.lockedBy}
          </span>
        )}
        {isLockedByMe && (
          <span style={{ color: '#16a34a', fontWeight: '600' }}>
             You are editing this...
          </span>
        )}
        {!ticket.isLocked && (
          <span style={{ color: '#2563eb', backgroundColor: '#eff6ff', padding: '4px 8px', borderRadius: '9999px', fontSize: '12px', fontWeight: '500' }}>
            Available
          </span>
        )}
      </td>
      <td style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
        {isLockedByMe ? (
          <button
            onClick={() => onUnlock(ticket.id)}
            style={{
              backgroundColor: '#4b5563',
              color: '#ffffff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Save / Close
          </button>
        ) : (
          <button
            disabled={isLockedByOthers}
            onClick={() => onLock(ticket.id)}
            style={{
              backgroundColor: isLockedByOthers ? '#e5e7eb' : '#2563eb',
              color: isLockedByOthers ? '#9ca3af' : '#ffffff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '6px',
              cursor: isLockedByOthers ? 'not-allowed' : 'pointer',
              fontWeight: '500'
            }}
          >
            Edit
          </button>
        )}
      </td>
    </tr>
  );
}