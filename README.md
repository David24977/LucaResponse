# LucaResponse Frontend

React application that interacts with an AI-powered backend to generate intelligent responses to user queries.

## Features

* Simple and clean UI
* Real-time query interaction with AI
* Fetch API integration with backend
* Environment-based configuration (Vite)
* Deployed on Vercel

---

## Environment Variables

Create a `.env` file:

```env
VITE_API_URL=https://your-backend-url.onrender.com
```

---

## Run locally

```bash
npm install
npm run dev
```

---

## Build

```bash
npm run build
```

---

## Deployment

* Frontend: Vercel
* Backend: Render

---

## API Integration

```javascript
const BASE_URL = import.meta.env.VITE_API_URL;

fetch(`${BASE_URL}/ai/query`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ query }),
});
```

---

## Tech Stack

* React
* Vite
* JavaScript (ES6+)
* Fetch API

---

## Notes

This frontend connects to a Spring Boot backend that integrates with Groq (Llama 3).

---

## Author

David – Backend Developer (Java / Spring Boot)
