import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    Keyboard,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import io from 'socket.io-client';

// ⚠️ ÖNEMLİ: Burayı bilgisayarınızın yerel IP adresi ile değiştirin!
// Terminal'de "ifconfig" (Mac/Linux) veya "ipconfig" (Windows) komutu ile IP adresinizi öğrenebilirsiniz
// Örnek: const SOCKET_URL = "http://192.168.1.105:3000";
const SOCKET_URL = "http://192.168.1.XX:3000"; // 👈 BURAYI KENDİ İP ADRESİNİZLE GÜNCELLEYİN!!

export default function App() {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [userId] = useState(`User_${Math.random().toString(36).substr(2, 9)}`);
    const socketRef = useRef(null);
    const flatListRef = useRef(null);

    useEffect(() => {
        // Socket.io bağlantısını kur
        socketRef.current = io(SOCKET_URL, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        // Bağlantı başarılı olduğunda
        socketRef.current.on('connect', () => {
            console.log('✅ Socket bağlantısı kuruldu');
        });

        // Mesaj alındığında
        socketRef.current.on('receive_message', (data) => {
            console.log('📩 Mesaj alındı:', data);
            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    id: Date.now().toString(),
                    text: data.message,
                    userId: data.userId,
                    isMine: false,
                },
            ]);
        });

        // Bağlantı hatası
        socketRef.current.on('connect_error', (error) => {
            console.error('❌ Bağlantı hatası:', error);
        });

        // Component unmount olduğunda bağlantıyı kes
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    // Mesaj gönderme fonksiyonu
    const sendMessage = () => {
        if (inputMessage.trim() === '') return;

        const messageData = {
            message: inputMessage,
            userId: userId,
            timestamp: new Date().toISOString(),
        };

        // Kendi mesajımızı hemen ekle
        setMessages((prevMessages) => [
            ...prevMessages,
            {
                id: Date.now().toString(),
                text: inputMessage,
                userId: userId,
                isMine: true,
            },
        ]);

        // Mesajı sunucuya gönder
        socketRef.current.emit('send_message', messageData);

        // Input'u temizle
        setInputMessage('');
        Keyboard.dismiss();
    };

    // Mesaj baloncuğu render fonksiyonu
    const renderMessage = ({ item }) => {
        return (
            <View
                style={[
                    styles.messageContainer,
                    item.isMine ? styles.myMessage : styles.otherMessage,
                ]}
            >
                {!item.isMine && (
                    <Text style={styles.userIdText}>{item.userId}</Text>
                )}
                <View
                    style={[
                        styles.messageBubble,
                        item.isMine ? styles.myBubble : styles.otherBubble,
                    ]}
                >
                    <Text
                        style={[
                            styles.messageText,
                            item.isMine ? styles.myMessageText : styles.otherMessageText,
                        ]}
                    >
                        {item.text}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>💬 Gerçek Zamanlı Sohbet</Text>
                <Text style={styles.headerSubtitle}>Kullanıcı: {userId}</Text>
            </View>

            {/* Mesaj Listesi */}
            <KeyboardAvoidingView
                style={styles.chatContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.messageList}
                    onContentSizeChange={() =>
                        flatListRef.current?.scrollToEnd({ animated: true })
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                Henüz mesaj yok. İlk mesajı gönderin! 🚀
                            </Text>
                        </View>
                    }
                />

                {/* Mesaj Gönderme Alanı */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Mesajınızı yazın..."
                        placeholderTextColor="#999"
                        value={inputMessage}
                        onChangeText={setInputMessage}
                        onSubmitEditing={sendMessage}
                        returnKeyType="send"
                    />
                    <TouchableOpacity
                        style={styles.sendButton}
                        onPress={sendMessage}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.sendButtonText}>Gönder</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',

    },
    header: {
        backgroundColor: '#1a1a1a',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#888',
    },
    chatContainer: {
        flex: 1,
    },
    messageList: {
        padding: 16,
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: {
        color: '#666',
        fontSize: 16,
        textAlign: 'center',
    },
    messageContainer: {
        marginBottom: 12,
        maxWidth: '80%',
    },
    myMessage: {
        alignSelf: 'flex-end',
    },
    otherMessage: {
        alignSelf: 'flex-start',
    },
    userIdText: {
        fontSize: 11,
        color: '#888',
        marginBottom: 4,
        marginLeft: 8,
    },
    messageBubble: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    myBubble: {
        backgroundColor: '#0084ff',
        borderBottomRightRadius: 4,
    },
    otherBubble: {
        backgroundColor: '#2a2a2a',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 20,
    },
    myMessageText: {
        color: '#fff',
    },
    otherMessageText: {
        color: '#fff',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: '#1a1a1a',
        borderTopWidth: 1,
        borderTopColor: '#333',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        backgroundColor: '#2a2a2a',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#fff',
        marginRight: 8,
    },
    sendButton: {
        backgroundColor: '#0084ff',
        borderRadius: 24,
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    sendButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
