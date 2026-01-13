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
    Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import io from 'socket.io-client';

// ⚠️ ÖNEMLİ: Burayı bilgisayarınızın yerel IP adresi ile değiştirin!
const SOCKET_URL = "http://192.168.1.XX:3000"; // 👈 BURAYI KENDİ İP ADRESİNİZLE GÜNCELLEYİN!!

export default function App() {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [userId] = useState(`User_${Math.floor(Math.random() * 1000)}`);
    const socketRef = useRef(null);
    const flatListRef = useRef(null);

    useEffect(() => {
        socketRef.current = io(SOCKET_URL, {
            transports: ['websocket'],
            reconnection: true,
        });

        socketRef.current.on('receive_message', (data) => {
            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    id: Date.now().toString(),
                    text: data.message,
                    userId: data.userId,
                    timestamp: data.timestamp, // Sunucudan gelen zaman damgası
                    isMine: false,
                },
            ]);
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, []);

    const formatTime = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const sendMessage = () => {
        if (inputMessage.trim() === '') return;

        const timestamp = new Date().toISOString();
        const messageData = {
            message: inputMessage,
            userId: userId,
            timestamp: timestamp,
        };

        setMessages((prevMessages) => [
            ...prevMessages,
            {
                id: Date.now().toString(),
                text: inputMessage,
                userId: userId,
                timestamp: timestamp,
                isMine: true,
            },
        ]);

        socketRef.current.emit('send_message', messageData);
        setInputMessage('');
    };

    const renderMessage = ({ item }) => {
        return (
            <View
                style={[
                    styles.messageContainer,
                    item.isMine ? styles.myMessage : styles.otherMessage,
                ]}
            >
                <View
                    style={[
                        styles.messageBubble,
                        item.isMine ? styles.myBubble : styles.otherBubble,
                    ]}
                >
                    {!item.isMine && (
                        <Text style={styles.userIdText}>~ {item.userId}</Text>
                    )}
                    <Text
                        style={[
                            styles.messageText,
                            item.isMine ? styles.myMessageText : styles.otherMessageText,
                        ]}
                    >
                        {item.text}
                    </Text>
                    <Text
                        style={[
                            styles.timestampText,
                            item.isMine ? styles.myTimestamp : styles.otherTimestamp,
                        ]}
                    >
                        {formatTime(item.timestamp)}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />

            {/* Modern Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{userId.charAt(0)}</Text>
                        </View>
                        <View style={styles.onlineBadge} />
                    </View>
                    <View>
                        <Text style={styles.headerTitle}>Socket Chat</Text>
                        <Text style={styles.headerSubtitle}>🟢 Çevrimiçi • {userId}</Text>
                    </View>
                </View>
            </View>

            <KeyboardAvoidingView
                style={styles.chatContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
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
                            <Text style={styles.emptyEmoji}>👋</Text>
                            <Text style={styles.emptyText}>
                                Sohbet odasına hoş geldin!{'\n'}Hemen bir şeyler yaz.
                            </Text>
                        </View>
                    }
                />

                <View style={styles.inputWrapper}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Mesaj yaz..."
                            placeholderTextColor="#8e8e93"
                            value={inputMessage}
                            onChangeText={setInputMessage}
                            onSubmitEditing={sendMessage}
                            returnKeyType="send"
                            multiline={false}
                        />
                        <TouchableOpacity
                            style={[
                                styles.sendButton,
                                inputMessage.trim() === '' && styles.sendButtonDisabled
                            ]}
                            onPress={sendMessage}
                            disabled={inputMessage.trim() === ''}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.sendButtonArrow}>➜</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f0f', // Daha koyu ve premium arka plan
    },
    header: {
        backgroundColor: '#1c1c1e', // iOS stili koyu gri header
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#2c2c2e',
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 12 : 12,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        marginRight: 12,
        position: 'relative',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#3a3a3c',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    onlineBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#30d158',
        borderWidth: 2,
        borderColor: '#1c1c1e',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.3,
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#8e8e93',
        marginTop: 2,
    },
    chatContainer: {
        flex: 1,
    },
    messageList: {
        padding: 16,
        paddingBottom: 20,
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
        opacity: 0.7,
    },
    emptyEmoji: {
        fontSize: 50,
        marginBottom: 16,
    },
    emptyText: {
        color: '#636366',
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
    messageContainer: {
        marginBottom: 4, // Mesajlar arası mesafe azaltıldı (WhatsApp gibi)
        maxWidth: '85%',
    },
    myMessage: {
        alignSelf: 'flex-end',
    },
    otherMessage: {
        alignSelf: 'flex-start',
    },
    messageBubble: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 1,
        minWidth: 100,
    },
    myBubble: {
        backgroundColor: '#0a84ff', // iOS System Blue
        borderRadius: 16,
        borderBottomRightRadius: 4,
        marginBottom: 4,
    },
    otherBubble: {
        backgroundColor: '#2c2c2e', // iOS System Gray 6
        borderRadius: 16,
        borderBottomLeftRadius: 4,
        marginBottom: 4,
    },
    userIdText: {
        fontSize: 11,
        color: '#ff9f0a', // iOS System Orange
        marginBottom: 4,
        fontWeight: '600',
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
    },
    myMessageText: {
        color: '#fff',
    },
    otherMessageText: {
        color: '#fff',
    },
    timestampText: {
        fontSize: 10,
        alignSelf: 'flex-end',
        marginTop: 4,
        opacity: 0.7,
    },
    myTimestamp: {
        color: 'rgba(255, 255, 255, 0.7)',
    },
    otherTimestamp: {
        color: '#8e8e93',
    },
    inputWrapper: {
        padding: 10,
        backgroundColor: '#1c1c1e',
        borderTopWidth: 1,
        borderTopColor: '#2c2c2e',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2c2c2e',
        borderRadius: 25,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    input: {
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        color: '#fff',
        maxHeight: 100,
    },
    sendButton: {
        backgroundColor: '#0a84ff',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    sendButtonDisabled: {
        backgroundColor: '#3a3a3c',
    },
    sendButtonArrow: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2, // Görsel hizalama için
    },
});
