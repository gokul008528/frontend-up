/**
 * In-memory mock of the teammate's generation backend, used only when
 * VITE_USE_MOCK_API=true (see .env.example). Lets Studio/History be
 * developed and demoed before that backend is wired up. Auth is entirely
 * Firebase (see context/AuthContext.jsx) and is never mocked - Firebase
 * itself is the real thing in every environment, dev included.
 */

const MOCK_DELAY = 300

const SAMPLE_RESULTS = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80',
  'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&q=80',
  'https://images.unsplash.com/photo-1517849845537-4d257902861a?w=800&q=80',
  'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800&q=80',
]

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function loadGenerations() {
  return JSON.parse(localStorage.getItem('mock_generations') || '[]')
}
function saveGenerations(gens) {
  localStorage.setItem('mock_generations', JSON.stringify(gens))
}
function fakeId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now()}`
}

export const mockGenerationApi = {
  async create({ prompt, style, colorPalette, quality, variations }) {
    await delay(1800)
    const gens = loadGenerations()
    const count = Number(variations) || 2
    const generation = {
      id: fakeId('gen'),
      status: 'complete',
      prompt,
      style,
      colorPalette,
      quality,
      createdAt: new Date().toISOString(),
      results: Array.from({ length: count }, (_, i) => ({
        id: fakeId('res'),
        imageUrl: SAMPLE_RESULTS[(gens.length + i) % SAMPLE_RESULTS.length],
        thumbUrl: SAMPLE_RESULTS[(gens.length + i) % SAMPLE_RESULTS.length],
      })),
    }
    gens.unshift(generation)
    saveGenerations(gens)
    return { generation }
  },

  async list(page = 1, pageSize = 12) {
    await delay(MOCK_DELAY)
    const gens = loadGenerations()
    const start = (page - 1) * pageSize
    return { items: gens.slice(start, start + pageSize), total: gens.length }
  },

  async get(id) {
    await delay(MOCK_DELAY)
    const gens = loadGenerations()
    const generation = gens.find((g) => g.id === id)
    if (!generation) {
      const err = new Error('Generation not found')
      err.status = 404
      throw err
    }
    return { generation }
  },

  async remove(id) {
    await delay(MOCK_DELAY)
    const gens = loadGenerations().filter((g) => g.id !== id)
    saveGenerations(gens)
    return null
  },
}