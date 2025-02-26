import { useState, useEffect } from 'react'

export function useMessageHistory(initialMessages) {
    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem('chatHistory')
        return saved ? JSON.parse(saved) : initialMessages
    })

    useEffect(() => {
        localStorage.setItem('chatHistory', JSON.stringify(messages))
    }, [messages])

    return [messages, setMessages]
} 