"use client"
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';

const SQLGeminiChatBot = ({ 
  geminiApiKey="AIzaSyC_7f-RaoQxrE18hjiXdlCxkNHDrUJgKc0",
  sqlFilePath = "C://Users//91866//OneDrive//Documents//dumps//DumpMajorProject.sql"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sqlDump, setSqlDump] = useState('');
  const messagesEndRef = useRef(null);

  // Load SQL dump on component mount
  useEffect(() => {
    loadSQLDump();
  }, [sqlFilePath]);

  const loadSQLDump = async () => {
    try {
      const response = await fetch("http://localhost:4000/get-sql");
      if (!response.ok) throw new Error("Failed to load SQL file");
      const content = await response.text();
      setSqlDump(content);
    } catch (error) {
      console.error("Error loading SQL:", error);
    }
  };
  
  useEffect(() => {
    loadSQLDump();
  }, []);
  

  const queryGemini = async (userQuestion, sqlDumpContent) => {
    try {
      // Convert to string & clean unwanted characters
      const formattedQuestion = String(userQuestion).trim();
      const formattedSQL = String(sqlDumpContent).trim();
  
      const prompt = {
        contents: [
          { 
            role: "user", 
            parts: [{ 
              text: `
               You are a helpful assistant answering questions about data. 
              
              Important instructions:
              1. Be conversational and friendly in your responses
              2. Only include information that exists in the SQL data
              3. Format answers naturally as if talking to a user and non-technical manner.
              4. Don't mention SQL, tables, or technical terms
              5. If the question can't be answered from the data, say "I don't have that information"
              6. Keep responses concise and to the point
              7. Ignore internal fields such as id, timestamps, flags, or system-generated values unless specifically requested.
              8. If the user asks about a specific item, focus only on that item. Do not provide unrelated data.
              9. Keep responses short, clear, and relevant without unnecessary elaboration.
             10.never mention SQL, databases, tables, or any technical terms. Present the information as if it’s coming from a human assistant, not a database
              11.Provide only the information that matters to the user. Avoid redundant details.
              SQL Data:
              ${formattedSQL}
              
              User Question: 
              ${formattedQuestion}
              
              Please provide a natural, conversational response with only relevant information.
              ` 
            }] 
          }
        ]
      };
  
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(prompt)
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to get response from Gemini');
      }
  
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  };
  

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    if (!sqlDump) {
      setMessages(prev => [...prev, {
        text: "SQL dump hasn't been loaded yet. Please wait.",
        sender: 'bot',
        timestamp: new Date().toISOString()
      }]);
      return;
    }

    const newMessage = {
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await queryGemini(inputMessage, sqlDump);
      setMessages(prev => [...prev, {
        text: response,
        sender: 'bot',
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        text: `Error: ${error.message}. Please make sure your API key is correct and has necessary permissions.`,
        sender: 'bot',
        timestamp: new Date().toISOString()
      }]);
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg transition-all duration-200"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div className="bg-white rounded-lg shadow-xl w-80 md:w-96 flex flex-col h-[500px]">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="font-semibold text-lg">CHAT Assistant</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <pre className="whitespace-pre-wrap">{message.text}</pre>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3 text-gray-800">
                  Analyzing your question...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about your database..."
                className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SQLGeminiChatBot;