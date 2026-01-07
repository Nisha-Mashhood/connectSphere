🌐 ConnectSphere
ConnectSphere is a full-stack web application that connects learners and mentors through mentorship, communication, and collaboration.
The project is built using Repository Architecture to keep the code clean, organized, and easy to maintain.

🚀 Features
👤 User & Mentor Management
User and mentor signup and login
Role-based access (User, Mentor, Admin)
Profile management with skills, experience, and availability

🤝 Mentorship & Collaboration
Send and accept mentorship requests
Paid mentorship using Stripe
One-to-one and group collaborations

💬 Communication
Real-time chat using Socket.IO
Typing indicators
File and media sharing
Notifications

📞 Video Calling
One-to-one video calling using WebRTC
Group video calling using Jitsi

🗂 Tasks & Groups
Task creation and tracking
Group management
Notifications based on user activity

🛠 Admin Panel
Manage users and mentors
Manage collaborations and payments
View reports and analytics
Manage reviews and feedback

🏗 Project Architecture
The project follows Repository Architecture.
Backend Architecture
Controllers handle API requests
Services contain business logic
Repositories handle database operations
DTOs are used to send safe data to the frontend
Dependency Injection is handled using Inversify

Frontend Architecture
Modular Reusable React components
Centralized API handling using axios
State management using Redux
Fully typed using TypeScript

🧰 Libraries & Services Used
Frontend
React
TypeScript
Vite
Redux & Redux Persist
NextUI
Recharts
Axios (API handling)
React Hook Form + Yup (form validation)
JWT (authentication handling)
WebRTC (one-to-one video calls)
Jitsi (group video calls)

Backend
Node.js
Express
TypeScript
MongoDB Atlas
Repository Architecture
Inversify (Dependency Injection)
JWT Authentication
Socket.IO (real-time chat)
Stripe (payments)
Redis Cloud (OTP handling)
Multer & Cloudinary (file uploads)
Winston Logger (server logging)
BetterStack (cloud logging)
Google Authentication
GitHub Authentication

📁 Project Structure
connectSphere/
├── client/        # Frontend (React)
├── backend/       # Backend (Node + Express)
├── README.md

⚙️ Environment Variables (Example Only)

Backend (backend/.env)
PORT=3000
NODE_ENV=development

MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret

ADMIN_EMAIL=admin_email
PASSKEY_ADMIN=admin_passkey

BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/github/callback

EMAIL_SERVICE=gmail
EMAIL_USER=your_email
EMAIL_PASS=your_email_password

CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

STRIPE_SECRET_KEY=your_stripe_secret_key

REDIS_URL=your_redis_cloud_url

BETTERSTACK_LOG_TOKEN=your_betterstack_token
BETTERSTACK_LOG_ENDPOINT=your_betterstack_endpoint
LOG_LEVEL=debug

VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_EMAIL=your_email

Frontend (client/.env)
VITE_BACKEND_URL=http://localhost:3000/api

VITE_GOOGLE_CLIENT_ID=your_google_client_id

VITE_GITHUB_CLIENTID=your_github_client_id
VITE_GITHUB_REDIRECTURI=http://localhost:5173/github/callback
VITE_GITHUB_URL=https://github.com/login/oauth/authorize

VITE_STRIPE_KEY=your_stripe_public_key
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key

ENV_MODE=development

▶️ How to Run the Project Locally
Step 1: Clone the Repository
git clone https://github.com/Nisha-Mashhood/connectSphere.git
cd connectSphere

Step 2: Run Backend
cd backend
npm install
npm run dev

Step 3: Run Frontend
cd client
npm install
npm run dev

🌍 Deployment
Frontend: Vercel
Backend: 
Database: MongoDB Atlas

Frontend and backend are designed to be deployed separately.

⭐ Key Highlights
Repository Architecture
Dependency Injection using Inversify
Secure authentication with JWT and OAuth
OTP handling using Redis Cloud
Centralized logging with Winston and BetterStack
Real-time chat and video calling
Fully validated forms using React Hook Form and Yup
Payment integration using Stripe

👩‍💻 Author

Nisha Mashhood
Full-Stack MERN Developer
GitHub: https://github.com/Nisha-Mashhood

📝 Final Note
ConnectSphere is built as a real-world application, focusing on clean code, proper architecture, and scalable features.
