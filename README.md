# MEDLINGO Premium — Frontend + Backend

A beginner-friendly, responsive website starter with a premium dark-teal design and a small Express API.

## Requirements
- Node.js (npm is included)
- VS Code (recommended)

## Run on Windows
1. Extract the ZIP.
2. Open the extracted `MEDLINGO_Premium` folder in VS Code.
3. Choose **Terminal → New Terminal**.
4. Run `npm install`.
5. Run `npm start`.
6. Open http://localhost:3000 in Chrome or Edge.
7. Keep the terminal open while testing. Press Ctrl+C to stop the server.

## Project structure
- `public/index.html` — frontend layout
- `public/style.css` — design and responsive styles
- `public/app.js` — chat and API connection
- `server.js` — Express backend
- `package.json` — project setup

## API
- `GET /api/health`
- `POST /api/symptoms` with JSON such as `{"symptom":"I have a headache"}`

## Health and privacy notice
This is a student/demo project using simple keyword matching. It is not a real AI model or a clinically validated triage system and cannot diagnose or rule out disease. Avoid entering names, contact details, or other personal health information. For severe or rapidly worsening symptoms, seek urgent medical care.
