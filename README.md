# 📮 Pencen Mobile (MyDigital ID Integration)
**NexG Godam Lah! 2.0 - Team Leveling**

## 💡 Overview
Pencen Mobile is an **Offline-First Identity Verification System** designed for Pos Malaysia agents to disburse pensions to bedridden elderly citizens in rural areas (Sabah/Sarawak).

It replaces manual paperwork with a secure **"Tap-and-Verify"** protocol using the National ID (MyKad) and Biometric Proof of Life.

## 🛠️ Technical Architecture (Prototype)
This proof-of-concept simulates the hardware-software handshake required for field operations.

* **Frontend:** Next.js 14 (App Router), Tailwind CSS, Framer Motion.
* **Security Protocol:** Simulates a 3-factor authentication flow:
    1.  **Agent Auth:** Validates Agent ID (Mocked).
    2.  **Possession Factor:** Simulates NFC reading of the MyKad chip.
    3.  **Inherence Factor:** Simulates Biometric Thumbprint matching against the chip.
* **Geolocation:** Simulates GPS fencing to ensure the agent is physically at the registered address.

## ⚠️ Note to Judges
To respect data privacy (PDPA) and ensure stability during the demo, this prototype uses **Simulated Data**.
* **Hardware Simulation:** The 2.5s delay during scanning represents the latency of the `pyscard` / smart card reader hardware.
* **Mock Database:** No real citizen data is stored or accessed.

## 🚀 Getting Started
1.  Login with Agent ID: `POS-MY-9921`
2.  Click "Read MyKad" to simulate the NFC tap.
3.  Click "Acquire GPS" to verify location.
4.  Click "Scan Thumbprint" to complete the Proof of Life.