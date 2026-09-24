import { useCallback, useEffect, useState } from 'react'
import { listAccounts, createAccount } from '../api/client'
import { useAuth } from '../context/useAuth'
import CreateAccountForm from '../components/CreateAccountForm'
import AccountCard from '../components/AccountCard'

function Dashboard() {
  const { token, logout } = useAuth()
  const [accounts, setAccounts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const refreshAccounts = useCallback(async () => {
    try {
      const data = await listAccounts(token)
      setAccounts(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
    refreshAccounts()
  }, [refreshAccounts])

  async function handleCreateAccount(name, initialDeposit) {
    await createAccount(token, name, initialDeposit)
    await refreshAccounts()
  }

  return (
    <div className="min-h-screen bg-ink text-parchment">
      <header className="border-b border-panel px-6 py-4 flex items-center justify-between">
        <h1 className="font-display text-2xl">Your accounts</h1>
        <button
          onClick={logout}
          className="text-sm text-sage hover:text-parchment transition-colors"
        >
          Log out
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-8">
        <CreateAccountForm onCreate={handleCreateAccount} />

        {error && <p className="text-sm text-red-400">{error}</p>}

        {isLoading && <p className="text-sage">Loading accounts…</p>}

        {!isLoading && accounts.length === 0 && (
          <p className="text-sage">You don't have any accounts yet. Open one above.</p>
        )}

        <div className="flex flex-col gap-6">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              allAccounts={accounts}
              token={token}
              onChange={refreshAccounts}
            />
          ))}
        </div>
      </main>
    </div>
  )
}

export default Dashboard
