import { Form, NavLink } from '@remix-run/react'
import { useEffect, useRef, useState } from 'react'
import pkg from '../../package.json'

type AccessLevel = 'superadmin' | 'admin' | 'cleaner' | 'none'

type MenuItem = {
  to: string
  label: string
  allowedFor: AccessLevel[]
}

const MENU_ITEMS: MenuItem[] = [
  { to: '/dashboard', label: 'Overview', allowedFor: ['admin', 'superadmin'] },
  { to: '/cleaners', label: 'Cleaners', allowedFor: ['admin', 'superadmin'] },
  { to: '/jobs', label: 'Jobs', allowedFor: ['admin', 'superadmin'] },
  { to: '/assignments', label: 'Schedule', allowedFor: ['admin', 'superadmin'] }
]

export function NavBar({
  user,
  title = 'Cleaning Scheduler',
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

  const visibleMenuItems = MENU_ITEMS.filter((item) => item.allowedFor.includes(access))

  return (
    <div className="bg-gray-800 text-white relative shadow">
      <span className="absolute top-1 right-2 text-[10px] text-gray-400 select-none pointer-events-none">
        v{pkg.version}
      </span>

      <div className="h-24 flex items-center justify-center">
        <h1 className="text-3xl font-semibold tracking-wide">{title}</h1>
      </div>

      <div className="bg-gray-700 px-6 py-2 flex items-center justify-between border-t border-gray-600">
        <div className="flex space-x-6 text-sm font-semibold">
          {visibleMenuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              prefetch="intent"
              className={({ isActive }) =>
                `uppercase tracking-wide transition-colors ${
                  isActive ? 'text-white border-b-2 border-indigo-400 pb-1' : 'text-gray-300 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="relative" ref={dropdownRef}>
          <div
            className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center cursor-pointer"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
          >
            <span className="text-white text-sm font-bold">{initials}</span>
          </div>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 min-w-48 bg-white text-black rounded shadow-md z-10 whitespace-nowrap">
              <div className="px-4 py-3 text-sm border-b border-gray-200">{user.email}</div>
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
