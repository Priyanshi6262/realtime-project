const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors()); 

const server = http.createServer(app);


const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"]
  }
});


let tickets = [
  { id: "1", title: "Payment gateway throwing 500 error", customer: "Harry", isLocked: false, lockedBy: null, lockedById: null },
  { id: "2", title: "Mobile app crashing on checkout page", customer: "Nickle Jones", isLocked: false, lockedBy: null, lockedById: null },
  { id: "3", title: "User reset password email link broken", customer: "Kery Brown", isLocked: false, lockedBy: null, lockedById: null }
];
 
let activeLocks = {};

io.on('connection', (socket) => {
  console.log(` New agent joined. Socket ID: ${socket.id}`);

  socket.emit('initial_tickets', tickets);

  socket.on('create_ticket', (ticketTitle) => {
    const newTicket = {
      id: String(tickets.length + 1),
      title: ticketTitle,
      customer: "System Dispatcher",
      isLocked: false,
      lockedBy: null,
      lockedById: null
    };
    tickets.unshift(newTicket);
    
    
    io.emit('ticket_created', newTicket);
  });

  socket.on('lock_ticket', ({ ticketId, agentName }) => {
    if (activeLocks[ticketId] && activeLocks[ticketId].socketId !== socket.id) {
      return socket.emit('error_message', 'This ticket is already locked by another agent.');
    }

    
    tickets = tickets.map(ticket => {
      if (ticket.id === ticketId) {
        return { ...ticket, isLocked: true, lockedBy: agentName, lockedById: socket.id };
      }
      return ticket;
    });

    activeLocks[ticketId] = { socketId: socket.id, agentName };

    
    socket.broadcast.emit('ticket_locked', {
      ticketId,
      lockedBy: agentName,
      lockedById: socket.id
    });
  });

  socket.on('unlock_ticket', ({ ticketId }) => {
    tickets = tickets.map(ticket => {
      if (ticket.id === ticketId) {
        return { ...ticket, isLocked: false, lockedBy: null, lockedById: null };
      }
      return ticket;
    });

    delete activeLocks[ticketId];

    
    socket.broadcast.emit('ticket_unlocked', { ticketId });
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Connection closed by socket: ${socket.id}`);
 
    for (const ticketId in activeLocks) {
      if (activeLocks[ticketId].socketId === socket.id) {
        tickets = tickets.map(ticket => {
          if (ticket.id === ticketId) {
            return { ...ticket, isLocked: false, lockedBy: null, lockedById: null };
          }
          return ticket;
        });
        
        delete activeLocks[ticketId];
  
        socket.broadcast.emit('ticket_unlocked', { ticketId });
      }
    }
  });
});

const PORT = process.env.PORT || 3000;

const clientDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
  console.log('Serving frontend from', clientDist);
} else {
  app.get('/', (req, res) => {
    res.send('Socket server is running. Build the frontend with `npm run build` in ../frontend to serve the dashboard here.');
  });
}
server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Another process may be running.`);
    process.exit(1);
  }
  console.error('Server error:', err);
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(` Node.js Socket server active on http://localhost:${PORT}`);
});