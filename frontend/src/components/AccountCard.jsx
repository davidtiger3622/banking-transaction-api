import { useState } from 'react'
import {
  depositFunds,
  withdrawFunds,
  transferFunds,
  deleteAccount,
  listTransactions,
  createLoan,
  disburseLoan,
} from '../api/client'

function AccountCard({ account, allAccounts, token, onChange }) {
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [transferAmount, setTransferAmount] = useState('')
  const [transferTo, setTransferTo] = useState('')
  const [transactions, setTransactions] = useState(null)
  const [loan, setLoan] = useState(null)
  const [error, setError] = useState('')
  const [isBusy, setIsBusy] = useState(false)

  const otherAccounts = allAccounts.filter((a) => a.id !== account.id)

  async function runAction(action) {
    setError('')
    setIsBusy(true)
    try {
      await action()
      await onChange()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsBusy(false)
    }
  }

  function handleDeposit(event) {
    event.preventDefault()
    runAction(async () => {
      await depositFunds(token, account.id, Number(depositAmount))
      setDepositAmount('')
    })
  }

  function handleWithdraw(event) {
    event.preventDefault()
    runAction(async () => {
      await withdrawFunds(token, account.id, Number(withdrawAmount))
      setWithdrawAmount('')
    })
  }

  function handleTransfer(event) {
    event.preventDefault()
    runAction(async () => {
      await transferFunds(token, account.id, transferTo, Number(transferAmount))
      setTransferAmount('')
      setTransferTo('')
    })
  }

  function handleDelete() {
    runAction(async () => {
      await deleteAccount(token, account.id)
    })
  }

  async function toggleTransactions() {
    if (transactions) {
      setTransactions(null)
      return
    }
    setError('')
    try {
      const data = await listTransactions(token, account.id)
      setTransactions(data)
    } catch (err) {
      setError(err.message)
    }
  }

  function handleCreateLoan() {
    runAction(async () => {
      const newLoan = await createLoan(token, account.id)
      setLoan(newLoan)
    })
  }

  function handleDisburseLoan() {
    runAction(async () => {
      const updatedLoan = await disburseLoan(token, loan.id)
      setLoan(updatedLoan)
    })
  }

  return (
    <div className="bg-panel rounded-sm p-6 flex flex-col gap-5">
      <div>
        <p className="text-sage text-sm">{account.account_number}</p>
        <h3 className="font-display text-2xl">{account.account_holder_name}</h3>
        <p className="mt-1 text-3xl text-brass font-medium">
          KES {Number(account.balance).toLocaleString()}
        </p>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <form onSubmit={handleDeposit} className="flex gap-2">
          <input
            type="number"
            min="0.01"
            step="0.01"
            required
            placeholder="Amount"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            className="w-full px-3 py-2 bg-ink border border-sage/30 rounded-sm text-parchment text-sm focus:outline-none focus:border-brass"
          />
          <button
            type="submit"
            disabled={isBusy}
            className="px-3 py-2 bg-brass text-ink text-sm font-medium rounded-sm hover:bg-parchment transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            Deposit
          </button>
        </form>

        <form onSubmit={handleWithdraw} className="flex gap-2">
          <input
            type="number"
            min="0.01"
            step="0.01"
            required
            placeholder="Amount"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            className="w-full px-3 py-2 bg-ink border border-sage/30 rounded-sm text-parchment text-sm focus:outline-none focus:border-brass"
          />
          <button
            type="submit"
            disabled={isBusy}
            className="px-3 py-2 border border-sage text-parchment text-sm font-medium rounded-sm hover:border-brass transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            Withdraw
          </button>
        </form>
      </div>

      {otherAccounts.length > 0 && (
        <form onSubmit={handleTransfer} className="flex flex-wrap gap-2 items-center">
          <select
            required
            value={transferTo}
            onChange={(e) => setTransferTo(e.target.value)}
            className="px-3 py-2 bg-ink border border-sage/30 rounded-sm text-parchment text-sm focus:outline-none focus:border-brass"
          >
            <option value="">Transfer to…</option>
            {otherAccounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.account_holder_name} ({a.account_number})
              </option>
            ))}
          </select>
          <input
            type="number"
            min="0.01"
            step="0.01"
            required
            placeholder="Amount"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
            className="w-28 px-3 py-2 bg-ink border border-sage/30 rounded-sm text-parchment text-sm focus:outline-none focus:border-brass"
          />
          <button
            type="submit"
            disabled={isBusy}
            className="px-3 py-2 bg-brass text-ink text-sm font-medium rounded-sm hover:bg-parchment transition-colors disabled:opacity-50"
          >
            Transfer
          </button>
        </form>
      )}

      <div className="flex flex-wrap gap-3 items-center pt-2 border-t border-sage/20">
        <button
          onClick={toggleTransactions}
          className="text-sm text-sage hover:text-parchment transition-colors"
        >
          {transactions ? 'Hide history' : 'View history'}
        </button>

        {!loan && (
          <button
            onClick={handleCreateLoan}
            disabled={isBusy}
            className="text-sm text-sage hover:text-parchment transition-colors disabled:opacity-50"
          >
            Request loan
          </button>
        )}

        {loan && !loan.disbursed && (
          <button
            onClick={handleDisburseLoan}
            disabled={isBusy}
            className="text-sm text-brass hover:text-parchment transition-colors disabled:opacity-50"
          >
            Disburse loan ({loan.currency} {Number(loan.principal_amount).toLocaleString()})
          </button>
        )}

        {loan && loan.disbursed && (
          <span className="text-sm text-sage">Loan disbursed</span>
        )}

        <button
          onClick={handleDelete}
          disabled={isBusy || Number(account.balance) !== 0}
          title={
            Number(account.balance) !== 0
              ? 'Only dormant (zero-balance) accounts can be deleted'
              : ''
          }
          className="ml-auto text-sm text-red-400 hover:text-red-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Delete account
        </button>
      </div>

      {transactions && (
        <div className="pt-2 flex flex-col gap-1">
          {transactions.length === 0 && (
            <p className="text-sm text-sage">No transactions yet.</p>
          )}
          {transactions.map((tx) => (
            <div key={tx.id} className="flex justify-between text-sm text-sage">
              <span>{tx.type.replace('_', ' ')}</span>
              <span>KES {Number(tx.amount).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AccountCard
