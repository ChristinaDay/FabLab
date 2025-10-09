'use client'

import { useState } from 'react'
import { 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  DocumentDuplicateIcon,
  ArrowTopRightOnSquareIcon 
} from '@heroicons/react/24/outline'

interface ApiSetupGuideProps {
  isVisible: boolean
  onClose: () => void
}

export default function ApiSetupGuide({ isVisible, onClose }: ApiSetupGuideProps) {
  const [copied, setCopied] = useState(false)

  const envContent = `# RapidAPI Configuration for JSearch
RAPIDAPI_KEY=your_rapidapi_key_here
RAPIDAPI_HOST=jsearch.p.rapidapi.com

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Updrift`

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(envContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <ExclamationTriangleIcon className="w-8 h-8 text-yellow-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Set Up Real Job Data
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            <p className="text-gray-600">
              You're currently viewing demo data. Follow these steps to connect real job listings from 50+ job boards including LinkedIn, Indeed, and Glassdoor.
            </p>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Sign up for RapidAPI</h3>
                  <p className="text-sm text-gray-600">Create a free account to access the JSearch API</p>
                  <a
                    href="https://rapidapi.com/letscrape-6b082d6c-6d1b-4be1-8d2e-a1f6b4c8b5c5/api/jsearch"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm mt-1"
                  >
                    Open JSearch API
                    <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1" />
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Subscribe to Free Plan</h3>
                  <p className="text-sm text-gray-600">Get 500 free API requests per month</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Create .env.local file</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Create this file in your project root and add your API key:
                  </p>
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                      {envContent}
                    </pre>
                    <button
                      onClick={handleCopyEnv}
                      className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white p-1 rounded"
                      title="Copy to clipboard"
                    >
                      {copied ? (
                        <CheckCircleIcon className="w-4 h-4" />
                      ) : (
                        <DocumentDuplicateIcon className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  4
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Restart your server</h3>
                  <p className="text-sm text-gray-600">Stop and restart your development server to load the new environment variables</p>
                  <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm mt-1 inline-block">
                    npm run dev
                  </code>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">What you'll get:</h4>
                  <ul className="text-sm text-green-800 mt-1 space-y-1">
                    <li>• Real job listings from 50+ job boards</li>
                    <li>• LinkedIn, Indeed, Glassdoor, and more</li>
                    <li>• Fresh data updated daily</li>
                    <li>• Salary information and company details</li>
                    <li>• 500 free searches per month</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              I'll do this later
            </button>
            <a
              href="https://rapidapi.com/letscrape-6b082d6c-6d1b-4be1-8d2e-a1f6b4c8b5c5/api/jsearch"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Get API Key
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 