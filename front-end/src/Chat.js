import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown'; // Import the library
import './Chat.css'; // Make sure this path is correct

const Chat = () => {
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const handleAsk = async () => {
    if (!question.trim()) return;

    const userMessage = { role: 'user', text: question };
    setChatHistory((prev) => [...prev, userMessage]);
    setQuestion('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8080/api/qna/ask', {
        question: question,
      });

      const aiText =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text ??
        "Aww, shucks! No answer right now. Let's try again?";

      const aiMessage = { role: 'ai', text: aiText };
      setChatHistory((prev) => [...prev, aiMessage]);
    } catch (error) {
      setChatHistory((prev) => [
        ...prev,
        { role: 'ai', text: "Oopsie! Something went wrong. Wanna try that one more time?" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  return (
    <div className="cute-chat-container"> {/* Keep the CSS class name for styling */}
      <div className="cute-chat-header">
        <span role="img" aria-label="Sparkles">✨</span> Chat <span role="img" aria-label="Robot">🤖</span>
      </div>
      <div className="cute-chat-body">
      {chatHistory.map((msg, idx) => (
        <div
            key={idx}
            className={`cute-message-container ${msg.role === 'user' ? 'cute-user' : 'cute-ai'}`}
        >
            <div className="cute-message-bubble">
            {msg.role === 'ai' ? (
                <ReactMarkdown>{msg.text}</ReactMarkdown>
            ) : (
                msg.text
            )}
            </div>
        </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="cute-chat-input-area">
        <textarea
          rows="2"
          className="cute-chat-input"
          placeholder="Type your question and press Enter~"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button
          onClick={handleAsk}
          disabled={loading}
          className="cute-send-button"
        >
          {loading ? <span role="img" aria-label="Thinking">💭</span> : <span role="img" aria-label="Heart">💖 Send</span>}
        </button>
      </div>
    </div>
  );
};

export default Chat;