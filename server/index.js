const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Socket.io yapılandırması - CORS ayarları ile
const io = new Server(server, {
  cors: {
    origin: "*", // Tüm kaynaklardan bağlantıya izin ver
    methods: ["GET", "POST"]
  }
});

app.use(cors());

// Basit bir test endpoint'i
app.get('/', (req, res) => {
  res.send('Chat Server is running! 🚀');
});

// Socket.io bağlantı yönetimi
io.on('connection', (socket) => {
  console.log('✅ Yeni kullanıcı bağlandı:', socket.id);

  // Kullanıcı mesaj gönderdiğinde
  socket.on('send_message', (data) => {
    console.log('📩 Mesaj alındı:', data);
    
    // Mesajı gönderen hariç tüm bağlı kullanıcılara gönder
    socket.broadcast.emit('receive_message', data);
  });

  // Kullanıcı bağlantıyı kestiğinde
  socket.on('disconnect', () => {
    console.log('❌ Kullanıcı ayrıldı:', socket.id);
  });
});

const PORT = 3000;

server.listen(PORT, () => {
  console.log(`🚀 Server çalışıyor: http://localhost:${PORT}`);
  console.log('💡 Mobil cihazlardan bağlanmak için bilgisayarınızın IP adresini kullanın');
  console.log('   Örnek: http://192.168.1.XX:3000');
});
