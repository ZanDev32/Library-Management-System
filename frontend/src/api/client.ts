import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const apiClient = axios.create({
  baseURL,
  withCredentials: true, // send/receive httpOnly refresh cookie
})

// Token accessor injected by AuthContext to avoid circular imports.
let tokenGetter: () => string | null = () => null
let onRefreshFail: () => void = () => {}
let onTokenRefreshed: (token: string) => void = () => {}

export function setTokenGetter(getter: () => string | null) {
  tokenGetter = getter
}

export function setAuthCallbacks(
  refreshFail: () => void,
  tokenRefreshed: (token: string) => void,
) {
  onRefreshFail = refreshFail
  onTokenRefreshed = tokenRefreshed
}

// Attach Bearer token to every request.
apiClient.interceptors.request.use((config) => {
  const token = tokenGetter()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// On 401, attempt one refresh then retry.
interface RetriableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableRequest | undefined

    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !original.url?.includes('/auth/refresh') &&
      !original.url?.includes('/auth/login')
    ) {
      original._retry = true
      try {
        const { data } = await apiClient.post<{ access_token: string }>(
          '/auth/refresh',
        )
        onTokenRefreshed(data.access_token)
        original.headers.Authorization = `Bearer ${data.access_token}`
        return apiClient(original)
      } catch {
        onRefreshFail()
        throw error
      }
    }

    throw error
  },
)
