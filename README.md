# Media Platform Backend

A simple backend API built with **Node.js (Express)** for managing media assets.  
Implements JWT-based admin authentication and provides secure, time-limited streaming links.

---

## Features

- **Admin Signup & Login** (JWT authentication)
- **Add Media Metadata** (title, type, file URL)
- **Generate Secure 10-Minute Stream Links**
- **MongoDB Database Integration**
- **Media Asset, Admin User, and View Log Schemas**

---

## Tech Stack

- **Backend:** Node.js, Express
- **Database:** MongoDB (Mongoose)
- **Authentication:** JWT
- **Environment Config:** dotenv

---

## API Endpoints

### 1. **Signup**
**POST** `/auth/signup`  

**Body:**
```json
{
  "email": "admin@example.com",
  "password": "securepassword"
}
```

---

### 2. **Login**
**POST** `/auth/login`  

**Body:**
```json
{
  "email": "admin@example.com",
  "password": "securepassword"
}
```

---

### 3. **Add Media Metadata** (Authenticated)
**POST** `/media`  

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Body:**
```json
{
  "title": "Sample Video",
  "type": "video",
  "file_url": "media_files/sample.mp4"
}
```

---

### 4. **Generate Stream URL**
**GET** `/media/:id/stream-url`  

**Example Response:**
```json
{
  "stream_url": "http://localhost:5000/stream/689dabc94991709d196d1fa1?expires=1755164362&sig=e94e4e3cad4d510d74fb8f51268843c1230e72ff786a2040ff44b0b3c432f0b9"
}
```

---

## Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/<your-username>/media-platform-backend.git
cd media-platform-backend
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Create `.env` File
```env
PORT=5000
MONGO_URI=<your-mongodb-uri>
JWT_SECRET=supersecretkey
BASE_STREAM_URL=http://localhost:5000/stream
```

### 4️⃣ Run the Server
```bash
npm start
```
Server will start at: **http://localhost:5000**

---

## Folder Structure
```
media-platform-backend/
│-- src/
│   │-- models/         # Mongoose Schemas
│   │-- routes/         # API Routes
│   │-- middleware/     # Auth middleware
│   │-- server.js       # Entry point
│-- media_files/        # Local media storage
│-- .env                # Environment variables
│-- package.json
│-- README.md
```

---

## Notes
- This project only stores **media metadata**, not the actual media file in DB.
- The `stream_url` endpoint simulates a secure media link valid for **10 minutes**.
- MongoDB must be running and accessible via `MONGO_URI`.

---

## Author
**Aman Bhatt**  
Backend Developer | Node.js Enthusiast