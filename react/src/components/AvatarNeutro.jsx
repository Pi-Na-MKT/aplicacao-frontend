import React from 'react'

export default function AvatarNeutro({ className = 'w-8 h-8' }) {
  return (
    <div className={`${className} rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0`}>
      <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
      </svg>
    </div>
  )
}
