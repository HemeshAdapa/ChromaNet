# Deep Learning Based Image Colorization using AutoEncoder and GAN

This is a full-stack web application designed for a final year project focusing on image colorization. The application uses a React frontend, Node.js/Express backend, and a PyTorch + FastAPI machine learning server.

## Features

- **Modern Glassmorphism UI**: Beautiful, engaging visuals using raw CSS and customized animations. No Tailwind classes used!
- **React Frontend**: Client-side routing with `react-router-dom`, drag & drop uploads, visual feedback during processing.
- **Node.js/Express Backend**: Intermediary server that handles multipart form data uploads, stores them momentarily using `multer`, and streams them to the Python API.
- **Python FastAPI ML Server**: Houses a fully mocked but structurally accurate PyTorch layout for an AutoEncoder. It simulates inference and returns an image tensor post-processed into an RGB image.

---

## Instructions to Run Locally

You need three terminal windows open to run all sections of the application seamlessly. Open your terminal in the `final project` folder and follow these commands:

### 1. Run Machine Learning API (Python/FastAPI)
The backend model API runs on `http://127.0.0.1:8000`.

```powershell
cd ml_api
# Activate the virtual environment
.\venv\Scripts\activate
# Start the API
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Run Backend Server (Node.js/Express)
The middleware backend processes HTTP file chunks and communicates between the PyTorch model and React UI. It runs on `http://localhost:5000`.

```powershell
cd backend
npm run dev
# If you don't have nodemon configured in package.json, run:
node server.js
```

### 3. Run Frontend Server (React/Vite)
The UI client runs on `http://localhost:5173`.

```powershell
cd frontend
npm run dev
```

---

## Architectural Breakdown

### `frontend/`
- `src/App.jsx`: Hosts the Navigation layer, Footer, and the React Router setup.
- `src/index.css`: Heart of the application aesthetics. All blob background animations, gradients, responsive layouts, text gradients, and glassmorphism definitions are stored here.
- `src/pages/`: Contains isolated components for `Home`, `About`, `Upload`, and `Result` pages.

### `backend/`
- `server.js`: Standard express configuration with `multer` caching handling for binary multipart stream reading, routed to axis requests towards FastAPI.

### `ml_api/`
- `main.py`: Contains a structurally viable class `ColorizationAutoEncoder` simulating PyTorch capabilities! Replace the inner logic inside `predict` endpoint directly when integrating your final trained `.pth` weight dictionary.
