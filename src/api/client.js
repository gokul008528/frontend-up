/**
 * Client for your teammate's backend - used ONLY for image generation.
 * All auth (login, signup, Google, password reset) is handled entirely by
 * Firebase directly from the frontend (see context/AuthContext.jsx) - there
 * is no custom auth backend, and this file has no login/register/etc.
 *
 * Every request attaches a fresh Firebase ID token as a Bearer token. Your
 * teammate's backend should verify that token with the Firebase Admin SDK
 * (admin.auth().verifyIdToken(token)) rather than trusting any user info
 * sent in the request body - the token itself is the proof of identity.
 *
 * Expected backend contract (share with your teammate):
 *
 *  POST   /api/generations     (auth, JSON: prompt, style,
 *                               colorPalette, quality, variations) -> { generation }
 *  GET    /api/generations     (auth, ?page=&pageSize=)            -> { items: [generation], total }
 *  GET    /api/generations/:id (auth)                              -> { generation }
 *  DELETE /api/generations/:id (auth)                              -> 204
 *
 *  "auth" means: Authorization: Bearer <firebase ID token>
 *
 *  generation shape:
 *  {
 *    id, status: 'queued'|'processing'|'complete'|'failed',
 *    prompt, style, colorPalette, quality,
 *    results: [{ id, imageUrl, thumbUrl }],
 *    createdAt
 *  }
 */
import { firebaseAuth } from './firebase'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.status = status
    this.data = data
  }
}

async function getAuthHeader() {
  const user = firebaseAuth?.currentUser
  if (!user) return {}
  const token = await user.getIdToken()
  return { Authorization: `Bearer ${token}` }
}

async function request(path, { method = 'GET', body, isMultipart = false } = {}) {
  const headers = await getAuthHeader()
  if (!isMultipart) headers['Content-Type'] = 'application/json'

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: isMultipart ? body : body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 204) return null

  let data = null
  try {
    data = await res.json()
  } catch {
    // no body
  }

  if (!res.ok) {
    const message = data?.message || data?.error || `Request failed (${res.status})`
    throw new ApiError(message, res.status, data)
  }

  return data
}

export const generationApi = {
  create: ({ prompt, style, colorPalette, quality, variations }) =>
    request('/generations', {
      method: 'POST',
      body: { prompt, style, colorPalette, quality, variations },
    }),
  list: (page = 1, pageSize = 12) => request(`/generations?page=${page}&pageSize=${pageSize}`),
  get: (id) => request(`/generations/${id}`),
  remove: (id) => request(`/generations/${id}`, { method: 'DELETE' }),
}

export { ApiError, API_BASE_URL }