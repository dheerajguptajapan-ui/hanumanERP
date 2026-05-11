# Enterprise ERP: India GST-Compliant SCM System
## Production Deployment Manual & User Guide

Welcome to your Enterprise-grade Supply Chain Management (SCM) system. This platform is designed for Indian businesses to manage inventory, sales, and purchases while maintaining 100% GST compliance.

---

### 🚀 Getting Started (First-Time Setup)

When you launch the system for the first time, follow these steps in order to ensure your invoices are legally compliant:

#### 1. Setup Your Organization Profile
- Navigate to **Settings** > **Organization Profile**.
- Enter your **Business Name**, **Address**, **GSTIN**, and **PAN**.
- Upload your company logo (will appear on all PDFs).
- Save changes. This data is used to calculate tax rates (IGST vs. CGST/SGST) based on your state.

#### 2. Configure Your Inventory
- Go to the **Inventory** module.
- Click **Add New Item**.
- **Crucial**: Enter the correct **HSN Code** and **GST Rate** (5%, 12%, 18%, or 28%).
- Set "Opening Stock" if you already have physical items in your shop.

#### 3. Add Customers & Vendors
- Add your frequent buyers in **Sales** > **Customers**.
- Add your suppliers in **Purchases** > **Vendors**.
- Ensure their **GSTIN** is entered correctly for tax credit (ITC) purposes.

---

### 📦 Supply Chain Workflows

#### A. Procure-to-Pay (P2P) - Purchasing
1. **Purchase Order (PO)**: Create a PO in the Purchases module and send the PDF to your vendor.
2. **Receive Goods (GRN)**: When items arrive, open the PO and click **Receive**. This updates your physical stock levels.
3. **Bill**: Once the vendor sends their invoice, click **Convert to Bill** on the PO. This records your accounts payable.

#### B. Order-to-Cash (O2C) - Sales
1. **Quotation**: Send a quote to your customer.
2. **Sales Order**: Convert the quote to an order to reserve stock.
3. **Invoice**: Click **Convert to Invoice** to generate the legal GST document.
4. **Payment**: Record the payment received to clear your accounts receivable.

---

### 🛡️ Data Safety & Backups

This system uses an **Offline-First** architecture for maximum speed. Your data is stored securely in your browser's IndexedDB.

- **Auto-Backup**: The system automatically takes a snapshot of your database every 10 minutes.
- **Manual Export**: Go to **Settings** > **Data & Sync** to download a `.json` backup file. **Do this daily.**
- **Restore**: If you change computers or clear your browser cache, use the **Restore** button to upload your latest JSON backup.

---

### 📑 GST Compliance Features
- **HSN-wise Reporting**: All invoices automatically group taxes by HSN code.
- **Automatic Tax Detection**: The system detects if the customer is in your state (CGST+SGST) or outside your state (IGST) based on the GSTIN/State field.
- **Reverse Charge Support**: Can be toggled for specific purchase bills.

---

### 🛠️ Technical Support & Best Practices
- **Browser**: Use the latest version of Chrome or Edge for the best experience.
- **Stock Accuracy**: Always record a **Goods Receipt** before sales to prevent "Negative Stock" warnings.
- **Daily Routine**: Export your data at the end of each business day.

---
*Created for Enterprise ERP - Optimized for Indian Supply Chain Excellence.*
