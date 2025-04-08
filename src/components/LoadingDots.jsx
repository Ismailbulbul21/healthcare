import { motion } from 'framer-motion'

function LoadingDots() {
  return (
    <div className="flex items-center justify-center p-2">
      <div className="flex space-x-2">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: index * 0.2,
              ease: 'easeInOut'
            }}
            className="w-3 h-3 bg-blue-600 rounded-full"
          />
        ))}
      </div>
      <span className="ml-3 text-gray-600 text-sm">Thinking...</span>
    </div>
  )
}

export default LoadingDots 