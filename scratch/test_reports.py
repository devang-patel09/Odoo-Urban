import requests
import json

BASE_URL = "http://localhost:5000/api"

def main():
    # Login as admin
    login_res = requests.post(f"{BASE_URL}/auth/login", json={
        "loginId": "admin",
        "password": "Admin@123456"
    })
    token = login_res.json()["data"]["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Test P&L
    pnl_res = requests.get(f"{BASE_URL}/reports/profit-and-loss", headers=headers)
    print("P&L status:", pnl_res.status_code)
    print("P&L data:", json.dumps(pnl_res.json()["data"], indent=2))

    # 2. Test Balance Sheet
    bs_res = requests.get(f"{BASE_URL}/reports/balance-sheet", headers=headers)
    print("\nBalance Sheet status:", bs_res.status_code)
    print("Balance Sheet data:", json.dumps(bs_res.json()["data"], indent=2))

    # 3. Test Trial Balance
    tb_res = requests.get(f"{BASE_URL}/reports/trial-balance", headers=headers)
    print("\nTrial Balance status:", tb_res.status_code)
    print("Trial Balance Dr/Cr:", tb_res.json()["data"]["grandTotalDebit"], tb_res.json()["data"]["grandTotalCredit"], "Balanced:", tb_res.json()["data"]["isBalanced"])

    # 4. Test Aged Receivables
    ar_res = requests.get(f"{BASE_URL}/reports/aged-receivables", headers=headers)
    print("\nAged Receivables status:", ar_res.status_code)
    print("Aged Receivables totals:", ar_res.json()["data"]["totals"])

    # 5. Test Dashboard KPIs
    kpi_res = requests.get(f"{BASE_URL}/reports/dashboard-kpis", headers=headers)
    print("\nDashboard KPIs status:", kpi_res.status_code)
    print("Dashboard KPIs:", json.dumps(kpi_res.json()["data"]["kpis"], indent=2))

    # 6. Test Budgets
    budgets_res = requests.get(f"{BASE_URL}/budgets", headers=headers)
    print("\nBudgets status:", budgets_res.status_code)
    for b in budgets_res.json()["data"]:
        print(f"Budget: {b['name']}, Committed: {b['committedAmount']}, Achieved: {b['achievedAmount']}, Achieved %: {b['achievedPercentage']}%")

if __name__ == "__main__":
    main()
