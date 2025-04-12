import axios from 'axios'

// We're using OpenRouter.ai API directly
const API_URL = 'https://openrouter.ai/api/v1/chat/completions'
// Hardcoded API key - in production, should be in environment variables
const API_KEY = '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'

// Function to detect if text is likely in Somali language
const isSomaliLanguage = (text) => {
    // Common Somali words and patterns
    const somaliIndicators = [
        'waa', 'ayaa', 'iyo', 'waxa', 'maxaa', 'sidee', 'maaha', 'haa', 'maya',
        'waxaan', 'waxaad', 'qofka', 'caafimaad', 'xanuun', 'dhakhtarka', 'isbitaalka',
        'daawo', 'buka', 'caabuqa', 'jirro', 'calool', 'madax', 'dhaawac'
    ];

    const somaliTextLower = text.toLowerCase();

    // Check if any Somali indicators are in the text
    return somaliIndicators.some(word =>
        somaliTextLower.includes(` ${word} `) ||
        somaliTextLower.startsWith(`${word} `) ||
        somaliTextLower.endsWith(` ${word}`) ||
        somaliTextLower === word
    );
}

// Fallback responses in case the API fails
const fallbackResponses = {
    english: [
        "I understand you may have health concerns, but I'm currently experiencing connectivity issues. Please try again in a few moments. Remember that for any medical emergency, you should contact healthcare professionals directly.",
        "I apologize, but I'm unable to connect to my knowledge base at the moment. For any urgent medical issues, please consult with a healthcare provider directly.",
        "Thanks for your question. Due to technical difficulties, I cannot provide a specific answer right now. For immediate health concerns, please reach out to your doctor or local healthcare facility.",
        "I'm having trouble accessing the latest medical information. For accurate health advice, please consult with qualified medical professionals.",
        "I apologize for the inconvenience, but my service is temporarily unavailable. For health questions, it's always best to consult with healthcare professionals."
    ],
    somali: [
        "Waan fahamsanahay inaad qabto walaac caafimaad, laakiin hadda waxaan la kulmayaa dhibaatooyin xiriir. Fadlan isku day daqiiqado yar kadib. Xasuuso in xaalad caafimaad oo degdeg ah, waa inaad si toos ah ula xiriirtaa xirfadlayaasha daryeelka caafimaadka.",
        "Waan ka xumahay, laakiin ma awoodid inaan ku xirnaado saldhigga aqoonteyda hadda. Arrimaha caafimaad ee degdega ah, fadlan la tasho bixiyaha daryeelka caafimaadka si toos ah.",
        "Waad ku mahadsan tahay su'aashaada. Sababtoo ah dhibaatooyinka farsamo, ma bixin karo jawaab gaar ah hadda. Wixii walaac caafimaad oo degdeg ah, fadlan kala xiriir dhakhtarkaaga ama xarunta daryeelka caafimaadka ee degaankaaga.",
        "Waxaan la kulmayaa dhibaato helitaanka macluumaadka caafimaadka ee ugu dambeeyay. Talo caafimaad oo sax ah, fadlan la tasho xirfadlayaasha caafimaadka.",
        "Waan ka xumahay carqaladaynta, laakiin adeegaygu wuu hakad galay si ku meel gaar ah. Su'aalaha caafimaadka, waa marka ugu wanaagsan in la tasho xirfadlayaasha daryeelka caafimaadka."
    ]
};

export const generateResponse = async (input) => {
    try {
        console.log('Preparing to send request to OpenRouter API')

        // Detect if the input is likely in Somali
        const isSomali = isSomaliLanguage(input);

        // Create system prompt based on language detection
        let systemPrompt;
        if (isSomali) {
            systemPrompt = 'Waxaad tahay kaalmiye caafimaad oo aqoon leh. Bixinta macluumaadka caafimaadka ee faa\'iido leh marwalba xasuusinta isticmaalayaasha inay la tashadaan xirfadlayaasha daryeelka caafimaadka si ay u helaan talo caafimaad oo gaar ah. Ka jawaab su\'aalaha luqadda Soomaaliga ah sida ugu macquulsan. Ku hay jawaabaha kooban oo ka fogee astaamaha qoraalkii markdown sida xiddigaha xoogga saarista.';
        } else {
            systemPrompt = 'You are a knowledgeable healthcare assistant. Provide helpful medical information while always reminding users to consult healthcare professionals for specific medical advice. Keep responses concise and avoid using markdown formatting like asterisks for emphasis. If the user asks in Somali, respond in Somali language.';
        }

        const payload = {
            model: 'deepseek/deepseek-chat-v3-0324:free',
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: input
                }
            ],
            temperature: 0.7,
            max_tokens: 800
        }

        console.log('Request payload:', JSON.stringify(payload))

        try {
            const response = await axios({
                method: 'post',
                url: API_URL,
                data: payload,
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'HealthChat',
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 15000 // 15 seconds timeout - reduced to fail faster
            })

            console.log('Response status:', response.status)

            if (response.data && response.data.choices && response.data.choices[0]) {
                console.log('Response received successfully')
                const responseContent = response.data.choices[0].message.content

                // Clean up any markdown or formatting that might be in the response
                const cleanResponse = responseContent
                    .replace(/\*\*/g, '') // Remove bold formatting
                    .replace(/\*/g, '')   // Remove italic formatting
                    .replace(/#/g, '')    // Remove header formatting

                return cleanResponse
            } else {
                console.error('Invalid response structure:', response.data)
                // Use fallback response instead of throwing error
                return getFallbackResponse(isSomali)
            }
        } catch (error) {
            console.error('API call failed, using fallback response')
            return getFallbackResponse(isSomali)
        }
    } catch (error) {
        console.error('Error in chat service:', error)

        // Use fallback for any error
        const isSomali = isSomaliLanguage(input)
        return getFallbackResponse(isSomali)
    }
}

// Helper function to get a random fallback response
const getFallbackResponse = (isSomali) => {
    const responseArray = isSomali ? fallbackResponses.somali : fallbackResponses.english
    const randomIndex = Math.floor(Math.random() * responseArray.length)
    return responseArray[randomIndex]
} 