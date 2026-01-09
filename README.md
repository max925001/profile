# Profile Manager App

**Resume Link**: [Download My Resume (PDF)](https://drive.google.com/file/d/1VTYLzAtFU5khXk_-EV7JWmxPeVMG7gOX/view?usp=sharing)  
**Project Demo Video**: [Watch Demo on YouTube](https://drive.google.com/file/d/1uXOwTSXLu_tzHFP3Lw3JgEzJDtUlD9xU/view?usp=sharing)

## Introduction

**Profile Manager** is a full-stack web application designed for developers to create, manage, and showcase their professional profiles in a clean, modern interface.

It allows users to:
- Register and securely log in
- Manage personal details, skills, education, projects, work experience, and social links
- Search their own skills instantly
- View GitHub stats automatically (if GitHub username is provided)
- Fully responsive dark-themed UI built with Tailwind CSS

Perfect for personal portfolios, job applications, or sharing your developer journey.

**Live Demo**: (https://profile-five-ebon.vercel.app/login)  




## Features

- User authentication (Signup / Login / Logout)
- Complete CRUD operations for:
  - Skills
  - Education
  - Projects (with live & repo links)
  - Work Experience
  - Social Links (GitHub, LinkedIn, Portfolio)
- Real-time skill search with debounced input
- GitHub data auto-fetch (avatar, bio, repos, stars, followers)
- Loading states and success/error toasts
- Responsive design with Tailwind CSS
- Secure JWT-based authentication
- Clean, modern dark UI

## Tech Stack

### Frontend
- React.js
- Redux + Redux Toolkit
- React Hot Toast (notifications)
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs for password hashing

## Folder Structure

profile/
├── backend/
│   ├── controllers/          # Route handlers
│   ├── middleware/           # Auth middleware
│   ├── models/               # Mongoose schemas (User)
│   ├── routes/               # API routes             
│   ├── config/               # DB connection
│   ├── .env                  # Environment variables
│   ├── app.js
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Header, Footer
│   │   ├── helpers/      
│   │   ├── pages/            # ProfilePage
│   │   ├── redux/            # authSlice, store
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   └── .env
│
├── README.md
└── .gitignore




## Local Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (Local or MongoDB Atlas)
- Git

### Backend Setup

### Step 1: Clone and Setup Backend

```bash
git clone https://github.com/max925001/profile.git
cd profile
cd backend
npm install
npm run dev
```
### New Terminal
```bash
cd profile
cd frontend
npm install
npm run dev
```


### Environment variable

PORT=5000
MONGO_URI=mongodb atlas url
JWT_SECRET=jwt secret key
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

### API Testing (cURL Examples)

### Signup 

curl -X POST http://localhost:5000/auth/signup \
-H "Content-Type: application/json" \
-d '{
  "name": "Priya Sharma",
  "email": "priya@example.com",
  "githubUsername": "priyasharma",
  "password": "securepass123"
}'


### Login 

curl -X POST http://localhost:5000/auth/login \
-H "Content-Type: application/json" \
-d '{
  "email": "priya@example.com",
  "password": "securepass123"
}'



