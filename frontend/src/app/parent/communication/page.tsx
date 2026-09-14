"use client";

import React, { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { Send, User, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const TEACHERS = [
  { id: 1, name: 'Mr. Smith', subject: 'Class Teacher - 10A' },
  { id: 2, name: 'Ms. Davis', subject: 'Class Teacher - 8B' },
];

export default function ParentCommunicationPage() {
  const [selectedTeacher, setSelectedTeacher] = useState(TEACHERS[0].id);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, sender: 'teacher', text: 'Hello, I wanted to discuss your child\'s recent test scores.', time: '10:00 AM' },
    { id: 2, sender: 'parent', text: 'Hi Mr. Smith, sure. Should we schedule a call?', time: '10:15 AM' }
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    setMessages([...messages, { id: Date.now(), sender: 'parent', text: message, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setMessage('');
    
    // Fake response
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now(), sender: 'teacher', text: 'Thank you for your message. I will get back to you shortly.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }, 2000);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col max-w-6xl mx-auto">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Direct Messages</h1>
        <p className="text-slate-500 mt-1">Communicate directly with your children's class teachers.</p>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex">
        {/* Sidebar */}
        <div className="w-1/3 border-r border-slate-100 bg-slate-50/50 flex flex-col">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-700">Teachers</h3>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {TEACHERS.map(t => (
              <button 
                key={t.id}
                onClick={() => setSelectedTeacher(t.id)}
                className={`w-full text-left p-3 rounded-xl transition-colors flex items-center gap-3 ${selectedTeacher === t.id ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-slate-100 border border-transparent'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${selectedTeacher === t.id ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className={`font-bold text-sm ${selectedTeacher === t.id ? 'text-indigo-900' : 'text-slate-800'}`}>{t.name}</h4>
                  <p className="text-xs text-slate-500">{t.subject}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-slate-50">
          <div className="p-4 bg-white border-b border-slate-100 flex items-center gap-3 shadow-sm z-10">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">{TEACHERS.find(t => t.id === selectedTeacher)?.name}</h3>
              <p className="text-xs text-emerald-500 font-medium">Online</p>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                key={msg.id} 
                className={`flex flex-col ${msg.sender === 'parent' ? 'items-end' : 'items-start'}`}
              >
                <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                  msg.sender === 'parent' 
                    ? 'bg-indigo-500 text-white rounded-tr-sm' 
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-sm'
                }`}>
                  <p className="text-sm">{msg.text}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-medium mt-1">{msg.time}</span>
              </motion.div>
            ))}
          </div>
          
          <div className="p-4 bg-white border-t border-slate-200">
            <form onSubmit={handleSend} className="flex gap-2">
              <input 
                type="text"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2.5 bg-slate-100 rounded-xl outline-none text-slate-800 focus:ring-2 focus:ring-indigo-500/20"
              />
              <Button type="submit" className="px-4 py-2.5 shrink-0 flex items-center justify-center">
                <Send className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
