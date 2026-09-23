# Banking Transaction API

A FastAPI-based banking transaction system supporting account creation, deposits, withdrawals, transfers, dormant account deletion, and loan disbursement.

## Features

- JWT-based user authentication (register/login)
- Create bank accounts with auto-generated account numbers
- Deposit and withdraw funds
- Transfer funds between accounts
- Delete dormant (zero-balance) accounts
- Create and disburse a 10,000 KES loan to an account
- Full transaction history per account

## Tech Stack

- FastAPI
- PostgreSQL (hosted on Neon)
- SQLAlchemy
- Pydantic
- JWT (python-jose) + bcrypt password hashing

## Setup

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

6. Open the interactive API docs at \`http://127.0.0.1:8000/docs\`

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

## Running Tests

\`\`\`bash
pytest
\`\`\`
