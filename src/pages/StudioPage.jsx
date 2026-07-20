import { useState } from 'react'
import { generationApi } from '../api'
import GenerationControls from '../components/GenerationControls'
import ResultsGrid from '../components/ResultsGrid'

const MAX_PROMPT_LENGTH = 500

export default function StudioPage() {
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('photoreal')
  const [colorPalette, setColorPalette] = useState('natural')
  const [quality, setQuality] = useState('standard')
  const [variations, setVariations] = useState(2)

  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [generation, setGeneration] = useState(null)

  async function handleGenerate() {
    if (!prompt.trim()) {
      setError('Describe what you want to generate first.')
      return
    }
    setError(null)
    setIsGenerating(true)
    setGeneration(null)
    try {
      const { generation } = await generationApi.create({
        prompt: prompt.trim(),
        style,
        colorPalette,
        quality,
        variations,
      })
      setGeneration(generation)
    } catch (err) {
      setError(err.message || 'Generation failed. Try again in a moment.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-10">
        <span className="font-mono text-xs uppercase tracking-wider text-marker">Studio</span>
        <h1 className="mt-2 font-display text-3xl font-semibold text-chalk">Describe it, generate it</h1>
        <p className="mt-2 max-w-xl text-graphite">
          Type what you want to see, pick a direction, and generate photoreal variations - no sketch or upload
          needed.
        </p>
      </div>

      {/* Prompt input - replaces the old Draw/Upload sketch area */}
      <div className="mb-8">
        <label className="flex flex-col gap-2">
          <span className="font-mono text-xs text-graphite">Prompt</span>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value.slice(0, MAX_PROMPT_LENGTH))}
            rows={4}
            placeholder="e.g. a cozy reading nook by a rain-streaked window, warm lamp light, potted plants"
            className="input-field resize-none"
          />
          <span className="self-end font-mono text-[11px] text-graphite">
            {prompt.length}/{MAX_PROMPT_LENGTH}
          </span>
        </label>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        {/* Controls */}
        <div className="card p-6">
          <h2 className="font-display text-sm font-medium text-chalk">Generation settings</h2>
          <div className="mt-5">
            <GenerationControls
              style={style}
              setStyle={setStyle}
              colorPalette={colorPalette}
              setColorPalette={setColorPalette}
              quality={quality}
              setQuality={setQuality}
              variations={variations}
              setVariations={setVariations}
            />
          </div>
        </div>

        {/* Generate action */}
        <div className="card flex flex-col justify-center gap-4 p-6">
          {error && (
            <div className="rounded-md border border-danger/40 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
              {error}
            </div>
          )}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="btn-primary w-full"
          >
            {isGenerating ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-chalk/30 border-t-chalk" />
                Generating…
              </>
            ) : (
              'Generate image'
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {generation && (
        <div className="mt-12 border-t border-panelBorder/60 pt-10">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-chalk">Your results</h2>
            <span className="font-mono text-xs text-graphite">
              {generation.results.length} variation{generation.results.length !== 1 ? 's' : ''} · {style} · {colorPalette}
            </span>
          </div>
          <ResultsGrid results={generation.results} />
        </div>
      )}
    </main>
  )
}