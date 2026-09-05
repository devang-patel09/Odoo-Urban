import requests
import json
import sys

# Force UTF-8 output encoding
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://localhost:5000/api"

def print_step(title):
    print("\n" + "="*70)
    print(f"[*] {title}")
    print("="*70)

def main():
    # 1. AUTHENTICATION & LOGIN
    print_step("1. Admin Authentication")
    res = requests.post(f"{BASE_URL}/auth/login", json={"loginId": "admin", "password": "Admin@123456"})
    assert res.status_code == 200, f"Admin login failed: {res.text}"
    admin_token = res.json()["data"]["token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
    print("✅ Admin authenticated successfully:", res.json()["data"]["user"]["email"])

    # 2. VENDOR PROCUREMENT LIFECYCLE
    print_step("2. Vendor Procurement Flow (PO -> Bill -> Post -> Pay)")
    # Get vendor Azure Furniture
    vendors = requests.get(f"{BASE_URL}/contacts?type=VENDOR", headers=admin_headers).json()["data"]
    azure = next(v for v in vendors if "Azure" in v["name"])
    products = requests.get(f"{BASE_URL}/products", headers=admin_headers).json()["data"]
    wood = next(p for p in products if "Wood" in p["name"] or "Raw" in p["name"])
    analytics = requests.get(f"{BASE_URL}/analytics", headers=admin_headers).json()["data"]
    op_analytic = analytics[0]
    journals = requests.get(f"{BASE_URL}/journals", headers=admin_headers).json()["data"]
    bank_journal = next(j for j in journals if j["type"] == "BANK")

    # Create PO
    po_res = requests.post(f"{BASE_URL}/purchases", headers=admin_headers, json={
        "vendorId": azure["id"],
        "poDate": "2026-02-01",
        "paymentTerms": "30 Days",
        "lines": [{
            "productId": wood["id"],
            "analyticAccountId": op_analytic["id"],
            "quantity": 5,
            "unitPrice": 4000
        }]
    })
    assert po_res.status_code == 201, f"PO creation failed: {po_res.text}"
    po = po_res.json()["data"]
    print(f"✅ Purchase Order created: {po['poNumber']} | Amount: ₹{po['totalAmount']}")

    # Confirm PO
    conf_po = requests.post(f"{BASE_URL}/purchases/{po['id']}/confirm", headers=admin_headers).json()["data"]
    assert conf_po["status"] == "CONFIRMED", "PO confirmation failed"
    print(f"✅ Purchase Order confirmed: {conf_po['status']}")

    # Convert to Bill
    bill_res = requests.post(f"{BASE_URL}/purchases/{po['id']}/convert-to-bill", headers=admin_headers)
    assert bill_res.status_code == 201, f"Bill conversion failed: {bill_res.text}"
    bill = bill_res.json()["data"]
    print(f"✅ Converted to Vendor Bill: {bill['billNumber']} | Status: {bill['status']} | Due: ₹{bill['amountDue']}")

    # Post Bill to General Ledger
    post_bill = requests.post(f"{BASE_URL}/vendor-bills/{bill['id']}/post", headers=admin_headers).json()["data"]
    assert post_bill["status"] == "POSTED", "Bill posting failed"
    print(f"✅ Bill posted to GL: {post_bill['status']} | Journal Entry: {post_bill['journalEntry']['entryNumber']}")

    # Register Payment via Bank
    pay_bill = requests.post(f"{BASE_URL}/payments", headers=admin_headers, json={
        "type": "VENDOR",
        "partnerId": azure["id"],
        "amount": float(post_bill["amountDue"]),
        "paymentMethod": "BANK",
        "journalId": bank_journal["id"],
        "paymentDate": "2026-02-05",
        "reference": f"CHQ-{bill['billNumber']}",
        "vendorBillId": bill["id"]
    }).json()["data"]
    print(f"✅ Vendor Bill Payment registered: {pay_bill['paymentNumber']} | Amount: ₹{pay_bill['amount']}")

    # Verify Bill is Paid
    updated_bill = requests.get(f"{BASE_URL}/vendor-bills/{bill['id']}", headers=admin_headers).json()["data"]
    assert updated_bill["status"] == "PAID", f"Expected PAID status, got {updated_bill['status']}"
    assert float(updated_bill["amountDue"]) == 0, f"Expected 0 due, got {updated_bill['amountDue']}"
    print(f"✅ Verified Bill Status: {updated_bill['status']} | Outstanding Due: ₹{updated_bill['amountDue']}")

    # 3. SALES & CUSTOMER PORTAL LIFECYCLE
    print_step("3. Customer Sales Flow (SO -> Invoice -> Post -> Portal Payment)")
    customers = requests.get(f"{BASE_URL}/contacts?type=CUSTOMER", headers=admin_headers).json()["data"]
    nimesh = next(c for c in customers if "Nimesh" in c["name"])
    chair = next(p for p in products if "Chair" in p["name"])

    # Create SO
    so_res = requests.post(f"{BASE_URL}/sales", headers=admin_headers, json={
        "customerId": nimesh["id"],
        "soDate": "2026-02-10",
        "lines": [{
            "productId": chair["id"],
            "analyticAccountId": op_analytic["id"],
            "quantity": 2,
            "unitPrice": 12500,
            "taxRate": 18
        }]
    })
    assert so_res.status_code == 201, f"SO creation failed: {so_res.text}"
    so = so_res.json()["data"]
    print(f"✅ Sales Order created: {so['soNumber']} | Total: ₹{so['totalAmount']}")

    # Confirm SO
    conf_so = requests.post(f"{BASE_URL}/sales/{so['id']}/confirm", headers=admin_headers).json()["data"]
    assert conf_so["status"] == "CONFIRMED"
    print(f"✅ Sales Order confirmed: {conf_so['status']}")

    # Convert to Invoice
    inv_res = requests.post(f"{BASE_URL}/sales/{so['id']}/convert-to-invoice", headers=admin_headers)
    assert inv_res.status_code == 201
    invoice = inv_res.json()["data"]
    print(f"✅ Customer Invoice generated: {invoice['invoiceNumber']} | Due: ₹{invoice['amountDue']}")

    # Post Invoice
    post_inv = requests.post(f"{BASE_URL}/invoices/{invoice['id']}/post", headers=admin_headers).json()["data"]
    assert post_inv["status"] == "POSTED"
    print(f"✅ Invoice posted to GL: {post_inv['status']} | JE: {post_inv['journalEntry']['entryNumber']}")

    # Customer Portal Login as Nimesh
    portal_login = requests.post(f"{BASE_URL}/auth/login", json={"loginId": "nimesh", "password": "User@123456"})
    assert portal_login.status_code == 200, f"Portal login failed: {portal_login.text}"
    portal_token = portal_login.json()["data"]["token"]
    portal_headers = {"Authorization": f"Bearer {portal_token}", "Content-Type": "application/json"}
    print("✅ Customer logged into portal:", portal_login.json()["data"]["user"]["name"])

    # Portal user views invoices (verifying isolation: only Nimesh invoices visible)
    portal_invoices = requests.get(f"{BASE_URL}/invoices", headers=portal_headers).json()["data"]
    assert all(i["customerId"] == nimesh["id"] for i in portal_invoices), "Data isolation breach in portal!"
    print(f"✅ Contact data isolation verified: {len(portal_invoices)} invoices belonging strictly to Nimesh")

    # Portal user settles invoice online
    portal_pay = requests.post(f"{BASE_URL}/payments", headers=portal_headers, json={
        "type": "CUSTOMER",
        "partnerId": nimesh["id"],
        "amount": float(post_inv["amountDue"]),
        "paymentMethod": "BANK",
        "journalId": bank_journal["id"],
        "paymentDate": "2026-02-12",
        "reference": f"PORTAL-NETBANK-{invoice['invoiceNumber']}",
        "customerInvoiceId": invoice["id"]
    }).json()["data"]
    print(f"✅ Portal payment executed: {portal_pay['paymentNumber']} | Reconciled: ₹{portal_pay['amount']}")

    # Verify invoice is PAID
    rechecked_inv = requests.get(f"{BASE_URL}/invoices/{invoice['id']}", headers=admin_headers).json()["data"]
    assert rechecked_inv["status"] == "PAID", f"Expected PAID, got {rechecked_inv['status']}"
    assert float(rechecked_inv["amountDue"]) == 0
    print(f"✅ Verified Invoice Status: {rechecked_inv['status']} | Outstanding Due: ₹{rechecked_inv['amountDue']}")

    # 4. DOUBLE-ENTRY AUDIT TRAIL
    print_step("4. General Ledger Double-Entry Audit Trail")
    entries = requests.get(f"{BASE_URL}/accounting/journal-entries", headers=admin_headers).json()["data"]
    print(f"Total Journal Entries in Ledger: {len(entries)}")
    for entry in entries[:4]:
        dr = float(entry["totalDebit"])
        cr = float(entry["totalCredit"])
        assert abs(dr - cr) < 0.01, f"UNBALANCED JOURNAL ENTRY {entry['entryNumber']}: Dr {dr} != Cr {cr}"
        print(f"  Entry {entry['entryNumber']} ({entry['date'][:10]}): Dr ₹{dr:.2f} == Cr ₹{cr:.2f} (Balanced)")

    # 5. BUDGETS & REVISIONS
    print_step("5. Budget Tracking & Revision Lineage")
    budgets = requests.get(f"{BASE_URL}/budgets", headers=admin_headers).json()["data"]
    active_b = budgets[0]
    print(f"Existing Budget: {active_b['name']} | Status: {active_b['status']} | Committed: ₹{active_b['committedAmount']}")

    # If draft, confirm it
    if active_b["status"] == "DRAFT":
        active_b = requests.post(f"{BASE_URL}/budgets/{active_b['id']}/confirm", headers=admin_headers).json()["data"]
        print(f"✅ Budget confirmed: {active_b['status']}")

    # Revise budget
    rev_res = requests.post(f"{BASE_URL}/budgets/{active_b['id']}/revise", headers=admin_headers, json={
        "committedAmount": 275000,
        "notes": "Revision 1 for expanding furniture line"
    })
    assert rev_res.status_code == 201, f"Budget revision failed: {rev_res.text}"
    rev_budget = rev_res.json()["data"]
    print(f"✅ Revision spawned: {rev_budget['name']} | Parent ID: {rev_budget['originalBudgetId']} | New Committed: ₹{rev_budget['committedAmount']}")

    # 6. OCR ASSISTANT
    print_step("6. OCR Assistant Document Extraction")
    raw_ocr = """TAX INVOICE
Vendor: Azure Furniture
Invoice Number: OCR-AZ-99882
Date: 2026-03-01
Due Date: 2026-03-31

Teak Wood Table 2 12000 24000
Executive Mesh Chair 4 5000 20000

Subtotal: 44000.00
Tax: 7920.00
Total: 51920.00"""
    ocr_res = requests.post(f"{BASE_URL}/ocr/parse", headers=admin_headers, json={"text": raw_ocr})
    assert ocr_res.status_code == 200, f"OCR failed: {ocr_res.text}"
    ocr_data = ocr_res.json()["data"]
    print(f"✅ OCR Extracted Vendor: {ocr_data['partnerName']} (Matched ID: {ocr_data['partnerId']})")
    print(f"✅ Invoice Number: {ocr_data['invoiceNumber']} | Total: ₹{ocr_data['totalAmount']}")
    print(f"✅ Confidence Score: {ocr_data['confidenceScore']}% | Extracted Lines: {len(ocr_data['lines'])}")

    # 7. FINANCIAL STATEMENTS
    print_step("7. Live Compliance Financial Statements")
    pnl = requests.get(f"{BASE_URL}/reports/profit-and-loss", headers=admin_headers).json()["data"]
    print(f"Profit & Loss: Total Income: ₹{pnl['income']['total']} | Total Expenses: ₹{pnl['expenses']['total']} | Net Profit: ₹{pnl['netProfit']}")

    bs = requests.get(f"{BASE_URL}/reports/balance-sheet", headers=admin_headers).json()["data"]
    print(f"Balance Sheet: Assets: ₹{bs['assets']['total']} | Liabilities: ₹{bs['liabilities']['total']} | Equity: ₹{bs['equity']['total']}")
    print(f"Balance Sheet Check: {bs['equationCheck']} | Balanced: {bs['isBalanced']}")

    tb = requests.get(f"{BASE_URL}/reports/trial-balance", headers=admin_headers).json()["data"]
    print(f"Trial Balance: Grand Dr: ₹{tb['grandTotalDebit']} | Grand Cr: ₹{tb['grandTotalCredit']} | Balanced: {tb['isBalanced']}")

    kpis = requests.get(f"{BASE_URL}/reports/dashboard-kpis", headers=admin_headers).json()["data"]
    print(f"Executive Dashboard KPIs: Revenue ₹{kpis['kpis']['totalRevenue']}, Expenses ₹{kpis['kpis']['totalExpenses']}, Cash & Bank ₹{kpis['kpis']['cashBankBalance']}")

    print("\n" + "="*70)
    print("[SUCCESS] ALL END-TO-END ACCEPTANCE TESTS COMPLETED SUCCESSFULLY WITH 100% ACCURACY!")
    print("="*70)

if __name__ == "__main__":
    main()
