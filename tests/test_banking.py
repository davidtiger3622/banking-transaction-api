import uuid


def unique_email():
    return f"test_{uuid.uuid4().hex[:10]}@example.com"


def auth_headers(client):
    email = unique_email()
    client.post("/auth/register", json={"email": email, "password": "strongpass123"})
    login_response = client.post(
        "/auth/login", data={"username": email, "password": "strongpass123"}
    )
    token = login_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def create_account(client, headers, initial_deposit=0):
    response = client.post(
        "/accounts",
        json={"account_holder_name": "Test User", "initial_deposit": initial_deposit},
        headers=headers,
    )
    return response.json()


def test_create_account(client):
    headers = auth_headers(client)
    account = create_account(client, headers, initial_deposit=100)
    assert account["balance"] == "100.00" or float(account["balance"]) == 100
    assert "account_number" in account


def test_deposit_increases_balance(client):
    headers = auth_headers(client)
    account = create_account(client, headers)

    response = client.post(
        f"/accounts/{account['id']}/deposit", json={"amount": 500}, headers=headers
    )
    assert response.status_code == 200
    assert float(response.json()["balance"]) == 500


def test_withdraw_decreases_balance(client):
    headers = auth_headers(client)
    account = create_account(client, headers, initial_deposit=1000)

    response = client.post(
        f"/accounts/{account['id']}/withdraw", json={"amount": 300}, headers=headers
    )
    assert response.status_code == 200
    assert float(response.json()["balance"]) == 700


def test_withdraw_insufficient_balance_fails(client):
    headers = auth_headers(client)
    account = create_account(client, headers, initial_deposit=100)

    response = client.post(
        f"/accounts/{account['id']}/withdraw", json={"amount": 500}, headers=headers
    )
    assert response.status_code == 400


def test_transfer_between_accounts(client):
    headers = auth_headers(client)
    from_account = create_account(client, headers, initial_deposit=1000)
    to_account = create_account(client, headers, initial_deposit=0)

    response = client.post(
        "/accounts/transfer",
        json={
            "from_account_id": from_account["id"],
            "to_account_id": to_account["id"],
            "amount": 400,
        },
        headers=headers,
    )
    assert response.status_code == 200
    balances = {acc["id"]: float(acc["balance"]) for acc in response.json()}
    assert balances[from_account["id"]] == 600
    assert balances[to_account["id"]] == 400


def test_delete_account_with_balance_fails(client):
    headers = auth_headers(client)
    account = create_account(client, headers, initial_deposit=50)

    response = client.delete(f"/accounts/{account['id']}", headers=headers)
    assert response.status_code == 400


def test_delete_dormant_account_succeeds(client):
    headers = auth_headers(client)
    account = create_account(client, headers, initial_deposit=0)

    response = client.delete(f"/accounts/{account['id']}", headers=headers)
    assert response.status_code == 204


def test_loan_creation_and_disbursement(client):
    headers = auth_headers(client)
    account = create_account(client, headers, initial_deposit=0)

    loan_response = client.post(
        "/loans", json={"account_id": account["id"]}, headers=headers
    )
    assert loan_response.status_code == 201
    loan = loan_response.json()
    assert loan["disbursed"] is False

    disburse_response = client.post(f"/loans/{loan['id']}/disburse", headers=headers)
    assert disburse_response.status_code == 200
    assert disburse_response.json()["disbursed"] is True

    account_check = client.get("/accounts", headers=headers)
    updated_account = next(a for a in account_check.json() if a["id"] == account["id"])
    assert float(updated_account["balance"]) == 10000
