# Final Assessment — Project Documentation

## Project title
**Futuristic Feedback Intelligence System**

## Problem statement
Organizations need a secure channel for users to submit categorized feedback while protecting identity. Management must review, prioritize, and track resolution without exposing personal data.

## Tech stack
| Layer | Technology |
|-------|------------|
| Frontend | HTML5, CSS3 (glassmorphism), Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose ODM |
| Auth | JWT, Bcrypt, Email OTP (Nodemailer) |
| Deployment | Render / Railway (single web service) |

## Software engineering practices demonstrated
- **Separation of concerns**: `/server` (API) vs `/public` (UI)
- **RESTful API** design with proper HTTP status codes (400, 401, 403, 404, 409)
- **Environment configuration** via `.env` (secrets not in code)
- **Role-based access control** (User vs Management)
- **Server-side business rules** (15-minute edit lock, OTP verification, admin secret)
- **Data privacy**: anonymous display in management portal

## Core features
1. User registration with **name**, email, password, OTP email verification
2. Management registration with **access code** protection
3. JWT login / logout
4. Feedback: category, priority, title, message
5. **15-minute edit window** (enforced on PUT route)
6. Management portal: anonymous feedback, status workflow (Open → In progress → Resolved)
7. Analytics dashboard: counts by category and status
8. Password visibility toggle (UX)

## API endpoints (summary)
| Method | Route | Access |
|--------|-------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/verify-otp` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/feedback` | User (JWT) |
| GET | `/api/feedback` | User (JWT) |
| PUT | `/api/feedback/:id` | User (JWT, 15 min rule) |
| GET | `/api/admin/feedback` | Management |
| GET | `/api/admin/stats` | Management |
| PATCH | `/api/admin/feedback/:id/status` | Management |

## Security highlights (for viva)
- Passwords hashed with **bcrypt** (never stored plain text)
- **JWT** for stateless sessions
- **OTP** proves email ownership before account activation
- **ADMIN_REGISTER_SECRET** prevents unauthorized admin signup
- Management API **strips user identity** — feedback shown as Anonymous
- MongoDB connection string and secrets in **environment variables**

## Demo script (5 minutes)
1. Register as **User** (name + email + OTP)
2. Submit feedback with category + priority
3. Show live 15-minute countdown and edit
4. Register/login as **Management** (access code)
5. Show anonymous portal, change status to Resolved, filter by category
6. Show analytics stats panel

## Future enhancements (optional mention)
- PDF/CSV export for management
- Push notifications on status change
- Sentiment analysis on feedback text
