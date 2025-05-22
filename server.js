// server.js
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
console.log('🔌 WebSocket server started on ws://localhost:8080');

let clients = [];

wss.on('connection', function connection(ws) {
  console.log('📲 New client connected');

  ws.on('message', function incoming(message) {
    try {
      const data = JSON.parse(message);
      console.log('📥 Received:', data);

      // Memorizza il messaggio
      clients.push({ data: data, ws: ws });

      // Mantieni solo gli ultimi 2
      if (clients.length > 2) {
        clients.shift();
      }

      // Se ci sono due gesture da confrontare
      if (clients.length === 2) {
        const [a, b] = clients;

        const timeDiff = Math.abs(a.data.timestamp - b.data.timestamp);
        const labelA = a.data.label;
        const labelB = b.data.label;

        if (labelA === 'handshake' && labelB === 'handshake' && timeDiff <= 2000) {
          // Entro 2 secondi → Handshake accoppiato
          a.ws.send(JSON.stringify({ result: '🤝 Handshake accoppiato!' }));
          b.ws.send(JSON.stringify({ result: '🤝 Handshake accoppiato!' }));
        } else {
          a.ws.send(JSON.stringify({ result: '⛔ Nessun accoppiamento' }));
          b.ws.send(JSON.stringify({ result: '⛔ Nessun accoppiamento' }));
        }

        // Svuota dopo aver processato
        clients = [];
      }
    } catch (e) {
      console.error('❌ Errore nel parsing del messaggio:', e);
    }
  });

  ws.on('close', () => {
    console.log('❌ Client disconnesso');
    clients = clients.filter(c => c.ws !== ws);
  });
});
