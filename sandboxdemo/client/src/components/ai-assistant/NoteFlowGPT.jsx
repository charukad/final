import React, { useState, useEffect, useRef } from "react";
import { chatWithMultimodal, processMultimodal } from "../../services/multimodalService";

// Pre-defined function options
const AI_FUNCTIONS = [
  { id: 'summarize', name: 'Summarize', description: 'Summarize the current note' },
  { id: 'improve', name: 'Improve Writing', description: 'Improve grammar and clarity' },
  { id: 'expand', name: 'Expand', description: 'Expand on your ideas or topics' },
  { id: 'visualize', name: 'Visualize', description: 'Create a visualization from data' },
  { id: 'analyze', name: 'Analyze', description: 'Analyze the content structure and topics' },
  { id: 'brainstorm', name: 'Brainstorm', description: 'Generate related ideas' }
];

const NoteFlowGPT = ({ noteContent, onAddToNote, onClose }) => {
  // Chat history - array of chat sessions
  const [chatHistory, setChatHistory] = useState([
    {
      id: 'default',
      name: 'New chat',
      messages: [
        {
          role: "assistant",
          content: "👋 ! I'm NoteFlow+, your AI assistant. I can help you brainstorm ideas, improve your writing, or answer questions about your notes.",
          isWelcome: true
        }
      ],
      createdAt: new Date().toISOString()
    }
  ]);
  
  // Current active chat ID
  const [activeChatId, setActiveChatId] = useState('default');
  
  // UI states
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showChatList, setShowChatList] = useState(false);
  const [showFunctionMenu, setShowFunctionMenu] = useState(false);
  const [isRenamingChat, setIsRenamingChat] = useState(false);
  const [newChatName, setNewChatName] = useState("");
  
  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatNameInputRef = useRef(null);

  // Active chat session
  const activeChat = chatHistory.find(chat => chat.id === activeChatId) || chatHistory[0];
  
  // Get messages from active chat
  const messages = activeChat.messages;

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showChatList]);

  // Focus input on load and when changing chats
  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
  }, [activeChatId]);
  
  // Focus chat name input when renaming
  useEffect(() => {
    if (isRenamingChat) {
      setTimeout(() => {
        chatNameInputRef.current?.focus();
      }, 100);
    }
  }, [isRenamingChat]);

  // Create a new chat
  const createNewChat = () => {
    const newChatId = `chat-${Date.now()}`;
    const newChat = {
      id: newChatId,
      name: `Chat ${chatHistory.length + 1}`,
      messages: [
        {
          role: "assistant",
          content: "👋 Starting a new conversation. I'm NoteFlow+. How can I help you today?",
          isWelcome: true
        }
      ],
      createdAt: new Date().toISOString()
    };
    
    setChatHistory(prev => [...prev, newChat]);
    setActiveChatId(newChatId);
    setShowChatList(false);
  };
  
  // Delete a chat
  const deleteChat = (chatId) => {
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
    
    // If deleting active chat, switch to the first available chat
    if (chatId === activeChatId) {
      const remainingChats = chatHistory.filter(chat => chat.id !== chatId);
      if (remainingChats.length > 0) {
        setActiveChatId(remainingChats[0].id);
      } else {
        // Create a new default chat if all are deleted
        createNewChat();
      }
    }
  };
  
  // Start renaming chat
  const startRenameChat = () => {
    setNewChatName(activeChat.name);
    setIsRenamingChat(true);
  };
  
  // Confirm rename chat
  const confirmRenameChat = () => {
    if (newChatName.trim()) {
      setChatHistory(prev => 
        prev.map(chat => 
          chat.id === activeChatId 
            ? { ...chat, name: newChatName.trim() } 
            : chat
        )
      );
    }
    setIsRenamingChat(false);
  };

  // Execute AI function
  const executeFunction = async (functionId) => {
    const selectedFunction = AI_FUNCTIONS.find(fn => fn.id === functionId);
    if (!selectedFunction) return;
    
    // Create user message for function
    const userMessage = { 
      role: "user", 
      content: `Please ${selectedFunction.name.toLowerCase()} my note.`
    };
    
    // Add message to current chat
    addMessageToChat(activeChatId, userMessage);
    setLoading(true);
    setShowFunctionMenu(false);
    
    try {
      // Check if note is empty
      if (!noteContent || noteContent.trim() === '') {
        const response = { 
          role: "assistant", 
          content: "Your note appears to be empty. Please add some content first."
        };
        
        addMessageToChat(activeChatId, response);
        setLoading(false);
        return;
      }
      
      // Build appropriate prompt based on function
      let prompt = "";
      
      switch(functionId) {
        case 'summarize':
          prompt = `Summarize the following text concisely: ${noteContent}`;
          break;
        case 'improve':
          prompt = `Improve the grammar, clarity, and style of the following text: ${noteContent}`;
          break;
        case 'expand':
          prompt = `Expand on the ideas and topics in the following note with additional details and perspectives: ${noteContent}`;
          break;
        case 'visualize':
          prompt = `Create a visualization from this data: ${noteContent}`;
          break;
        case 'analyze':
          prompt = `Analyze the structure, themes, and content of the following note: ${noteContent}`;
          break;
        case 'brainstorm':
          prompt = `Brainstorm related ideas and concepts based on this note: ${noteContent}`;
          break;
        default:
          prompt = `Help me with the following note: ${noteContent}`;
      }
      
      // Call multimodal API
      const result = await processMultimodal(prompt);
      
      // Handle different response types
      let response;
      if (result.response_type === 'image') {
        response = { 
          role: "assistant", 
          content: `<img src="${result.content}" alt="Generated visualization" style="max-width: 100%; border-radius: 8px;" />`,
          isHtml: true
        };
      } else {
        response = { 
          role: "assistant", 
          content: result.content || "I'm sorry, I couldn't process that request."
        };
      }
      
      // Add response to chat
      addMessageToChat(activeChatId, response);
    } catch (error) {
      console.error("Error executing function:", error);
      const errorMessage = { 
        role: "assistant", 
        content: "I'm sorry, I encountered an error processing your request. Please check if the multimodal service is running at http://localhost:8000."
      };
      addMessageToChat(activeChatId, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Add message to a specific chat
  const addMessageToChat = (chatId, message) => {
    setChatHistory(prev => 
      prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, messages: [...chat.messages, message] } 
          : chat
      )
    );
  };

  // Send message to AI
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message to active chat
    const userMessage = { role: "user", content: inputMessage };
    addMessageToChat(activeChatId, userMessage);
    setInputMessage("");
    setLoading(true);

    try {
      // Get all messages for context
      const messageHistory = activeChat.messages;
      
      // Send to multimodal API
      const response = await chatWithMultimodal([...messageHistory, userMessage], noteContent);
      
      // Add AI response to active chat
      addMessageToChat(activeChatId, response);
    } catch (error) {
      console.error("Error in NoteFlow GPT chat:", error);
      const errorMessage = { 
        role: "assistant", 
        content: "I'm sorry, I encountered an error. Please check if the multimodal service is running at http://localhost:8000."
      };
      addMessageToChat(activeChatId, errorMessage);
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

  // Auto-resize textarea
  const handleInput = (e) => {
    const target = e.target;
    setInputMessage(target.value);
    
    // Reset height to auto to properly calculate new height
    target.style.height = "24px";
    
    // Set new height based on scrollHeight (capped at 120px)
    const newHeight = Math.min(target.scrollHeight, 120);
    target.style.height = `${newHeight}px`;
  };

  // Add response to note
  const handleAddToNote = (messageContent) => {
    if (onAddToNote) {
      onAddToNote(messageContent);
    }
  };

  // Format date for chat list
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="noteflow-gpt-panel">
      <div className="panel-header">
        <div className="header-left">
          <button className="chat-menu-button" onClick={() => setShowChatList(!showChatList)}>
            {showChatList ? "×" : "≡"}
          </button>
          
          {isRenamingChat ? (
            <div className="rename-chat-input">
              <input
                ref={chatNameInputRef}
                type="text"
                value={newChatName}
                onChange={(e) => setNewChatName(e.target.value)}
                onBlur={confirmRenameChat}
                onKeyPress={(e) => e.key === "Enter" && confirmRenameChat()}
              />
            </div>
          ) : (
            <h3 onClick={startRenameChat}>{activeChat.name}</h3>
          )}
        </div>
        
        <div className="header-right">
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
      </div>

      {showChatList && (
        <div className="chat-list-container">
          <div className="chat-list-header">
            <h4>Your Conversations</h4>
            <button className="new-chat-button" onClick={createNewChat}>
              + New Chat
            </button>
          </div>
          
          <div className="chat-list">
            {chatHistory.map(chat => (
              <div 
                key={chat.id} 
                className={`chat-item ${chat.id === activeChatId ? 'active' : ''}`}
                onClick={() => {
                  setActiveChatId(chat.id);
                  setShowChatList(false);
                }}
              >
                <div className="chat-item-info">
                  <span className="chat-item-name">{chat.name}</span>
                  <span className="chat-item-date">{formatDate(chat.createdAt)}</span>
                </div>
                <button 
                  className="delete-chat-button"
                  onClick={(e) => {
                    e.stopPropagation(); 
                    deleteChat(chat.id);
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="noteflow-chat">
        <div className="chat-messages">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.role} ${message.isWelcome ? 'welcome' : ''}`}>
              <div className="message-content">
                {message.isHtml ? (
                  <div dangerouslySetInnerHTML={{ __html: message.content }} />
                ) : (
                  message.content
                    .split("\n")
                    .map((line, i) =>
                      line ? <p key={i}>{line}</p> : <br key={i} />
                    )
                )}
              </div>
              {message.role === "assistant" && !loading && (
                <button
                  className="add-to-note-button"
                  onClick={() => handleAddToNote(message.isHtml ? message.content : message.content)}
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

        <div className="function-menu-container">
          {showFunctionMenu && (
            <div className="function-menu">
              {AI_FUNCTIONS.map(fn => (
                <button 
                  key={fn.id} 
                  className="function-button"
                  onClick={() => executeFunction(fn.id)}
                  title={fn.description}
                >
                  {fn.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="chat-input-area">
          <button 
            className="functions-toggle-button" 
            onClick={() => setShowFunctionMenu(!showFunctionMenu)}
            title="Show AI functions"
          >
            <span className="function-icon">⌘</span>
          </button>
          
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={handleInput}
            onKeyPress={handleKeyPress}
            placeholder="Ask NoteFlow GPT anything..."
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
    </div>
  );
};

export default NoteFlowGPT; 