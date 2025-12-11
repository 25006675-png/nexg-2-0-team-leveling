# 🏡 MyDigital Kampung (National ID Innovation)
**NexG Godam Lah! 2.0 - Team Leveling**

## 💡 Overview
**MyDigital Kampung** is an **Offline-First Identity Verification System** designed to decentralize the National Registration infrastructure. It empowers gazetted **Ketua Kampung (Village Heads)** to function as mobile agents, bringing government services directly to the doorstep of bedridden and rural "Scheme B" pensioners.

It replaces the "Bureaucratic Trap" (medical letters & manual forms) with a secure **"Direct Chip Verification"** protocol, turning the physical MyKad into a digital proof-of-life key.

## 🛠️ Technical Architecture (Prototype)
This proof-of-concept simulates the **Secure G2G (Government-to-Government)** handshake required for field operations in "Zone C" (zero internet areas).

* **Frontend:** Next.js 14 (App Router), Tailwind CSS, Framer Motion.
* **Security Protocol:** Simulates a military-grade 3-factor authentication flow:
    1.  **Agent Trust:** Validates the Authorized Officer (Ketua Kampung).
    2.  **Possession Factor:** Simulates ISO-7816 reading of the MyKad chip (Raw Minutiae Extraction).
    3.  **Inherence Factor:** Simulates Biometric Thumbprint matching locally on the device (Match-on-Host).
* **Geolocation:** Simulates GPS geofencing to ensure the agent is physically at the pensioner's registered home address.

## ⚠️ Note to Judges
To respect data privacy (PDPA) and ensure stability during the demo, this prototype uses **Simulated Data**.
* **Hardware Simulation:** The loading delays represent the processing time of the rugged tablet's smart card reader.
* **Mock Database:** No real citizen data is stored or accessed.

## 🚀 Getting Started (Live Demo)
Follow these steps to experience the "First Mile" verification flow:

1.  **Select Location:** Choose any village from the dropdown menu (e.g., *Kampung Bayangan*) to initialize the GPS lock.
2.  **Agent Login:**
    * **Agent ID:** `KK-0012-P`
    * **Password:** `pension123`
3.  **Perform Verification:**
    * Click **"Read MyKad"** to simulate the chip insertion.
    * Click **"Scan Thumbprint"** to generate the cryptographic "Proof of Life" token.