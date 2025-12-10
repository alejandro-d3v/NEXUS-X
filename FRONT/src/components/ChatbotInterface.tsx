import React, { useState, useEffect, useRef } from 'react';
import { chatService } from '../services/chat.service';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

interface ChatbotInterfaceProps {
  activityId: string;
  chatbotConfig: {
    topic: string;
    personality?: string;
    welcomeMessage?: string;
    systemPrompt?: string;
  };
}

export const ChatbotInterface: React.FC<ChatbotInterfaceProps> = ({ activityId, chatbotConfig }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversation history on mount
  useEffect(() => {
    loadHistory();
  }, [activityId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadHistory = async () => {
    try {
      const history = await chatService.getConversationHistory(activityId);
      setMessages(history.map(msg => ({ ...msg, timestamp: new Date() })));
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await chatService.sendMessage(activityId, userMessage.content);
      
      const botMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      alert('Error al enviar mensaje');
      console.error('Chat error:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = async () => {
    if (window.confirm('¿Estás seguro de que quieres borrar toda la conversación?')) {
      try {
        await chatService.clearConversation(activityId);
        setMessages([]);
        alert('Conversación borrada');
      } catch (error) {
        alert('Error al borrar conversación');
      }
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="header-content">
          <h3>🤖 {chatbotConfig.topic}</h3>
          <p className="chatbot-subtitle">
            {chatbotConfig.personality ? `Personalidad: ${chatbotConfig.personality}` : 'Chatbot Experto'}
          </p>
        </div>
        <button onClick={clearChat} className="clear-btn" title="Borrar conversación">
          🗑️
        </button>
      </div>

      <div className="chatbot-messages">
        {messages.length === 0 && chatbotConfig.welcomeMessage && (
          <div className="message assistant welcome">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="message-text">{chatbotConfig.welcomeMessage}</div>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => {
          if (msg.role === 'system') return null;
          
          return (
            <div key={idx} className={`message ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === 'user' ? '👤' : '🤖'}
              </div>
              <div className="message-content">
                <div className="message-text">{msg.content}</div>
                {msg.timestamp && (
                  <div className="message-time">
                    {msg.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="message assistant typing">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chatbot-input-container">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={`Pregunta sobre ${chatbotConfig.topic}...`}
          className="chatbot-input"
          rows={2}
          maxLength={500}
          disabled={isTyping}
        />
        <button 
          onClick={sendMessage} 
          disabled={!input.trim() || isTyping}
          className="send-btn"
        >
          {isTyping ? '⏳' : '📤'}
        </button>
      </div>

      <style>{`
        .chatbot-container {
          display: flex;
          flex-direction: column;
          height: 600px;
          max-width: 900px;
          margin: 0 auto;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .chatbot-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-content h3 {
          margin: 0;
          font-size: 1.5rem;
        }

        .chatbot-subtitle {
          margin: 0.25rem 0 0 0;
          opacity: 0.9;
          font-size: 0.9rem;
        }

        .clear-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1.2rem;
          transition: background 0.2s;
        }

        .clear-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .chatbot-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          background: #f5f7fa;
        }

        .message {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .message.user {
          flex-direction: row-reverse;
        }

        .message-avatar {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .message-content {
          max-width: 70%;
        }

        .message.user .message-content {
          background: #667eea;
          color: white;
        }

        .message.assistant .message-content {
          background: white;
          color: #333;
        }

        .message.welcome .message-content {
          background: #e8f5e9;
          border-left: 4px solid #4caf50;
        }

        .message-text {
          padding: 1rem 1.25rem;
          border-radius: 12px;
          line-height: 1.6;
          word-wrap: break-word;
        }

        .message-time {
          font-size: 0.75rem;
          opacity: 0.7;
          margin-top: 0.25rem;
          padding: 0 0.5rem;
        }

        .typing-indicator {
          display: flex;
          gap: 0.5rem;
          padding: 1rem;
          background: white;
          border-radius: 12px;
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          background: #667eea;
          border-radius: 50%;
          animation: typing 1.4s infinite;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-10px); }
        }

        .chatbot-input-container {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background: white;
          border-top: 1px solid #e0e0e0;
        }

        .chatbot-input {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          font-family: inherit;
          resize: none;
          transition: border-color 0.2s;
        }

        .chatbot-input:focus {
          outline: none;
          border-color: #667eea;
        }

        .chatbot-input:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
        }

        .send-btn {
          padding: 0.75rem 1.5rem;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1.2rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .send-btn:hover:not(:disabled) {
          background: #764ba2;
          transform: scale(1.05);
        }

        .send-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: scale(1);
        }

        .chatbot-messages::-webkit-scrollbar {
          width: 8px;
        }

        .chatbot-messages::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .chatbot-messages::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }

        .chatbot-messages::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
};
