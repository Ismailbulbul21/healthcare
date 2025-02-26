import { motion } from 'framer-motion'

function Disclaimer() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4"
    >
      <p className="text-sm text-yellow-700">
        <strong>Important:</strong> This AI assistant provides general information only. 
        Always consult qualified healthcare professionals for medical advice, diagnosis, or treatment.
      </p>
    </motion.div>
  )
}

export default Disclaimer 