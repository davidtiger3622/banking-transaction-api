import uuid


def unique_email():
    return f"test_{uuid.uuid4().hex[:10]}@example.com"


def test_register_and_login(client):
    email = unique_email()
    register_response = client.post(
        "/auth/register", json={"email": email, "password": "strongpass123"}
    )
    assert register_response.status_code == 201
    assert register_response.json()["email"] == email

    login_response = client.post(
        "/auth/login", data={"username": email, "password": "strongpass123"}
    )
    assert login_response.status_code == 200
    assert "access_token" in login_response.json()


def test_login_with_wrong_password_fails(client):
    email = unique_email()
    client.post("/auth/register", json={"email": email, "password": "strongpass123"})

    login_response = client.post(
        "/auth/login", data={"username": email, "password": "wrongpassword"}
    )
    assert login_response.status_code == 401


def test_register_duplicate_email_fails(client):
    email = unique_email()
    client.post("/auth/register", json={"email": email, "password": "strongpass123"})

    duplicate_response = client.post(
        "/auth/register", json={"email": email, "password": "anotherpass123"}
    )
    assert duplicate_response.status_code == 400
