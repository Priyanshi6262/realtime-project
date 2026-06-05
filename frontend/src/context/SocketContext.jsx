import React, { createContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
   
    const backend_url = 'https://realtime-project-9e5l.onrender.com';
    
    
    const server_address = window.location.hostname === 'localhost' 
      ? 'http://localhost:3000' 
      : backend_url;

    const newSocket = io(server_address, {
      transports: ['websocket', 'polling'], 
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
