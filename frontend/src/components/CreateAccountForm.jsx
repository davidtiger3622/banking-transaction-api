import { useState } from 'react'

function CreateAccountForm({ onCreate }) {
  const [name, setName] = useState('')
  const [initialDeposit, setInitialDeposit] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      await onCreate(name, Number(initialDeposit) || 0)
      setName('')
      setInitialDeposit('')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-panel rounded-sm p-6 flex flex-col gap-4">
      <h2 className="font-display text-xl">Open a new account</h2>

      <div>
        <label className="block text-sm text-sage mb-1" htmlFor="holder-name">
          Account holder name
        </label>
        <input
          id="holder-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 bg-ink border border-sage/30 rounded-sm text-parchment focus:outline-none focus:border-brass"
        />
      </div>

      <div>
        <label className="block text-sm text-sage mb-1" htmlFor="initial-deposit">
          Initial deposit (optional)
        </label>
        <input
          id="initial-deposit"
          type="number"
          min="0"
          step="0.01"
          value={initialDeposit}
          onChange={(e) => setInitialDeposit(e.target.value)}
          className="w-full px-4 py-2 bg-ink border border-sage/30 rounded-sm text-parchment focus:outline-none focus:border-brass"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-2 bg-brass text-ink font-medium rounded-sm hover:bg-parchment transition-colors disabled:opacity-50 self-start"
      >
        {isSubmitting ? 'Opening…' : 'Open account'}
      </button>
    </form>
  )
}

export default CreateAccountForm
