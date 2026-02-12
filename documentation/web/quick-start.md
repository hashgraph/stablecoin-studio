---
id: quick-start
title: "🚀 Introduction"
sidebar_label: "🚀 Introduction"
---

> **Web UI Documentation**
>
> [🚀 Getting Started](./quick-start.md) • [🏗️ Architecture & Stack](./architecture.md) • [🕹️ Usage & Workflows](./usage.md) • [⚙️ Configuration](./configuration.md) • [🛡️ Security](./security.md)
---

# 🚀 Getting Started with the Web DApp

The **Stablecoin Studio Web Interface** is a comprehensive **React-based DApp** that allows issuers and administrators to manage the entire lifecycle of a stablecoin without writing code.

It serves as the visual layer on top of the Stablecoin Studio SDK, providing intuitive dashboards for treasury management, compliance, and role assignment.

## 📦 Prerequisites

Before running the project, ensure you have:

* **Node.js** (v18 or higher)
* **A Hedera Wallet Extension** (HashPack or Blade Wallet) installed in your browser.
* A **Hedera Testnet Account** (if running in dev mode).

## ⚡ Installation & Run

1.  **Install Dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

2.  **Configure Environment**
    Copy the example environment file and fill in your network details (see [Configuration](./configuration.md)).
    ```bash
    cp .env.example .env
    ```

3.  **Start Development Server**
    ```bash
    npm run start
    ```
    Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## 🏗️ Project Overview

This project is "mounted" using a standard **React Single Page Application (SPA)** architecture, heavily relying on **Context Providers** to manage the global state of the Wallet Connection and the SDK Instance.

* **Framework**: React (Create React App / Vite)
* **Styling**: CSS Modules / Tailwind (depending on version)
* **State Management**: React Context & Hooks
* **Blockchain Interaction**: Stablecoin Studio SDK + HashConnect
