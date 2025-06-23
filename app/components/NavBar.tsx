import { Form, NavLink } from '@remix-run/react'
import { useEffect, useRef, useState } from 'react'
import pkg from '../../package.json'

type AccessLevel = 'superadmin' | 'admin' | 'cleaner' | 'none'

export function NavBar({
  user,
  title = 'Sample Application',
  access = 'admin'
}: {
  user: { name?: string; email?: string }
  title?: string
  access?: AccessLevel
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const displayName = user.name || user.email || 'User'
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="bg-gray-800 text-white relative">
      {/* Tiny version number */}
      <span className="absolute top-1 right-2 text-[10px] text-gray-400 select-none pointer-events-none">
        v{pkg.version}
      </span>

      {/* Title bar */}
      <div className="h-28 flex items-center justify-center">
        <h1 className="text-4xl font-bold">{title}</h1>
      </div>

      {/* Menu bar and profile */}
      <div className="bg-gray-700 px-6 py-1 flex items-center justify-between border-t border-gray-700">
        {/* Conditional menu items */}
        <div className="flex space-x-6 text-sm font-semibold"></div>

        {/* Profile dropdown always visible */}
        <div className="relative" ref={dropdownRef}>
          <div
            className="w-7 h-7 bg-indigo-500 rounded-full flex items-center justify-center cursor-pointer"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
          >
            <span className="text-white font-bold">{initials}</span>
          </div>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 min-w-48 bg-white text-black rounded shadow-md z-10 whitespace-nowrap">
              <div className="px-4 py-3 text-sm border-b border-gray-300">{user.email}</div>
              <Form method="post" action="/auth/logout">
                <button type="submit" className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">
                  Logout
                </button>
              </Form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
