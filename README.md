# Banking Transaction API

A full-stack banking transaction system with a FastAPI backend and a React frontend, supporting account creation, deposits, withdrawals, transfers, dormant account deletion, and loan disbursement.

## Live Demo

- **App**: https://banking-transaction-api-five.vercel.app
- **API docs**: https://banking-transaction-api-bil3.onrender.com/docs

The backend is hosted on Render's free tier, which spins down after inactivity — the first request after idle time may take 30–50 seconds while it wakes up.

## Features

- JWT-based user authentication (register/login)
- Create bank accounts with auto-generated account numbers
- Deposit and withdraw funds
- Transfer funds between accounts
- Delete dormant (zero-balance) accounts
- Create and disburse a 10,000 KES loan to an account
- Full transaction history per account
- React frontend with a landing page, auth flow, and dashboard

## Tech Stack

**Backend**
- FastAPI
- PostgreSQL (hosted on Neon)
- SQLAlchemy
- Pydantic
- JWT (python-jose) + bcrypt password hashing
- Ruff for linting, pytest + pytest-cov for testing
- Deployed on Render

**Frontend**
- React (Vite)
- React Router
- Tailwind CSS
- ESLint
- Deployed on Vercel

**CI**
- GitHub Actions — lint and test both backend and frontend on every push

## Running Locally

### Backend

1. Clone the repository and navigate into it:
   \`\`\`bash
   git clone https://github.com/davidtiger3622/banking-transaction-api.git
   cd banking-transaction-api
   \`\`\`

2. Create and activate a virtual environment:
   \`\`\`bash
   python3 -m venv venv
   source venv/bin/activate
   \`\`\`

3. Install dependencies:
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

4. Create a \`.env\` file in the project root:
   \`\`\`
   DATABASE_URL=postgresql://<user>:<password>@<host>/<dbname>?sslmode=require
   JWT_SECRET_KEY=<a-long-random-secret>
   \`\`\`

5. Run the server:
   \`\`\`bash
   uvicorn app.main:app --reload
   \`\`\`

6. Open the interactive API docs at http://127.0.0.1:8000/docs

### Frontend

1. Navigate into the frontend folder:
   \`\`\`bash
   cd frontend
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Create a \`.env\` file in \`frontend/\`:
   \`\`\`
   VITE_API_BASE_URL=http://127.0.0.1:8000
   \`\`\`

4. Run the dev server:
   \`\`\`bash
   npm run dev
   \`\`\`

5. Open the printed URL (typically http://localhost:5173) in your browser. The backend must be running for the frontend to work.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /auth/register | Register a new user |
| POST | /auth/login | Log in and receive a JWT |
| POST | /accounts | Create a bank account |
| GET | /accounts | List your accounts |
| POST | /accounts/{id}/deposit | Deposit funds |
| POST | /accounts/{id}/withdraw | Withdraw funds |
| POST | /accounts/transfer | Transfer funds between accounts |
| DELETE | /accounts/{id} | Delete a dormant (zero-balance) account |
| GET | /accounts/{id}/transactions | View transaction history |
| POST | /loans | Create a loan for an account |
| POST | /loans/{id}/disburse | Disburse a 10,000 KES loan |

Full interactive documentation is available at \`/docs\` on the live API or your local instance.

## Running Tests

\`\`\`bash
pytest --cov=app --cov-report=term-missing
\`\`\`

## Linting

\`\`\`bash
ruff check .          # backend
cd frontend && npm run lint   # frontend
\`\`\`

## License

MIT — see [LICENSE](LICENSE) for details.
