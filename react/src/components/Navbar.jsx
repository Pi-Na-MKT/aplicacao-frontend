import React from 'react'

const Navbar = ({ 
  searchPlaceholder = 'Buscar empresas...', 
  showExtra = false 
}) => {
  return (
    <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-8">
        <span className="text-xl font-bold text-primary tracking-tight">PiNa</span>
      </div>

      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <img
          src="https://i.pravatar.cc/32?img=5"
          className="w-9 h-9 rounded-full border-2 border-gray-200 object-cover cursor-pointer"
          alt="profile"
        />
      </div>
    </header>
  )
}

export default Navbar
