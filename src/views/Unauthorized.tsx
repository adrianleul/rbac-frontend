import React from 'react'
import { Link } from 'react-router-dom'

const Unauthorized: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen text-center bg-gray-100">
      <div>
        <h1 className="text-6xl font-bold mb-4">401</h1>
        <p className="text-lg mb-6">Unauthorized access</p>
        <Link to="/" className="btn-primary">
          Go to Home
        </Link>
      </div>
    </div>
  )
}

export default Unauthorized
