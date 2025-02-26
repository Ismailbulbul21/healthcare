import axios from 'axios'

const API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY

export const generateResponse = async (input) => {
    try {
        const response = await axios.post(
            API_URL,
            {
                model: 'deepseek/deepseek-r1:free',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a knowledgeable healthcare assistant. Provide helpful medical information while always reminding users to consult healthcare professionals for specific medical advice.'
                    },
                    {
                        role: 'user',
                        content: input
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000
            },
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'HTTP-Referer': window.location.href, // Required by OpenRouter
                    'X-Title': 'Healthcare Assistant', // Optional - your app's name
                    'Content-Type': 'application/json'
                }
            }
        )

        if (response.data && response.data.choices && response.data.choices[0]) {
            return response.data.choices[0].message.content
        }

        throw new Error('No response from bot')
    } catch (error) {
        console.error('Error calling OpenRouter API:', error.response?.data || error.message)
        if (error.response?.status === 401) {
            return "Authentication error. Please check the API key."
        }
        if (error.response?.status === 429) {
            return "Too many requests. Please wait a moment and try again."
        }
        return "I apologize, but I'm having trouble connecting right now. Please try again in a moment."
    }
} 