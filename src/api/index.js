/**
 * Single import point for generation calls. Auth never goes through here -
 * components import useAuth from context/AuthContext.jsx directly, since
 * Firebase itself is the auth backend in every environment.
 */
import { generationApi as realGenerationApi } from './client'
import { mockGenerationApi } from './mockClient'

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true'

export const generationApi = USE_MOCK ? mockGenerationApi : realGenerationApi
export { USE_MOCK }
