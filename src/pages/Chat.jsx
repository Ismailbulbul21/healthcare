import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateResponse } from '../services/chatService'
import { useMessageHistory } from '../hooks/useMessageHistory'
import LoadingDots from '../components/LoadingDots'
import Disclaimer from '../components/Disclaimer'

function Chat() {
  const [messages, setMessages] = useMessageHistory([
    {
      text: "Hello! I'm your healthcare assistant. How can I help you today?",
      sender: 'bot'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = { text: input, sender: 'user' }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await generateResponse(input)
      const botMessage = {
        text: response,
        sender: 'bot'
      }
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = {
        text: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        sender: 'bot'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto p-4 h-screen pt-20 pb-10"
    >
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl h-full flex flex-col overflow-hidden border border-gray-100">
        <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <h2 className="text-2xl font-bold">Healthcare Assistant</h2>
          <p className="text-sm opacity-90">Ask me anything about health and medical topics</p>
        </div>

        <Disclaimer />
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>
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
              <div className="bg-gray-100 rounded-2xl">
                <LoadingDots />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="p-6 border-t bg-white/50">
          <div className="flex space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 border border-gray-200 rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
              placeholder="Type your health-related question..."
              disabled={loading}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className={`px-8 py-3 rounded-full text-white ${
                loading
                  ? 'bg-gray-400'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg'
              }`}
              disabled={loading}
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