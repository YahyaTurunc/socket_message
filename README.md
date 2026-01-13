# 💬 Gerçek Zamanlı Sohbet Uygulaması

React Native (Expo) ve Socket.io kullanarak geliştirilmiş gerçek zamanlı sohbet uygulaması. Aynı Wi-Fi ağındaki iki farklı telefonda çalışır.

## 📁 Proje Yapısı

```
socket_message/
├── server/              # Backend (Node.js + Socket.io)
│   ├── package.json
│   └── index.js
└── mobile/              # Frontend (React Native + Expo)
    ├── package.json
    ├── app.json
    └── App.js
```

## 🚀 Kurulum Adımları

### 1️⃣ Backend (Server) Kurulumu

```bash
# Server klasörüne git
cd server

# Bağımlılıkları yükle
npm install

# Sunucuyu başlat
npm start
```

Sunucu başarıyla başladığında şu mesajı göreceksiniz:
```
🚀 Server çalışıyor: http://localhost:3000
💡 Mobil cihazlardan bağlanmak için bilgisayarınızın IP adresini kullanın
```

### 2️⃣ Bilgisayarınızın IP Adresini Öğrenin

**Mac/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```bash
ipconfig
```

Örnek IP adresi: `192.168.1.105`

### 3️⃣ Frontend (Mobile) Kurulumu

```bash
# Mobile klasörüne git
cd mobile

# Bağımlılıkları yükle
npm install
```

### 4️⃣ IP Adresini Yapılandırın

`mobile/App.js` dosyasını açın ve **10. satırdaki** `SOCKET_URL` değişkenini güncelleyin:

```javascript
// ÖNCEKİ:
const SOCKET_URL = "http://192.168.1.XX:3000";

// SONRAKİ (kendi IP adresinizle):
const SOCKET_URL = "http://192.168.1.105:3000";
```

### 5️⃣ Mobil Uygulamayı Başlatın

```bash
# Expo development server'ı başlat
npx expo start
```

QR kodu telefonunuzda **Expo Go** uygulaması ile tarayın.

## 📱 Test Etme

1. **İki farklı telefonda** Expo Go ile uygulamayı açın
2. Her iki telefon da **aynı Wi-Fi ağına** bağlı olmalı
3. Bir telefondan mesaj gönderin
4. Diğer telefonda **gerçek zamanlı** olarak mesajın geldiğini görün

## 🎨 Özellikler

✅ WhatsApp benzeri modern UI tasarımı  
✅ Gerçek zamanlı mesajlaşma  
✅ Mesaj baloncukları (kendi mesajlar sağda, diğerleri solda)  
✅ KeyboardAvoidingView ile klavye yönetimi  
✅ Otomatik kullanıcı ID oluşturma  
✅ Bağlantı durumu takibi  
✅ Dark mode tasarım

## 📦 Gerekli Paketler

### Backend Dependencies:
```bash
npm install express socket.io cors
```

### Frontend Dependencies:
```bash
npm install socket.io-client
npx expo install expo-status-bar
```

## 🔧 Sorun Giderme

### Bağlantı Hatası Alıyorum
- Sunucunun çalıştığından emin olun (`server` klasöründe `npm start`)
- IP adresinin doğru olduğunu kontrol edin
- Firewall'un 3000 portunu engellemediğinden emin olun
- Her iki cihazın da aynı Wi-Fi ağında olduğunu kontrol edin

### Mesajlar Gelmiyor
- Browser console'da hata kontrolü yapın
- Socket bağlantısının kurulduğunu kontrol edin (yeşil ✅ işareti)
- Server terminalinde mesaj loglarını kontrol edin

## 📝 Teknik Detaylar

- **Backend**: Node.js, Express, Socket.io
- **Frontend**: React Native (Expo Managed Workflow)
- **Real-time Communication**: Socket.io (WebSocket)
- **Port**: 3000
- **CORS**: Tüm kaynaklara açık (`origin: "*"`)

## 🎯 Kullanım

1. Uygulamayı açın
2. Otomatik olarak rastgele bir kullanıcı ID'si atanır
3. Alt kısımdaki input alanına mesajınızı yazın
4. "Gönder" butonuna basın
5. Mesajınız diğer tüm bağlı cihazlara anında iletilir

---

**Geliştirici Notu:** Bu uygulama eğitim amaçlıdır. Production ortamında kullanmak için güvenlik önlemleri (authentication, message validation, rate limiting) eklenmelidir.
