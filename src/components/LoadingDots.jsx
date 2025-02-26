import { motion } from 'framer-motion'

function LoadingDots() {
  return (
    <div className="flex space-x-2 p-3">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-blue-600 rounded-full"
          animate={{
            y: ["0%", "-50%", "0%"]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </div>
  )
}

export default LoadingDots 