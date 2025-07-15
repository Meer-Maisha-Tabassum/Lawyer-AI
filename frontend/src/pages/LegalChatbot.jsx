import React, { useState, useEffect, useRef } from 'react';
import { Bot, Loader, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { api } from '../api';

const LegalChatbot = ({ userId, isAuthReady }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef(null);
    const chatId = 'main_chat';

    useEffect(() => {
        if (!userId || !isAuthReady) return;
        const messagesRef = collection(db, `users/${userId}/chats/${chatId}/messages`);
        const q = query(messagesRef, orderBy("createdAt"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const msgs = [];
            querySnapshot.forEach((doc) => {
                msgs.push({ id: doc.id, ...doc.data() });
            });
            if (msgs.length === 0) {
                msgs.push({ id: 'initial', text: "Hello! I am a legal assistant AI. I can answer questions based on a vast corpus of legal knowledge. How can I help you today?", sender: 'bot' });
            }
            setMessages(msgs);
        });
        return () => unsubscribe();
    }, [userId, isAuthReady]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !userId || !isAuthReady) return;
        const userMessageText = input;
        setInput('');

        const messagesRef = collection(db, `users/${userId}/chats/${chatId}/messages`);
        await addDoc(messagesRef, { text: userMessageText, sender: 'user', createdAt: serverTimestamp() });

        setIsLoading(true);
        try {
            const botResponse = await api.sendChatMessage(userMessageText);
            await addDoc(messagesRef, { text: botResponse.response, sender: 'bot', createdAt: serverTimestamp() });
        } catch (error) {
            console.error("Chatbot failed:", error);
            await addDoc(messagesRef, { text: `Sorry, I encountered an error: ${error.message}`, sender: 'bot', createdAt: serverTimestamp() });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex-shrink-0">Legal Q&A Chatbot</h2>
            <div className="flex-grow bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col overflow-hidden">
                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                    {messages.map((msg) => (
                        <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender === 'bot' && <Bot className="w-8 h-8 text-indigo-600 bg-gray-200 p-1 rounded-full flex-shrink-0" />}
                            <div className={`max-w-xl p-4 rounded-2xl ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}><p>{msg.text}</p></div>
                            {msg.sender === 'user' && <User className="w-8 h-8 text-white bg-indigo-400 p-1 rounded-full flex-shrink-0" />}
                        </motion.div>
                    ))}
                    {isLoading && (
                        <div className="flex items-end gap-2 justify-start">
                            <Bot className="w-8 h-8 text-indigo-600 bg-gray-200 p-1 rounded-full flex-shrink-0" />
                            <div className="max-w-xl p-4 rounded-2xl bg-gray-200 text-gray-800 rounded-bl-none"><div className="flex items-center gap-2"><div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></div><div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div></div></div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
                <div className="p-4 border-t bg-gray-50">
                    <div className="flex gap-4">
                        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()} placeholder="Ask a legal question..." className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500" disabled={isLoading || !isAuthReady} />
                        <button onClick={handleSend} disabled={isLoading || !isAuthReady} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300">Send</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LegalChatbot;