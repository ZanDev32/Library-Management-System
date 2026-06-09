import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { apiClient, setAuthCallbacks, setTokenGetter } from '../api/client'
import type { User } from '../types/auth'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, fullName: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const tokenRef = useRef<string | null>(null)

  // Wire the API client to read the current token and react to refresh events.
  useEffect(() => {
    setTokenGetter(() => tokenRef.current)
    setAuthCallbacks(
      () => {
        tokenRef.current = null
        setUser(null)
      },
      (token: string) => {
        tokenRef.current = token
      },
    )
  }, [])

  const fetchMe = async () => {
    const { data } = await apiClient.get<User>('/auth/me')
    setUser(data)
  }

  // Session restore on mount: try refresh first (uses httpOnly cookie).
  useEffect(() => {
    const restore = async () => {
      try {
        const { data } = await apiClient.post<{ access_token: string }>(
          '/auth/refresh',
        )
        tokenRef.current = data.access_token
        await fetchMe()
      } catch {
        tokenRef.current = null
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    restore()
  }, [])

  const login = async (email: string, password: string) => {
    const { data } = await apiClient.post<{ access_token: string }>(
      '/auth/login',
      { email, password },
    )
    tokenRef.current = data.access_token
    await fetchMe()
  }

  const register = async (
    email: string,
    password: string,
    fullName: string,
  ) => {
    await apiClient.post('/auth/register', {
      email,
      password,
      full_name: fullName,
    })
    // Do not auto-login; user proceeds to login page.
  }

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout')
    } finally {
      tokenRef.current = null
      setUser(null)
    }
  }

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (ctx === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
