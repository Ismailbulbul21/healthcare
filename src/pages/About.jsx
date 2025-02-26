import { motion } from 'framer-motion'

function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About HealthChat</h1>
        <p className="text-xl text-gray-600">Making healthcare guidance accessible to everyone</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Our Mission</h2>
          <p className="text-gray-600">
            HealthChat aims to provide accessible, reliable healthcare information through
            advanced AI technology. We bridge the gap between medical knowledge and everyday
            health questions.
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">What We Offer</h2>
          <ul className="space-y-4 text-gray-600">
            <li>✓ 24/7 AI-powered health assistance</li>
            <li>✓ Evidence-based medical information</li>
            <li>✓ User-friendly interface</li>
            <li>✓ Privacy-focused platform</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default About 