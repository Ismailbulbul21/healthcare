import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateResponse } from '../services/chatService'
import { useMessageHistory } from '../hooks/useMessageHistory'
import LoadingDots from '../components/LoadingDots'

function Chat() {
  const [user, setUser] = useState(null)
  const [messages, setMessages] = useMessageHistory([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUser(userData)
      
      // Set initial greeting if we have no messages yet
      if (messages.length === 0) {
        const userName = userData.displayName || 'there'
        setMessages([{
          text: `Hello ${userName}! I'm your healthcare assistant. How can I help you today?\n\nSalaan! Waxaan ahay caawiyahaaga daryeelka caafimaadka. Sideen kugu caawin karaa maanta?`,
          sender: 'bot',
          timestamp: new Date().toISOString()
        }])
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const processMessage = async (inputText) => {
    if (!inputText.trim()) return

    const userMessage = { 
      sender: 'user', 
      text: inputText,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, userMessage])
    
    setInput('')
    setLoading(true)

    try {
      const response = await generateResponse(inputText)
      
      // Clean up any markdown or formatting from the response
      const cleanedResponse = response.replace(/\*\*/g, '').replace(/\*/g, '')
      const botMessage = { 
        sender: 'bot', 
        text: cleanedResponse,
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Error in chat:', error)
      // If there's still an error after our fallback mechanism
      const errorMessage = { 
        sender: 'bot', 
        text: "I'm sorry, I encountered an unexpected issue. Please try again in a few moments.",
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await processMessage(input)
  }
  
  const clearChatHistory = () => {
    if (window.confirm('Are you sure you want to clear your chat history?')) {
      const userName = user?.displayName || 'there'
      setMessages([{
        text: `Hello ${userName}! I'm your healthcare assistant. How can I help you today?\n\nSalaan! Waxaan ahay caawiyahaaga daryeelka caafimaadka. Sideen kugu caawin karaa maanta?`,
        sender: 'bot',
        timestamp: new Date().toISOString()
      }])
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-4 h-[92vh] pt-20 pb-10"
    >
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl h-full flex flex-col overflow-hidden border border-gray-200">
        <div className="p-6 border-b bg-gradient-to-r from-blue-700 to-indigo-800">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-bold">Healthcare Assistant</h2>
              <p className="text-sm opacity-90">English & Somali / Af-Ingiriisi & Af-Soomaali</p>
            </div>
            {user && (
              <div className="ml-auto flex items-center space-x-4">
                <div className="bg-white/10 px-4 py-2 rounded-full text-white text-sm">
                  Logged in as {user.displayName || user.email}
                </div>
                <button
                  onClick={clearChatHistory}
                  className="bg-white/10 hover:bg-white/20 text-white text-sm px-3 py-2 rounded-full transition-colors"
                  title="Clear chat history"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-8 py-8 space-y-8 scroll-smooth bg-gradient-to-b from-gray-50 to-white"
        >
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-6 shadow-md ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed text-base">{message.text}</p>
                  <div className={`text-xs mt-3 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                    {message.timestamp 
                      ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
                <LoadingDots />
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <form 
          onSubmit={handleSubmit} 
          className="p-6 border-t border-gray-100 bg-white shadow-lg"
        >
          <div className="flex gap-4 max-w-6xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question in English or Somali (Su'aashaada ku qor Af-Ingiriisi ama Af-Soomaali)..."
              className="flex-1 rounded-xl border border-gray-300 p-5 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-all bg-white text-base shadow-sm"
              disabled={loading}
            />
            <motion.button
              type="submit"
              disabled={loading || !input.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-10 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all text-base"
            >
              Send
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}

export default Chat 