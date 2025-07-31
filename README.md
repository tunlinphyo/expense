# 💰 Expense Tracker Web App

A modern, lightweight expense tracking web application built with TypeScript, Vite, Web Components, and Firebase. This project helps you manage and visualize your spending easily and efficiently.

---

## 🚀 Live Website

[🔗 View the site](https://tlp-expense.web.app/)

---

## 📦 Tech Stack

- ⚡ Vite – Fast and modern frontend tooling
- 🔷 TypeScript – Scalable and typed JavaScript
- 🔥 Firebase – Hosting, environment configuration, and more
- 📁 Firestore Database – Realtime NoSQL database for structured data and syncing across devices
- 🧩 Web Components – Lightweight custom elements architecture

## 🚀 Features

- Add, edit, and delete expense entries
- Categorized spending view
- Responsive and accessible design

## 🛠️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/expense.git
cd expense
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment

Go to the [Firebase Console](https://console.firebase.google.com/), create a Firebase project, and enable the Firestore Database.

Create a `.env.local` file in the project root and add your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
```

### 4. Start Development Server

```bash
npm run dev
```

### 5. Build for Production

```bash
npm run build
```

### 6. Deploy to Firebase

```bash
firebase deploy
```

## 📁 Project Structure

```
expense/
├── index.html          # Main HTML file
├── public/             # Static assets
├── src/                # Source files (TypeScript, components, logic)
├── vite.config.js      # Vite config
├── tsconfig.json       # TypeScript config
├── firebase.json       # Firebase config
├── .env.local          # Environment variables
└── ...
```

## 🙋‍♂️ About the Author

**Tun Lin Phyo**
Frontend Engineer and system-level UI builder based in Tokyo 🇯🇵.
He specializes in **Web Components**, **custom reactive architectures**, and **performance-first web applications** — all without relying on heavy frameworks.

- 💻 Passionate about UI/UX systems, clean architecture, and modular design
- 🔧 Builds projects with Vite, custom stores, and native browser APIs
- 🌐 [Portfolio Website](https://tunlinphyo.com)

---

## 📝 License

MIT License

---