'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'

export default function LoginPage() {
  const router                        = useRouter()
  const [error,       setError]       = useState('')
  const [loading,     setLoading]     = useState(false)
  const [showPass,    setShowPass]    = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const form     = new FormData(e.currentTarget)
    const username = form.get('username') as string
    const password = form.get('password') as string

    const res = await signIn('credentials', { username, password, redirect: false })

    if (res?.ok) {
      router.push('/')
    } else {
      setError('Invalid credentials')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-5" style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #000 100%)' }}>
      <div className="w-full max-w-[420px]">
        {/* Card */}
        <div className="rounded-2xl p-12 border border-gray-800" style={{ background: '#0a0a0a', boxShadow: '0 8px 32px rgba(255,255,255,0.04)' }}>
          {/* Logo + title */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center p-2 mb-5">
              <Image
                src="https://api.vdthomes.com/storage/v1/object/public/branding_assets/logos/blank_on_transparent.png"
                alt="VDT Homes"
                width={48}
                height={48}
                className="object-contain"
                unoptimized
              />
            </div>
            <h1 className="text-[28px] font-bold text-white tracking-tight">Tech Dashboard</h1>
            <p className="text-gray-400 text-[15px] mt-2">Sign in to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="px-4 py-3 rounded-lg text-sm border" style={{ background: '#2a1a1a', color: '#ff4444', borderColor: '#3a1a1a' }}>
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-300">Username</label>
              <input
                name="username"
                type="text"
                required
                autoComplete="username"
                className="w-full px-4 py-3 rounded-lg text-[15px] text-white border border-gray-800 focus:outline-none focus:border-gray-600 transition-colors"
                style={{ background: '#000' }}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-300">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-12 rounded-lg text-[15px] text-white border border-gray-800 focus:outline-none focus:border-gray-600 transition-colors"
                  style={{ background: '#000' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-lg text-[15px] font-semibold transition-opacity disabled:opacity-50"
              style={{ background: '#fff', color: '#000', cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
