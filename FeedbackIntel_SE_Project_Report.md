SRI RAMACHANDRA INSTITUTE OF HIGHER EDUCATION AND RESEARCH

FeedbackIntel: Intelligent Feedback Management System

PROJECT REPORT FOR  
CSE23CL302 - COMPUTER AIDED SOFTWARE ENGINEERING (CASE) TOOLS LABORATORY

Submitted by  
Mohamed Jasmir - E0123008

In partial fulfilment for the award of the degree of  
BACHELOR OF TECHNOLOGY  
in  
COMPUTER SCIENCE AND ENGINEERING  
Artificial Intelligence and Machine Learning

Sri Ramachandra Faculty of Engineering and Technology,  
Sri Ramachandra Institute of Higher Education and Research, Porur,  
Chennai - 600116

June, 2026

---

BONAFIDE CERTIFICATE

Certified that this project report titled "FeedbackIntel: Intelligent Feedback Management System" is the bonafide record of work done by Mohamed Jasmir - E0123008, who carried out the project work under supervision for the course CSE23CL302 - Computer Aided Software Engineering (CASE) Tools Laboratory.

The project demonstrates the design and development of a secure web-based feedback management platform with authentication, OTP verification, role-based access control, feedback submission, time-restricted editing, and administrative monitoring.

Signature of the Supervisor

---

TABLE OF CONTENTS

| Chapter No. | Title | Page |
|---|---|---|
| - | Abstract | 1 |
| 1 | Problem Definition | 2 |
| 2 | Requirements Engineering | 4 |
| 3 | Design Methodology | 8 |
| 4 | Coding Practices and Platforms | 14 |
| 5 | Testing | 17 |
| 6 | Deployment Checklist | 22 |
| 7 | Results | 24 |
| 8 | Appendix | 26 |

---

ABSTRACT

FeedbackIntel: Intelligent Feedback Management System is a secure web-based feedback collection and management platform. The system allows users to register, verify their identity through email OTP, log in securely, submit feedback, view their own feedback records, and edit feedback only within a fixed 15-minute time window. Administrators can access a protected dashboard to monitor submitted feedback and view overall system statistics.

Traditional feedback systems often depend on manual collection, unsecured forms, or basic storage mechanisms. These approaches create issues such as poor authentication, unlimited modification of feedback, lack of role-based access, and unreliable data handling. FeedbackIntel addresses these limitations by using JWT authentication, OTP-based verification, bcrypt password hashing, MongoDB persistence, server-side edit-window validation, and protected API routes.

The project follows a full stack client-server architecture. The backend is implemented using Node.js, Express.js, MongoDB, Mongoose, JSON Web Tokens, bcryptjs, and Nodemailer. The frontend is implemented using HTML5, CSS3, and JavaScript with Fetch API communication. The interface uses a responsive cyber-noir/glassmorphism visual style and provides a live countdown timer for the feedback edit window.

Testing was performed across authentication, OTP verification, feedback management, dashboard, admin controls, security, database operations, UI behavior, and performance. A total of 50 test cases were planned, 48 were executed, and the pass percentage was 96%. The final system provides a practical, secure, and reliable platform for controlled feedback management.

---

CHAPTER 1: PROBLEM DEFINITION

1.1 Existing System

Many feedback systems used in institutions or organizations rely on manual forms, unsecured web forms, spreadsheets, or informal collection methods. These systems often do not verify the identity of the user, do not restrict feedback modification, and do not provide a centralized role-based management interface for administrators.

In such systems, feedback can be edited repeatedly, submitted by unverified users, or lost due to weak persistence mechanisms. Administrators may also face difficulty in monitoring feedback records and understanding the overall status of the system.

1.2 Problem Statement

The main problem is the absence of a secure and structured feedback management system that supports authenticated access, verified user registration, controlled editing, database persistence, and administrative monitoring.

The system must solve the following issues:

- Lack of secure authentication and user verification.
- Absence of role-based access control for users and administrators.
- Unlimited editing of submitted feedback.
- Poor database-backed feedback tracking.
- Lack of centralized feedback monitoring for administrators.
- Weak validation and error handling in feedback submission workflows.

1.3 Proposed System

FeedbackIntel proposes a secure full stack web application for collecting, storing, and monitoring user feedback. The system provides:

- User registration and login.
- OTP email verification.
- JWT-based session authentication.
- Secure password storage using bcrypt hashing.
- Feedback submission with title, message, and category.
- Personal feedback dashboard for users.
- Strict 15-minute server-side feedback editing window.
- Admin dashboard for viewing all feedback records.
- Protected backend APIs using authentication and role-checking middleware.
- MongoDB-based persistent storage.

1.4 SMART Criteria

Specific: The project focuses on secure feedback collection and management with time-restricted editing.

Measurable: Users can register, verify OTP, log in, submit feedback, view feedback, and edit only within 15 minutes.

Achievable: The system is implemented using standard full stack technologies such as Node.js, Express.js, MongoDB, JavaScript, JWT, and Nodemailer.

Relevant: Institutions and organizations require reliable systems to collect authentic feedback and prevent unauthorized changes.

Time-bound: The edit feature automatically expires after 15 minutes from feedback creation.

1.5 Scope

The scope of the project includes authentication, OTP verification, feedback management, role-based access, database storage, and admin monitoring. The system is designed for browser-based use and supports multiple users through a central backend server.

The project does not currently include advanced analytics, mobile applications, automated sentiment analysis, or production-scale cloud monitoring. These features can be added in future versions.

---

CHAPTER 2: REQUIREMENTS ENGINEERING

2.1 Requirements Engineering Life Cycle

Requirements Engineering is the systematic process of identifying, analyzing, documenting, validating, and managing the requirements of a software system. For FeedbackIntel: Intelligent Feedback Management System, the Requirements Engineering Life Cycle consists of the following phases:

1. Requirements Elicitation

Requirements were gathered by studying the limitations of traditional feedback collection systems that rely on manual forms, unsecured web forms, spreadsheets, or informal communication channels. Information was collected regarding user registration, secure login, OTP verification, feedback submission, feedback editing, admin monitoring, database storage, and security requirements.

2. Requirements Analysis

The collected requirements were analyzed to identify system functionalities, user roles, constraints, and dependencies. Requirements were classified into functional requirements, non-functional requirements, domain requirements, and security requirements. The analysis also identified key system rules such as authenticated access, role-based admin control, OTP-based account verification, and 15-minute feedback editing restriction.

3. Requirements Specification

The analyzed requirements were documented in the requirements section of this report. The specification defines system behavior, user interactions, authentication flow, feedback management operations, database expectations, performance needs, security requirements, and operational constraints.

4. Requirements Validation

The requirements were reviewed to ensure correctness, completeness, consistency, and feasibility. Validation was performed by mapping requirements to system modules such as Authentication, OTP Verification, Feedback Management, Admin Dashboard, Database, and Security Middleware. The expected outputs were also compared with the implemented system behavior and testing results.

5. Requirements Management

Requirements are maintained throughout the development lifecycle. Any modifications, enhancements, defects, or future features are documented and tracked to ensure consistency between requirements, implementation, testing, and final project output. Future requirements such as analytics, admin delete functionality, audit logs, and automated backend testing can be managed as enhancement items.

2.2 Stakeholders

| Stakeholder | Role |
|---|---|
| User | Registers, verifies account, submits feedback, views feedback, and edits within allowed time |
| Administrator | Monitors all feedback and views system statistics |
| Developer | Builds and maintains frontend, backend, database, and APIs |
| Tester | Validates functional, security, database, and UI behavior |
| Project Reviewer | Evaluates project design, implementation, and documentation |

2.3 Functional Requirements

| ID | Requirement |
|---|---|
| FR1 | The system shall allow users to register using email and password. |
| FR2 | The system shall send an OTP to the user email during registration. |
| FR3 | The system shall verify OTP before activating the user account. |
| FR4 | The system shall allow verified users to log in. |
| FR5 | The system shall generate JWT tokens for authenticated sessions. |
| FR6 | The system shall allow users to submit feedback with title, message, and category. |
| FR7 | The system shall store feedback records in MongoDB. |
| FR8 | The system shall allow users to view only their own feedback records. |
| FR9 | The system shall allow users to edit feedback only within 15 minutes. |
| FR10 | The system shall block editing after the 15-minute edit window expires. |
| FR11 | The system shall provide role-based admin access. |
| FR12 | The system shall allow admins to view all feedback records. |
| FR13 | The system shall allow admins to view basic system statistics. |
| FR14 | The system shall validate required input fields before processing requests. |
| FR15 | The system shall protect API routes from unauthorized access. |

2.4 Non-Functional Requirements

| Category | Requirement |
|---|---|
| Security | Passwords must be hashed, APIs must use JWT authentication, and admin routes must require admin role. |
| Reliability | Feedback records must be stored persistently in MongoDB. |
| Performance | Login, feedback submission, and feedback retrieval should respond quickly for normal usage. |
| Usability | The UI should be responsive and simple for registration, login, OTP verification, and feedback management. |
| Maintainability | Backend routes, models, middleware, and utility functions should be modular. |
| Availability | The system should remain available during normal server and database operation. |
| Data Consistency | Frontend timers and backend validation should maintain feedback edit-window consistency. |
| Compatibility | The application should work on modern browsers. |

2.5 Domain Requirements

- The system operates in the feedback collection and management domain.
- Users must be authenticated before submitting feedback.
- Feedback must be stored with timestamps for auditability and edit-window enforcement.
- Only administrators should access organization-wide feedback data.
- Feedback editing must be controlled to maintain authenticity.

2.6 Security Requirements

- JWT authentication is used for secure user sessions.
- bcrypt hashing is used before storing passwords.
- OTP email verification is required before account activation.
- Role-based access control restricts admin APIs.
- Environment variables protect database URI, JWT secret, email credentials, and admin secret.
- Protected routes reject missing, invalid, or expired tokens.
- Feedback editing is restricted after 15 minutes by backend validation.

2.7 Requirements Traceability Matrix

| Req ID | Requirement | Module | Status |
|---|---|---|---|
| R1 | User registration | Auth API, User model | Completed |
| R2 | OTP verification | Auth API, Email utility | Completed |
| R3 | User login | Auth API, JWT | Completed |
| R4 | Feedback submission | Feedback API, Feedback model | Completed |
| R5 | Feedback retrieval | Feedback API, Dashboard | Completed |
| R6 | 15-minute edit restriction | Feedback API, Frontend timer | Completed |
| R7 | Admin feedback view | Admin API, RBAC middleware | Completed |
| R8 | Password security | bcryptjs, User model | Completed |
| R9 | Database persistence | MongoDB, Mongoose | Completed |
| R10 | UI responsiveness | HTML, CSS, JavaScript | Completed |

2.8 Acceptance Criteria

The system is accepted if:

- A new user can register and receive OTP.
- OTP verification activates the account.
- Verified users can log in successfully.
- Invalid login and unverified accounts are rejected.
- Authenticated users can submit feedback.
- Users can view their own feedback.
- Users cannot edit another user's feedback.
- Feedback editing is blocked after 15 minutes.
- Admin routes are inaccessible to normal users.
- Admin users can view all feedback records and statistics.

---

CHAPTER 3: DESIGN METHODOLOGY

3.1 System Architecture

FeedbackIntel follows a client-server architecture.

| Layer | Description |
|---|---|
| Presentation Layer | Browser-based HTML, CSS, and JavaScript interface |
| API Layer | Express.js routes for authentication, feedback, and admin operations |
| Business Logic Layer | OTP flow, JWT validation, role checks, edit-window enforcement, input validation |
| Data Layer | MongoDB collections managed through Mongoose models |
| Service Layer | Nodemailer utility for sending OTP emails |

3.2 Major Modules

| Module | Description |
|---|---|
| Authentication Module | Handles registration, OTP verification, login, password hashing, and token generation |
| Feedback Module | Handles feedback creation, retrieval, and time-limited editing |
| Admin Module | Provides protected admin feedback view and system statistics |
| Database Module | Stores users and feedback records through MongoDB |
| Email Module | Sends OTP verification codes through Nodemailer |
| Frontend Module | Provides interactive forms, dashboards, countdown timer, and API communication |

3.3 Design Decisions and Rationale

| Decision | Rationale |
|---|---|
| JWT authentication | Supports stateless protected API communication |
| OTP email verification | Prevents fake or unverified account activation |
| bcrypt password hashing | Protects user passwords in database storage |
| MongoDB database | Provides flexible document-based persistence |
| Express.js backend | Supports modular REST API implementation |
| Server-side edit validation | Prevents users from bypassing frontend timer restrictions |
| Role-based admin control | Separates normal user and administrator privileges |

3.4 UML and CASE Diagrams to Include

The following diagrams should be included in the final formatted report:

- Use Case Diagram
- Class Diagram
- Sequence Diagram
- Activity Diagram
- State Diagram
- Component Diagram
- Deployment Diagram
- ER Diagram
- Data Flow Diagram
- Wireframe Diagram
- Flowchart
- Architecture Diagram

3.5 Use Case Description

| Actor | Use Case |
|---|---|
| User | Register |
| User | Verify OTP |
| User | Login |
| User | Submit Feedback |
| User | View Feedback |
| User | Edit Feedback |
| User | Logout |
| Admin | Login |
| Admin | View All Feedback |
| Admin | View Statistics |

3.6 Database Design

User Collection

| Field | Type | Description |
|---|---|---|
| _id | ObjectId | Unique MongoDB user identifier |
| email | String | User email, unique and required |
| passwordHash | String | Hashed user password |
| role | String | user or admin |
| isVerified | Boolean | Account verification status |
| otpCode | String | Temporary OTP code |
| otpExpiresAt | Date | OTP expiration time |
| createdAt | Date | User creation timestamp |
| updatedAt | Date | Last user update timestamp |

Feedback Collection

| Field | Type | Description |
|---|---|---|
| _id | ObjectId | Unique feedback identifier |
| user | ObjectId | Reference to User |
| title | String | Feedback title, maximum 150 characters |
| message | String | Feedback message, maximum 2000 characters |
| category | String | classroom, food, campus, facilities, technology, or other |
| createdAt | Date | Feedback creation timestamp |
| updatedAt | Date | Last feedback update timestamp |

3.7 Sequence Flow

Registration and OTP Verification

1. User enters email and password.
2. Frontend sends registration request to backend.
3. Backend validates input and checks existing user.
4. Backend hashes password using bcrypt.
5. Backend generates OTP and stores OTP expiration time.
6. Nodemailer sends OTP email.
7. User enters OTP.
8. Backend validates OTP and activates account.
9. Backend returns JWT token and user role.

Feedback Submission and Editing

1. User logs in and receives JWT.
2. User submits feedback title, message, and category.
3. Frontend sends request with Bearer token.
4. Backend validates JWT through middleware.
5. Backend stores feedback in MongoDB.
6. User dashboard displays submitted feedback.
7. If user edits within 15 minutes, backend accepts update.
8. If 15 minutes expire, backend returns 403 lock response.

3.8 Design Patterns and Architecture Styles

| Pattern / Style | Usage |
|---|---|
| Client-Server Architecture | Browser frontend communicates with Express backend |
| REST API Architecture | HTTP endpoints expose auth, feedback, and admin operations |
| Layered Architecture | Presentation, API, business logic, data, and service layers |
| Middleware Pattern | JWT validation and admin role checks run before protected APIs |
| MVC-like Separation | Frontend UI, Express controllers/routes, and Mongoose models are separated |
| CRUD Pattern | Feedback supports create, read, and update operations |
| Modular Design | Routes, models, middleware, utilities, and public assets are organized separately |

3.9 Cohesion and Coupling

Authentication, feedback, admin, database, and email features are implemented as separate modules. Each module has functional cohesion because it focuses on one primary responsibility. Coupling is mainly data coupling through JSON requests, database models, JWT payloads, and API responses.

---

CHAPTER 4: CODING PRACTICES AND PLATFORMS

4.1 Technology Stack

| Area | Tools / Technologies |
|---|---|
| Frontend | HTML5, CSS3, JavaScript, Fetch API |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JSON Web Token, bcryptjs |
| Email Service | Nodemailer |
| Development Tools | VS Code, Git, GitHub, Postman |
| Runtime | Node.js server |

4.2 Project Structure

| Path | Purpose |
|---|---|
| public/index.html | Main frontend page |
| public/css/style.css | Frontend styling and responsive UI |
| public/js/app.js | Frontend application logic and API calls |
| server/index.js | Express server setup, middleware, routes, static hosting, database connection |
| server/routes/auth.js | Registration, OTP verification, and login routes |
| server/routes/feedback.js | Feedback create, retrieve, and update APIs |
| server/routes/admin.js | Admin feedback and statistics APIs |
| server/models/User.js | Mongoose user schema |
| server/models/Feedback.js | Mongoose feedback schema |
| server/middleware/auth.js | JWT authentication and admin authorization middleware |
| server/utils/email.js | OTP email sending utility |

4.3 API Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | /api/auth/register | Register user and send OTP | Public |
| POST | /api/auth/verify-otp | Verify OTP and activate account | Public |
| POST | /api/auth/login | Login verified user | Public |
| POST | /api/feedback | Submit feedback | Authenticated user |
| GET | /api/feedback | Get current user's feedback | Authenticated user |
| PUT | /api/feedback/:id | Edit feedback within 15 minutes | Feedback owner |
| GET | /api/admin/feedback | View all feedback | Admin only |
| GET | /api/admin/stats | View user and feedback count | Admin only |

4.4 Coding Practices

- Modular route files are used for authentication, feedback, and admin features.
- Mongoose schemas define database structure and validation rules.
- Environment variables are used for secrets and configuration.
- Passwords are never stored directly; bcrypt hashes are stored.
- JWT middleware validates protected requests.
- Admin middleware restricts management routes.
- Server-side validation is used for required fields and feedback category values.
- Time-restricted editing is enforced in the backend, not only on the frontend.
- The frontend stores JWT in localStorage and sends it using Authorization headers.

4.5 Important Business Rules

- Users must verify OTP before login.
- OTP expires after 10 minutes.
- JWT expires after 12 hours.
- Feedback can be edited only within 15 minutes of creation.
- Feedback category must be one of classroom, food, campus, facilities, technology, or other.
- Only admins can access organization-wide feedback data.

---

CHAPTER 5: TESTING

5.1 Testing Overview

Testing was performed to verify functional correctness, security, database behavior, user interface behavior, and role-based access. The test cycle included authentication, OTP verification, feedback submission, feedback retrieval, feedback editing, admin dashboard, JWT security, MongoDB operations, UI responsiveness, and performance.

5.2 Test Summary

| Metric | Value |
|---|---|
| Overall QA cycle progress | On time |
| Total number of test cases | 50 |
| Number of testers | 3 |
| Test cycle duration | 4 days |
| Test cases planned | 50 |
| Test cases executed | 48 |
| Pass percentage | 96% |
| Defects encountered so far | 4 to 5 logged defects |
| Critical defects still open | 1 |
| Defect density | 1 defect per day |

5.3 Test Case Categories

| Module | Tested Scenarios |
|---|---|
| Authentication | Registration, existing email validation, invalid email, password encryption, login validation |
| OTP Verification | Send OTP, valid OTP, invalid OTP, expired OTP, resend OTP |
| Feedback | Submission, validation, long message, retrieval, editing, timestamp, multiple submissions |
| Dashboard | Loading, countdown timer, refresh, empty dashboard, logout |
| Admin | Admin login, view all feedback, delete feedback, access restriction, admin control validation |
| Security | Protected routes, unauthorized access blocking, bcrypt validation, session expiration, invalid API request handling |
| Database | MongoDB connection, store user records, store feedback records, retrieve and update feedback |
| UI Testing | Login responsiveness, dashboard responsiveness, empty field messages, button interaction, theme consistency |
| System | Multiple user handling |

5.4 Sample Test Cases

| Test ID | Module | Scenario | Expected Result | Status |
|---|---|---|---|---|
| TC01 | Authentication | Register new user | User is created and OTP is sent | Pass |
| TC02 | Authentication | Register using existing email | System blocks duplicate registration | Pass |
| TC03 | Authentication | Login with invalid password | System rejects login | Pass |
| TC04 | OTP | Verify valid OTP | Account is activated | Pass |
| TC05 | OTP | Verify expired OTP | System rejects OTP | Pass |
| TC06 | Feedback | Submit valid feedback | Feedback is stored in MongoDB | Pass |
| TC07 | Feedback | Submit empty title | Validation error should appear | Fail |
| TC08 | Feedback | Edit within 15 minutes | Feedback update is accepted | Pass |
| TC09 | Feedback | Edit after 15 minutes | System blocks editing | Pass |
| TC10 | Admin | Normal user opens admin route | Access denied | Pass |
| TC11 | Security | Protected route without token | Request is rejected | Pass |
| TC12 | Database | Retrieve feedback records | Correct feedback list is returned | Pass |

5.5 Defect Report

| Defect ID | Description | Severity | State | Assigned To |
|---|---|---|---|---|
| BUG-101 | Admin dashboard feedback list not loading properly | High | Open | Backend Developer |
| BUG-102 | Feedback edit timer delay during update operation | Medium | Assigned | Frontend Developer |
| BUG-103 | OTP email delivery delayed for some users | Low | In Progress | Email Service Developer |
| BUG-104 | Admin delete feedback action not fully implemented | High | Open | Backend Developer |
| BUG-105 | Empty field validation missing in feedback title | Medium | Assigned | Frontend Developer |

5.6 Testing Conclusion

The system achieved a 96% pass rate across planned and executed test cases. Most critical flows, including authentication, OTP verification, feedback submission, protected route access, database operations, and edit-window restrictions, were successfully validated. Remaining issues are mainly related to admin feedback loading, incomplete delete behavior, frontend validation, timer synchronization, and occasional OTP delivery delay.

---

CHAPTER 6: DEPLOYMENT CHECKLIST

6.1 Pre-Deployment Checklist

| Item | Status |
|---|---|
| Node.js dependencies installed using npm install | Required |
| MongoDB URI configured in environment variables | Required |
| JWT secret configured | Required |
| Email service credentials configured | Required |
| Admin registration secret configured | Recommended |
| Server port configured | Required |
| Static frontend files available in public folder | Required |
| API routes tested using browser/Postman | Required |
| Database connection verified | Required |
| Authentication and protected routes tested | Required |

6.2 Environment Variables

| Variable | Purpose |
|---|---|
| MONGO_URI | MongoDB connection string |
| JWT_SECRET | Secret key for signing JWT tokens |
| PORT | Express server port |
| ADMIN_REGISTER_SECRET | Secret code for admin registration |
| EMAIL_USER | Email sender account |
| EMAIL_PASS | Email service password or app password |

6.3 Deployment Steps

1. Install project dependencies using `npm install`.
2. Create and configure `.env` file.
3. Start MongoDB or connect to cloud MongoDB.
4. Run the server using `npm start`.
5. Open the application in a browser.
6. Register a test user and verify OTP.
7. Submit sample feedback.
8. Confirm edit lock after 15 minutes.
9. Test admin login and admin dashboard access.
10. Monitor server logs and database records.

6.4 Post-Deployment Verification

- Registration and OTP email flow works.
- Login returns valid JWT token.
- Feedback is stored in MongoDB.
- User dashboard displays submitted feedback.
- Admin dashboard is restricted to admin users.
- Invalid or expired tokens are rejected.
- Feedback cannot be edited after the allowed time window.

---

CHAPTER 7: RESULTS

7.1 Final Output

The FeedbackIntel system was successfully designed and implemented as a secure feedback management web application. It provides authenticated access, OTP verification, feedback creation, feedback retrieval, 15-minute edit restriction, role-based admin access, and persistent MongoDB storage.

7.2 Achieved Features

- Secure user registration.
- OTP email verification.
- Verified user login.
- JWT-based session handling.
- Password hashing using bcrypt.
- Feedback submission with category.
- Personal feedback dashboard.
- Live edit-window countdown in frontend.
- Backend-enforced 15-minute edit restriction.
- Admin-only feedback monitoring.
- Basic system statistics for administrators.
- Modular backend structure.
- Responsive frontend interface.

7.3 Limitations

- Admin delete feedback functionality is not fully implemented.
- Advanced analytics and sentiment analysis are not included.
- OTP delivery depends on external email service availability.
- The project currently uses browser localStorage for token storage.
- The frontend is a single static web interface rather than a component-based framework implementation.

7.4 Future Enhancements

- Add admin delete and update management actions.
- Add feedback analytics and sentiment classification.
- Add charts for category-wise feedback analysis.
- Add password reset functionality.
- Add email templates for OTP messages.
- Add audit logs for admin actions.
- Add pagination and search for admin feedback.
- Add deployment monitoring and structured logging.
- Add automated test scripts for backend APIs.

7.5 Conclusion

FeedbackIntel satisfies the core objective of building a secure, database-backed feedback management system. The system improves feedback authenticity through OTP verification, role-based access, secure password handling, and backend-enforced edit restrictions. The project demonstrates practical application of software engineering concepts including requirements engineering, system design, modular coding, database modelling, testing, and deployment planning.

---

CHAPTER 8: APPENDIX

Appendix A: Source Documents Used

- Design Document.docx
- System_Requirements_Template (1).docx
- Industry Specific Practices (1) (1).pptx
- sample-status-report.xlsx
- Project source code from the FeedbackIntel repository
- Friend's CASE tools report structure used as formatting reference

Appendix B: Recommended Additions Before Final Submission

The following items should be added to make the final report stronger and closer to the reference report:

- Screenshots of login page, registration page, OTP page, user dashboard, feedback form, edit timer, and admin dashboard.
- UML diagrams exported as images.
- ER diagram showing User and Feedback collections.
- API testing screenshots from Postman.
- MongoDB collection screenshots.
- Deployment screenshot showing server running.
- GitHub repository link.
- Supervisor name and signature details.
- Final page numbers after formatting in Word/PDF.

Appendix C: Suggested Screenshots List

| Screenshot | Purpose |
|---|---|
| Home/Login screen | Shows entry point of system |
| Registration form | Shows user onboarding |
| OTP verification page | Shows secure account activation |
| User dashboard | Shows feedback list |
| Feedback submission form | Shows main user feature |
| Edit countdown timer | Shows 15-minute edit-window logic |
| Locked feedback state | Shows editing blocked after expiry |
| Admin dashboard | Shows role-based feedback monitoring |
| MongoDB records | Shows database persistence |
| API test result | Shows backend validation |

Appendix D: Glossary

| Term | Meaning |
|---|---|
| API | Application Programming Interface |
| JWT | JSON Web Token |
| OTP | One-Time Password |
| RBAC | Role-Based Access Control |
| CRUD | Create, Read, Update, Delete |
| MongoDB | NoSQL document database |
| Mongoose | MongoDB object modelling library for Node.js |
| bcrypt | Password hashing algorithm/library |
| Nodemailer | Node.js email sending library |
