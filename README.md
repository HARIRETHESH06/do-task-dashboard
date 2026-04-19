# 📋 DoTask: Task & Reporting Management System

DoTask is a modern, full-stack Task and Reporting Management System built to streamline organizational workflows. It replaces scattered emails and spreadsheets with centralized task assignments, progress tracking, and secure document reporting.

---

## 🛠️ Technology Stack Used

This project was built from the ground up as a complete Full-Stack web application, utilizing modern industry-standard technologies for both the frontend and backend.

### Frontend (Client-Side)
* **React.js (v18):** Core UI library for building dynamic, single-page application interfaces.
* **TypeScript:** Provides strict type safety to prevent runtime errors and improve code quality.
* **Vite:** Next-generation frontend tooling for ultra-fast compilation and hot-module replacement (HMR).
* **Tailwind CSS:** Utility-first CSS framework for rapid, highly-customized, and responsive styling.
* **Shadcn UI & Radix UI:** Accessible, unstyled UI components configured for a professional, cohesive design system.
* **React Router (v6):** Handles client-side routing and protected routes for secure navigation.
* **React Query (TanStack Query):** Manages asynchronous state, caching, and background data fetching.
* **Lucide React:** Icon library for clean, modern iconography.

### Backend (Server-Side)
* **Node.js:** JavaScript runtime environment allowing for scalable, event-driven server architecture.
* **Express.js:** Minimal and flexible web application framework serving the RESTful API.
* **MongoDB:** NoSQL database used for flexible, document-based data storage.
* **Mongoose:** Object Data Modeling (ODM) library for MongoDB and Node.js, providing schema validation.
* **JSON Web Tokens (JWT):** Secure, stateless user authentication and authorization.
* **Bcrypt.js:** Cryptographic hash function for secure password hashing.
* **Multer:** Middleware for handling `multipart/form-data`, specifically used for securely uploading PDF reports.

### Deployment & Hosting
* **Netlify:** Hosting the Vite/React frontend with global CDN distribution.
* **Render:** Hosting the Node.js/Express backend API.
* **MongoDB Atlas:** Cloud-hosted MongoDB cluster.

---

## ✨ Core Features & Functionality

### 1. Role-Based Access Control (RBAC)
The system strictly enforces three hierarchical roles to ensure data privacy and organizational structure:
* **Admin:** Full control over the system. Can manage users (activate, deactivate, change roles, delete) and view all global data.
* **Manager:** Can create tasks, assign work to specific employees, monitor global progress, and view all system activity.
* **Employee:** Restricted view. Can only see tasks directly assigned to them, update their own task statuses, and submit their own reports.

### 2. Comprehensive Task Management
* **CRUD Operations:** Create, Read, Update, and Delete tasks.
* **Granular Details:** Tasks include titles, descriptions, priorities (Low/Medium/High), statuses (Pending/In Progress/Completed), deadlines, and assigned personnel.
* **Filtering:** Filter tasks instantly by status, priority, or assignee. 

### 3. Reporting & File Uploads
* When concluding a major task, employees can submit official Reports.
* **PDF Attachments:** The system natively supports uploading physical PDF documents, processed by the backend and saved securely on the server.

### 4. Interactive Dashboard
* **Real-Time Statistics:** Dynamic visual counters summarizing total tasks, pending work, and completed assignments.
* **Activity Feed:** A scrolling log of all system actions (e.g., "John logged in", "Sarah submitted a report", "Admin updated user").

### 5. UI/UX Enhancements
* **Theme Management:** Seamless toggling between Light and Dark mode using `next-themes`.
* **Fully Responsive:** Usable on desktops, tablets, and mobile devices.
* **Toast Notifications:** Real-time success and error feedback popups using `sonner`.

---

## 🏗️ Project Architecture

The project adheres to a strict separation of concerns:

1. **Routing Layer (`react-router`):** Intercepts URL requests and renders the appropriate React Page Component. Protects secure routes via an Auth wrapper.
2. **Context Layer (`AuthContext`):** Manages global authentication state, storing the JWT in localStorage to persist login sessions.
3. **Service Layer (`api.ts`):** Abstracts all backend HTTP requests into clean, reusable functions (e.g., `taskApi.getAll()`), automatically injecting the Authorization bearer token into request headers.
4. **Backend Controller Layer (`controllers/`):** Express middleware that processes incoming requests, interacts with the MongoDB database using Mongoose schemas, and returns standardized JSON responses.

---

*This README was generated to serve as an official project overview and architectural report.*
