
# Dealora

**Team:** Hazymustards  

## 🚀 Getting Started  

1. Install dependencies:  
   ```sh
   npm install
   ```
2. Run the project:  
   ```sh
   npm run dev
   ```
No need to configure the database since we have **Supabase** deployed.  

---

## 📂 Repository Structure  

```
CAMPUSDEALHUB  
│── client/               # Frontend (React + TypeScript)  
│   ├── src/  
│   │   ├── components/   # Reusable UI components  
│   │   ├── hooks/        # Custom React hooks  
│   │   ├── lib/          # Utility functions  
│   │   ├── pages/        # App pages  
│   │   ├── App.tsx       # Main App component  
│   │   ├── main.tsx      # React entry point  
│   │   ├── index.css     # Global styles  
│   │   ├── index.html    # Root HTML file  
│   ├── public/           # Static assets  
│── server/               # Backend (Node.js + Express)  
│   ├── auth.ts           # Authentication logic  
│   ├── db.ts             # Database connection (Supabase)  
│   ├── routes.ts         # API routes  
│   ├── storage.ts        # File storage handling  
│   ├── vite.ts           # Server setup  
│── shared/               # Shared resources  
│── uploads/              # File uploads  
│── .gitignore            # Git ignore rules  
│── .env                  # Environment variables  
│── .replit               # Replit config  
```

---

## ✨ About the Project  

Dealora is a **web and mobile platform** for seamless second-hand item trading. The web app is wrapped in a **WebView** for Android and iOS, allowing a native-like experience.  

### Features:  
✔ **Create Listings** – Users can post items for sale.  
✔ **View Listings** – Browse all available items in a beautiful UI.  
✔ **Send Purchase Requests** – Interested buyers can send requests with custom messages.  

This project combines **React (TypeScript) for the frontend**, **Node.js (Express) for the backend**, and **Supabase (PostgreSQL) for data management** to create a smooth and responsive marketplace. 🚀  

```
