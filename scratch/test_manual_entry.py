import requests

BASE_URL = "http://localhost:5000/api"

# Login as admin
login_res = requests.post(f"{BASE_URL}/auth/login", json={"loginId": "admin", "password": "Admin@123456"})
token = login_res.json()["data"]["token"]
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

# Fetch journals and accounts
journals = requests.get(f"{BASE_URL}/journals", headers=headers).json()["data"]
accounts = requests.get(f"{BASE_URL}/accounts", headers=headers).json()["data"]

general_j = next(j for j in journals if j["type"] == "GENERAL")
cash_acc = next(a for a in accounts if a["code"] == "1000")
cap_acc = next(a for a in accounts if a["code"] == "3000")

# Test manual journal entry
entry_payload = {
    "date": "2026-02-28",
    "journalId": general_j["id"],
    "reference": "Capital Infusion Adjustment",
    "items": [
        {"accountId": cash_acc["id"], "description": "Cash introduced", "debit": 50000, "credit": 0},
        {"accountId": cap_acc["id"], "description": "Partner capital", "debit": 0, "credit": 50000}
    ]
}

res = requests.post(f"{BASE_URL}/accounting/journal-entries", headers=headers, json=entry_payload)
print("Manual Journal Entry Status:", res.status_code)
print("Result Entry Number:", res.json()["data"]["entryNumber"], "| Total Debit:", res.json()["data"]["totalDebit"], "| Total Credit:", res.json()["data"]["totalCredit"])
