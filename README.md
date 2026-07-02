# 📚 E-Library Management System

A full-stack web application that provides students and readers with an interactive digital library to browse, read, and organize PDF resources online.

🌐 **Live Demo:** https://e-library-management.netlify.app

---

# 📖 Overview

The **E-Library Management System** is designed to provide a seamless digital reading experience. Users can register, log in securely, browse academic resources, read PDFs online, maintain reading history, create favorites and reading lists, receive notifications, and personalize their reading experience.

The application follows a modern client-server architecture with a responsive frontend, RESTful backend, and MySQL database.

---

# ✨ Features

## 🔐 User Authentication
- User Registration
- Secure Login
- Forgot Password
- Reset Password
- Logout
- Session-based access control

## 📚 Library Features
- Browse Academic Collection
- Categories
- New Releases
- Trending PDFs
- Recommended PDFs
- Browse Books
- Search PDFs

## 📖 PDF Reader
- Read PDFs inside the browser
- Continue Reading
- Reading Progress Tracking
- Reading History
- Download PDFs

## ❤️ Personal Library
- Favorites
- Reading List
- Continue Reading
- Reading History

## 🔔 Notification System
- Welcome Notification
- Reading Reminders
- Reading List Reminders
- PDF Completion Notifications

## 👤 User Profile
- Edit Profile
- Upload Avatar
- Remove Avatar

## ⚙️ Reader Settings
- Remember Last Page
- Reading Progress Bar
- Bookmark Support
- Reader Preferences

---

# 🛠️ Tech Stack

## Frontend
- HTML5
- CSS3
- JavaScript

## Backend
- Node.js
- Express.js

## Database
- MySQL (Railway)

## Deployment
- Frontend: Netlify
- Backend: Render

---

# 📂 Project Structure

```
E-Library-Management-System/
│
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── home.html
│   ├── reader.html
│   ├── categories.html
│   ├── academic_collection.html
│   ├── favorites.html
│   ├── reading_history.html
│   ├── readinglist.html
│   ├── notifications.html
│   ├── profile.html
│   ├── contributors.html
│   ├── new_releases.html
│   ├── trending_pdfs.html
│   ├── because_you_read.html
│   ├── browse_books.html
│   ├── css/
│   ├── js/
│   └── images/
│
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── importPDFs.js
│   ├── avatars/
│   ├── pdf_library/
│   └── .env (not included)
│
└── README.md
```

---

# 🗄️ Database Tables

- users
- pdfs
- categories
- favorites
- reading_history
- reading_list
- notifications
- settings

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/VegiHarshitha58/E-Library-Management-System.git
```

## Backend Setup

```bash
cd backend
npm install
npm start
```

## Frontend

Open `index.html` in a browser or deploy the `frontend` folder using Netlify.

---

# 🔑 Environment Variables

Create a `.env` file inside the **backend** folder.

```env
DB_HOST=your_database_host
DB_PORT=3306
DB_USER=your_database_username
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
PORT=5000
```
---

# 🌟 Key Highlights

- Full-stack web application
- Secure user authentication
- Responsive user interface
- RESTful API integration
- Reading history tracking
- Continue reading functionality
- Favorites and Reading List
- Notification system
- User profile management
- Cloud database deployment
- Live production deployment

---

# 🚀 Future Enhancements

- AI-based PDF Recommendations
- Email Verification
- PDF Annotation & Highlighting
- Admin Dashboard
- Advanced Search Filters
- Dark/Light Theme Toggle
- PDF Upload Approval Workflow

---

# 👩‍💻 Developer

**Harshitha Vegi**

B.Tech Computer Science Engineering

Andhra University College of Engineering for Women

GitHub: https://github.com/VegiHarshitha58

---

# 📄 License

This project is licensed under the MIT License.

---

## ⭐ If you found this project useful, consider giving it a star on GitHub!
