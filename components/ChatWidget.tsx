import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageSquare } from 'lucide-react';
import { ChatMessage, UserRole } from '../types';

interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  currentUserRole: UserRole;
  recipientName: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  currentUserRole,
  recipientName,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 flex flex-col h-[500px] animate-in slide-in-from-bottom-5 duration-300">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md z-10">
        <div className="flex items-center gap-2">
          <div className="bg-white/10 p-1.5 rounded-full">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Chat with {recipientName}</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-[10px] text-slate-300">Online</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="hover:bg-white/10 p-1 rounded-full transition">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-full text-slate-400">
             <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
             <p className="text-sm">Start the conversation...</p>
           </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderRole === currentUserRole;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}
                >
                  <p>{msg.text}</p>
                  <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex gap-2 items-center">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2.5 bg-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="bg-indigo-600 text-white p-2.5 rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-200 transition active:scale-95"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default ChatWidget;