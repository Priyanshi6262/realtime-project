import React from 'react';
import { useContext } from 'react';
import { SocketContext } from '../context/SocketContext';

export default function ConnectionBanner() {
  const context = useContext(SocketContext);
  if (!context) return null;

  const { isConnected } = context;

  
  if (isConnected) return null;

  return (
    <div style={{
      backgroundColor: '#dc2626',
      color: '#ffffff',
      padding: '12px 24px',
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: '14px',
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      zIndex: 9999,
      fontFamily: 'system-ui, sans-serif',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
       Connection Lost: Reconnecting... Your changes might not save.
    </div>
  );
}