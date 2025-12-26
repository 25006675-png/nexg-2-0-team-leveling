# 🏡 MyDigital Kampung (National ID Innovation)
**NexG Godam Lah! 2.0 - Team Leveling**

> **Track:** Inclusivity (National ID Innovation)  
> **Theme:** Inverting the Service Model – Bringing the Government to the People.

## 💡 Overview
**MyDigital Kampung** is an **Offline-First Identity Verification System** designed to solve the "Last Mile" failure for rural pensioners. It empowers gazetted **Ketua Kampung (Village Heads)** to function as mobile agents, bringing government services directly to the doorstep of the **63,420 "Double-Trapped" citizens** (those who are both medically bedridden and geographically isolated).

By shifting the paradigm from *"Patient moves to System"* to *"System moves to Patient,"* we eliminate the physical and financial barriers that cause vulnerable citizens to lose their pensions.

## 🛠️ Key Innovations (The Solution)

### 1. Inverting the Service Model
We mobilize the existing network of 15,000+ *Ketua Kampung* with rugged tablets to perform **"Doorstep Verification"**. No internet required.

### 2. Multi-Modal Biometrics (Inclusivity Focus)
* **Primary:** Direct MyKad Chip Verification (Thumbprint).
* **Fallback (New):** **Chip-to-Face Matching** using local **TensorFlow.js** models. This ensures inclusion for elderly citizens with faded fingerprints who are rejected by standard scanners.

### 3. The Digital Warrant (Wakil Withdrawal)
Pensioners can securely authorize a "Wakil" (Representative) to withdraw cash on their behalf.
* **Process:** The pensioner makes a **Wakil Declaration**, digitally signing the request with their biometrics.
* **Security:** This generates a **72-hour AES-256 Encrypted Token** (QR Code) that acts as a digital warrant for the bank.

### 4. Zero-Internet Architecture (AES Encrypted Store-and-Forward)
Security is applied *before* storage, not just during transmission.
* **Immediate Encryption:** As soon as data is captured, the payload is encrypted using **AES-256** via `services/SecurityService.ts`.
* **Secure Storage:** The encrypted blob is then stored locally in `services/OfflineStorage.ts`.
* **Auto-Sync:** The system listens for network restoration and automatically pushes the encrypted payload to the KWAP cloud secure enclave.

---

## 🏗️ Technical Architecture (Prototype)
* **Frontend Framework:** Next.js 14 (App Router) & Tailwind CSS.
* **AI/ML Engine:** `face-api.js` / TensorFlow.js (running locally in browser) for Face Liveness and Landmark Detection.
* **Encryption Layer:** `crypto-js` implementation of AES-256.
* **Offline Logic:** Custom `useSyncManager.ts` hook handles the connection listeners (`window.addEventListener('online')`) to trigger immediate syncing.

## ⚠️ Note to Judges
To respect data privacy (PDPA), this prototype uses **Simulated Data**.
* **Hardware Simulation:** Loading delays represent the processing time of the rugged tablet's smart card reader.
* **Mock Database:** No real citizen data is stored.

---

## ⚙️ Settings & Configuration (READ THIS FIRST)
Before starting the demo, please access the **Settings Menu** (Gear Icon) to configure the prototype for the judging environment.

### 1. 🌍 Bilingual Support
* **Option:** Toggle between **English (EN)** and **Bahasa Melayu (BM)**.
* **Context:** The interface fully adapts to the local language, demonstrating readiness for rural deployment.

### 2. 🛡️ Developer Mode (Location Bypass) - **CRITICAL**
* **Why:** The app uses **Real GPS Geofencing**. It normally blocks login if you are not physically located in the specific rural village (e.g., *Pos Gob, Kelantan*).
* **Action:** Enable **"Bypass Location Check"** in Settings. This allows you to log in from the hackathon venue without GPS errors.

### 3. 📶 Network Simulation Tool
* **Why:** To easily test the "Offline-First" capability without disabling your laptop's actual WiFi.
* **Action:** Enable **"Allow Manual Offline Toggle"**. You can now click the **Network Indicator (Green/Red icon)** at the top right to instantly toggle the app's connection state.

---

## 🚀 Getting Started (Live Demo Flow)

### 🔴 The Judge Challenge: Connectivity Test
**We invite judges to test the robustness of our "Offline-First" logic:**

1.  **STEP 1: GO DARK.** Click the **Network Indicator** (top right) to force the app into **Offline Mode** (Red).
2.  **STEP 2: PERFORM SERVICE.** Proceed with the verification below. Note that the transaction completes successfully and saves to the "Pending Queue".
3.  **STEP 3: RECONNECT.** Click the **Network Indicator** again to go **Online** (Green).
4.  **STEP 4: WATCH THE MAGIC.** Without clicking anything else, observe the "Sync Status". The system detects the signal and **immediately** uploads the encrypted payload to the server.

### Phase 1: The Visit (Offline)
1.  **Select Location:** Choose a deep rural village (e.g., *Pos Gob, Kelantan*).
2.  **Agent Login:** (`ID: KK-0012-P` | `Pass: pension123`)
3.  **Proof of Life:**
    * Click **"Read MyKad"** to simulate chip insertion.
    * *Option A:* **"Scan Thumbprint"** (Standard).
    * *Option B:* **"Face Verification"** (Fallback for faded prints).
4.  **Result:** System generates a localized "Alive Token".

### Phase 2: The Withdrawal (Digital Warrant)
1.  Navigate to **"Wakil Authorization"**.
2.  **Wakil Declaration:** The pensioner declares their appointed representative.
3.  **Biometric Consent:** Pensioner signs off on the declaration.
4.  **Encryption:** The system generates a **72-Hour Encrypted QR Token** for the runner.