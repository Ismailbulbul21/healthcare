import { useState, useEffect } from 'react'

export function useMessageHistory(initialMessages = []) {
    const [messages, setMessages] = useState(initialMessages)
    const [userId, setUserId] = useState(null)

    // Load user ID and their messages when component mounts
    useEffect(() => {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            const userData = JSON.parse(storedUser)
            setUserId(userData.uid)

            // Load user-specific messages from localStorage
            const userMessages = localStorage.getItem(`chat_messages_${userData.uid}`)
            if (userMessages) {
                setMessages(JSON.parse(userMessages))
            }
        }
    }, [])

    // Custom setter that updates both state and localStorage
    const updateMessages = (newMessages) => {
        if (typeof newMessages === 'function') {
            setMessages(prevMessages => {
                const updatedMessages = newMessages(prevMessages)
                if (userId) {
                    localStorage.setItem(`chat_messages_${userId}`, JSON.stringify(updatedMessages))
                }
                return updatedMessages
            })
        } else {
            setMessages(newMessages)
            if (userId) {
                localStorage.setItem(`chat_messages_${userId}`, JSON.stringify(newMessages))
            }
        }
    }

    return [messages, updateMessages]
} 