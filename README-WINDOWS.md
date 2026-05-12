# Inventory Management ERP — Windows Setup Guide

## Quick Start (3 Steps)

### Step 1 — Install Node.js (one-time, skip if already installed)
1. Go to **https://nodejs.org/en/download/**
2. Download the **LTS** version (Windows Installer `.msi`)
3. Run the installer — click Next until done, no custom settings needed

### Step 2 — Run the App
1. Open the `hardware-erp` folder
2. Double-click **`START_HERE.bat`**
3. A black window will open and show "Starting server..."
4. Your browser opens automatically at **http://localhost:3000**

> **Keep the black window open** while using the app. Closing it stops the server.

### Step 3 — First Launch
The **Setup Wizard** will appear on first launch. Enter your:
- Business name, phone, email
- State and GSTIN
- Admin name and email

Click **"Launch My ERP"** — done!

---

## Daily Use

| Action | How |
|--------|-----|
| Start the app | Double-click `START_HERE.bat` |
| Stop the app | Close the black window |
| Access the app | Open browser → `http://localhost:3000` |
| Backup your data | Settings → Data Management → Export Full Backup |
| Restore data | Settings → Data Management → Upload Backup File |
| Import products | Settings → Data Management → Import Data (CSV) |

---

## Backup & Data Safety

Your data is stored in your **browser's local database (IndexedDB)**.

✅ Data survives browser restarts  
✅ Data survives computer restarts  
✅ Data is NOT affected by Windows updates  
⚠️ Data may be lost if you **reset** the browser or use a different browser  

**Recommended:** Export a full backup every week to a USB drive or Google Drive folder.

---

## Sharing with Another Computer

1. Run **Export Full Backup** from Data Management
2. Copy the `.json` file to the other computer
3. Install the app on that computer (Steps 1–2 above)
4. On first launch, complete the Setup Wizard
5. Go to Data Management → Restore from Backup → upload the `.json` file

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Black window closes immediately | Right-click `START_HERE.bat` → Run as administrator |
| "Node.js not found" error | Install Node.js from nodejs.org (Step 1) |
| Browser opens but shows blank | Wait 5 seconds and refresh the page |
| Port 3000 already in use | Close other apps using port 3000, or edit `start.bat` and change `3000` to `3001` |
| Data appears missing after browser update | Restore from your last backup |

---

## System Requirements

- **OS:** Windows 10 or Windows 11
- **RAM:** 4 GB minimum
- **Browser:** Chrome, Edge, or Firefox (latest version recommended)
- **Node.js:** v18 or later (free download at nodejs.org)
- **Disk Space:** ~200 MB (app + Node.js modules)

---

## Technical Details

- **Database:** IndexedDB (browser-native, no external DB needed)
- **Framework:** React + Vite (offline-capable PWA)
- **Server:** `serve` static file server via Node.js
- **Data Location:** Browser profile → IndexedDB → `HanumanERPDB_V1`
- **Port:** 3000 (configurable in `start.bat`)
