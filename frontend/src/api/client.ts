import axios from 'axios'

// Defaults work out of the box with the bundled docker-compose setup.
const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
const apiKey = import.meta.env.VITE_API_KEY ?? 'dev-local-key-change-me'

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': apiKey,
  },
})

/** Extract a readable message from an Axios/FastAPI error. */
export function errorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0]
      const loc = Array.isArray(first?.loc) ? first.loc.slice(1).join('.') : ''
      return [loc, first?.msg].filter(Boolean).join(': ') || fallback
    }
    return error.message || fallback
  }
  return fallback
}
