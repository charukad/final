import React, { useState, useEffect, useRef } from "react";
import { chatWithGemini } from "../../services/geminiService";

const AIChat = ({ content, onAddToNote }) => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm NoteFlow+, your AI writing assistant How can I help with your note?",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message to AI
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message to chat
    const userMessage = { role: "user", content: inputMessage };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setLoading(true);

    try {
      // Check if the user is asking about the AI's name or identity
      const lowercaseContent = userMessage.content.toLowerCase().trim();
      if (
        lowercaseContent === 'what is your name?' || 
        lowercaseContent === 'what is your name' ||
        lowercaseContent === 'who are you?' ||
        lowercaseContent === 'who are you' ||
        lowercaseContent === 'what should i call you?' ||
        lowercaseContent === 'what should i call you' ||
        lowercaseContent === "what's your name?" ||
        lowercaseContent === "what's your name"
      ) {
        // Provide a direct response without API call
        setMessages((prev) => [
          ...prev,
          { 
            role: "assistant", 
            content: "My name is NoteFlow+. I'm your AI writing assistant  How can I help you with your note today?" 
          },
        ]);
        setLoading(false);
        return;
      }

      // Get all messages for context
      const messageHistory = [...messages, userMessage];
      
      // Send to Gemini API
      const response = await chatWithGemini(messageHistory, content);

      // Add AI response to chat
      setMessages((prev) => [...prev, response]);
    } catch (error) {
      console.error("Error in AI chat:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Handle key press (Enter to send)
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Add response to note
  const handleAddToNote = (messageContent) => {
    if (onAddToNote) {
      onAddToNote(messageContent);
    }
  };

  return (
    <div className="ai-chat">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <div className="message-content">
              {message.content
                .split("\n")
                .map((line, i) =>
                  line ? <p key={i}>{line}</p> : <br key={i} />
                )}
            </div>
            {message.role === "assistant" && (
              <button
                className="add-to-note-button"
                onClick={() => handleAddToNote(message.content)}
                title="Add to note"
              >
                +
              </button>
            )}
          </div>
        ))}
        {loading && (
          <div className="message assistant loading">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything about your note..."
          disabled={loading}
          rows={1}
          className="chat-input"
        ></textarea>
        <button
          className="send-button"
          onClick={handleSendMessage}
          disabled={loading || !inputMessage.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default AIChat;
