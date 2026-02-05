import React from 'react'
import { Link } from 'react-router-dom'

const NotFound: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen text-center bg-gray-100">
      <div>
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-lg mb-6">Page not found</p>
        <Link to="/" className="btn-primary">
          Back to Home
        </Link>
      </div>
    </div>
  )
}

export default NotFound
