# Social Event and Activity Tracker

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-4.18-black?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248?logo=mongodb&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue)

A full-stack web application that lets users discover social events happening around them, join those events, and share reviews. Built with Node.js, Express, MongoDB, and Vanilla JavaScript — no frontend framework required.

> Turkish version: [TRREADME.md](TRREADME.md)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Models](#database-models)
- [API Endpoints](#api-endpoints)
- [Getting Started](#getting-started)
- [Seed Data](#seed-data)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### User Management
- Register with avatar selection (70+ avatar options available)
- JWT-based login / logout with a 1-day token expiration
- Edit profile: name, email, and avatar
- Role-based access control:
  - **User** (`isAdmin: 0`) — browse, join, and review events
  - **Admin** (`isAdmin: 1`) — create, edit, and delete events; promote other users
  - **Owner** (`isAdmin: 2`) — full access including user deletion and admin management

### Event Discovery
- Browse all events in a responsive card grid layout
- Filter events by category: Concert, Festival, Sports, Art, Education, Other
- Filter events by city or location
- Featured upcoming events displayed on the homepage
- Detailed event pages: title, description, date, location, capacity, images, and average rating

### Event Participation
- Join events with real-time capacity enforcement (prevents over-booking)
- Duplicate participation prevented via a unique compound database index
- Track all joined events from the user profile page

### Review & Rating System
- Rate events 1–5 stars (only available to verified participants)
- Write detailed text reviews
- One review per user per event enforced at the database level
- Edit or delete your own reviews
- Automatic average rating calculation displayed per event

### Admin Dashboard
- Create new events with full form validation
- Edit existing event details
- Delete events
- List, search, and paginate all registered users
- Grant or revoke admin privileges for any user

### Legal Pages
- Privacy Policy
- Terms of Use
- Cookie Policy

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Web Framework | Express.js 4.18 |
| Database | MongoDB |
| ODM | Mongoose 7 |
| Authentication | JSON Web Token (jsonwebtoken 9) |
| Password Hashing | bcryptjs 2.4 |
| CORS | cors 2.8 |
| Environment Config | dotenv 16 |
| Dev Server | nodemon 2 |
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Icons | Font Awesome 6 |
| Client-side Session | localStorage (JWT storage) |

---

## Project Structure

```
social-event-tracker/
├── public/                        # Static frontend files
│   ├── css/
│   │   └── style.css              # Main stylesheet (responsive, mobile-first)
│   ├── js/
│   │   ├── auth.js                # Client-side auth helpers & JWT token management
│   │   ├── main.js                # Homepage — featured events loader
│   │   ├── events.js              # Events listing page — filtering & rendering
│   │   ├── event-detail.js        # Event details, join, and review submission
│   │   ├── admin.js               # Admin panel — event & user CRUD
│   │   ├── profile.js             # User profile — edit info & view joined events
│   │   ├── login.js               # Login form handling
│   │   ├── register.js            # Registration form handling
│   │   ├── components.js          # Reusable HTML component loader (header/footer)
│   │   └── password-toggle.js     # Password visibility toggle
│   ├── avatar/                    # 70+ user avatar images
│   ├── components/
│   │   ├── header.html            # Shared navigation bar component
│   │   └── footer.html            # Shared footer component
│   ├── index.html                 # Homepage
│   ├── events.html                # Events listing page
│   ├── event-detail.html          # Event details page
│   ├── profile.html               # User profile page
│   ├── admin.html                 # Admin dashboard
│   ├── admin-fix.html             # Admin privilege correction utility page
│   ├── login.html                 # Login page
│   ├── register.html              # Registration page
│   ├── gizlilik-politikasi.html   # Privacy policy
│   ├── kullanim-kosullari.html    # Terms of use
│   └── cerez-politikasi.html      # Cookie policy
├── models/
│   ├── User.js                    # User schema with pre-save password hashing
│   ├── Event.js                   # Event schema
│   ├── Participation.js           # User–Event join relationship schema
│   └── Review.js                  # Rating & comment schema
├── routes/
│   ├── users.js                   # Auth & user management API endpoints
│   ├── events.js                  # Event CRUD & participation API endpoints
│   └── reviews.js                 # Review CRUD API endpoints
├── middleware/
│   ├── auth.js                    # JWT validation middleware
│   └── adminAuth.js               # Admin role authorization middleware
├── server.js                      # Express app entry point & MongoDB connection
├── seed.js                        # Database seed script (sample data)
├── package.json                   # Project dependencies & scripts
└── .env                           # Environment variables (not committed to git)
```

---

## Database Models

### User

| Field | Type | Notes |
|-------|------|-------|
| `name` | String | Required |
| `email` | String | Required, unique |
| `password` | String | Hashed with bcryptjs via pre-save hook |
| `avatar` | String | Default: `avatar/avatar_01.png` |
| `isAdmin` | Number | `0` = User, `1` = Admin, `2` = Owner |
| `createdAt` | Date | Automatically set on creation |

### Event

| Field | Type | Notes |
|-------|------|-------|
| `title` | String | Required |
| `description` | String | Required |
| `date` | Date | Required |
| `location` | String | e.g. `"Istanbul, Kadıköy"` |
| `category` | String | Concert / Festival / Sports / Art / Education / Other |
| `image` | String | Image URL |
| `participantLimit` | Number | Maximum capacity |
| `createdBy` | ObjectId | References the admin User who created the event |
| `createdAt` | Date | Automatically set on creation |

### Participation

| Field | Type | Notes |
|-------|------|-------|
| `user` | ObjectId | References User |
| `event` | ObjectId | References Event |
| `joinedAt` | Date | Automatically set on join |

> Unique compound index on `(user, event)` — prevents duplicate participations.

### Review

| Field | Type | Notes |
|-------|------|-------|
| `user` | ObjectId | References User (review author) |
| `event` | ObjectId | References Event |
| `rating` | Number | Integer, 1–5 stars |
| `comment` | String | Required review text |
| `createdAt` / `updatedAt` | Date | Automatically managed |

> Unique compound index on `(user, event)` — one review per user per event.

---

## API Endpoints

### Users — `/api/users`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `POST` | `/register` | Public | Register a new user account |
| `POST` | `/login` | Public | Login and receive a JWT token |
| `GET` | `/me` | User | Get the current user's profile |
| `PUT` | `/me` | User | Update the current user's profile |
| `POST` | `/avatar` | User | Change the current user's avatar |
| `GET` | `/me/events` | User | List all events the current user has joined |
| `GET` | `/` | Admin | List all registered users |
| `PUT` | `/:id/make-admin` | Admin | Grant admin role to a user |
| `PUT` | `/:id/revoke-admin` | Admin | Revoke admin role from a user |
| `DELETE` | `/:id` | Owner | Delete a user account |

### Events — `/api/events`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `GET` | `/` | Public | List all events (supports `?category=` and `?location=` filters) |
| `GET` | `/:id` | Public | Get event details including participation count and average rating |
| `POST` | `/` | Admin | Create a new event |
| `PUT` | `/:id` | Admin | Update an existing event |
| `DELETE` | `/:id` | Admin | Delete an event |
| `GET` | `/:id/join` | User | Check if the current user has already joined this event |
| `POST` | `/:id/join` | User | Join an event (enforces capacity limit) |
| `GET` | `/:id/reviews/check` | User | Check if the current user has already reviewed this event |
| `POST` | `/:id/reviews` | User | Submit a review (requires prior participation) |

### Reviews — `/api/reviews`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `GET` | `/` | Public | Get all reviews (paginated) |
| `GET` | `/:id` | Public | Get a specific review by ID |
| `GET` | `/user/:userId` | Public | Get all reviews written by a specific user |
| `GET` | `/event/:eventId` | Public | Get all reviews for a specific event |
| `PUT` | `/:id` | Author | Update your own review |
| `DELETE` | `/:id` | Author | Delete your own review |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [MongoDB](https://www.mongodb.com/) running locally on port `27017`
- npm (bundled with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/social-event-tracker.git
cd social-event-tracker

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the project root with the following content:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/etkinlik-takipcisi?retryWrites=true&w=majority
JWT_SECRET=etkinlik_takipcisi_jwt_secret_key
```

### Running the Application

```bash
# Development — auto-reload with nodemon
npm run dev

# Production
npm start
```

Once running, open your browser and go to:

- **Local:** `http://localhost:5000`
- **Local Network (LAN):** `http://<your-local-ip>:5000`

The server prints both URLs to the console on startup.

---

## Seed Data

To populate the database with sample users, events, participations, and reviews:

```bash
node seed.js
```

| Resource | Count |
|----------|-------|
| Users | 8 (1 owner, 1 admin, 6 regular users) |
| Events | 15 (various categories) |
| Participations | 32 |
| Reviews | 32 |

**Pre-seeded test accounts:**

| Email | Password | Role |
|-------|----------|------|
| hamza@gmail.com | Hamza12345. | Owner |
| selin@gmail.com | Selin12345. | Admin |
| ayse@gmail.com | Ayse12345. | User |

**Sample event categories included:** Rock Concert, Jazz Festival, Yoga Workshop, Book Fair, Tech Summit, Nature Walk, Theater Show, Stand-up Comedy, Photography Workshop, Street Food Festival, Art Exhibition, and more.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

© 2026 Social Event and Activity Tracker. All rights reserved.
