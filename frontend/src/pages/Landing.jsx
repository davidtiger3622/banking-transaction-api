import { Link } from 'react-router-dom'

function Landing() {
  return (
    <div className="min-h-screen bg-ink text-parchment flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <h1 className="font-display text-5xl md:text-6xl font-medium max-w-2xl leading-tight">
          Move money with confidence
        </h1>
        <p className="mt-6 max-w-md text-sage text-lg leading-relaxed">
          A banking transaction system for creating accounts, moving funds
          between them, and disbursing loans, built on a secure API.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link
            to="/register"
            className="px-8 py-3 bg-brass text-ink font-medium rounded-sm hover:bg-parchment transition-colors"
          >
            Create an account
          </Link>
          <Link
            to="/login"
            className="px-8 py-3 border border-sage text-parchment font-medium rounded-sm hover:border-parchment transition-colors"
          >
            Log in
          </Link>
        </div>
      </main>

      <section className="border-t border-panel">
        <div className="max-w-3xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-10 text-center">
          <div>
            <h2 className="font-display text-xl">Deposit and withdraw</h2>
            <p className="mt-2 text-sage text-sm leading-relaxed">
              Move funds in and out of any account, with every change recorded.
            </p>
          </div>
          <div>
            <h2 className="font-display text-xl">Transfer instantly</h2>
            <p className="mt-2 text-sage text-sm leading-relaxed">
              Send funds between two accounts in a single, atomic operation.
            </p>
          </div>
          <div>
            <h2 className="font-display text-xl">Disburse loans</h2>
            <p className="mt-2 text-sage text-sm leading-relaxed">
              Attach a loan to an account and release funds on demand.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Landing
