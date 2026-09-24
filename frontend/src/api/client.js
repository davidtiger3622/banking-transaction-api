const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = {}
  if (body) headers['Content-Type'] = 'application/json'
  if (token) headers['Authorization'] = `Bearer ${token}`

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    throw new Error(errorBody.detail || 'Request failed')
  }

  if (response.status === 204) return null
  return response.json()
}

export function registerUser(email, password) {
  return request('/auth/register', { method: 'POST', body: { email, password } })
}

export async function loginUser(email, password) {
  const formBody = new URLSearchParams()
  formBody.append('username', email)
  formBody.append('password', password)

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formBody,
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    throw new Error(errorBody.detail || 'Login failed')
  }

  return response.json()
}

export function listAccounts(token) {
  return request('/accounts', { token })
}

export function createAccount(token, accountHolderName, initialDeposit) {
  return request('/accounts', {
    method: 'POST',
    token,
    body: { account_holder_name: accountHolderName, initial_deposit: initialDeposit },
  })
}

export function depositFunds(token, accountId, amount) {
  return request(`/accounts/${accountId}/deposit`, { method: 'POST', token, body: { amount } })
}

export function withdrawFunds(token, accountId, amount) {
  return request(`/accounts/${accountId}/withdraw`, { method: 'POST', token, body: { amount } })
}

export function transferFunds(token, fromAccountId, toAccountId, amount) {
  return request('/accounts/transfer', {
    method: 'POST',
    token,
    body: { from_account_id: fromAccountId, to_account_id: toAccountId, amount },
  })
}

export function deleteAccount(token, accountId) {
  return request(`/accounts/${accountId}`, { method: 'DELETE', token })
}

export function listTransactions(token, accountId) {
  return request(`/accounts/${accountId}/transactions`, { token })
}

export function createLoan(token, accountId) {
  return request('/loans', { method: 'POST', token, body: { account_id: accountId } })
}

export function disburseLoan(token, loanId) {
  return request(`/loans/${loanId}/disburse`, { method: 'POST', token })
}
