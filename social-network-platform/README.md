# Social Network Platform v2

A modern, polished, and submission-ready social network platform built with Node.js, Express, MongoDB, Socket.io, and vanilla HTML/CSS/JavaScript.

## v2 Upgrades Included
1. **Modern UI:** Complete redesign using modern css variables, `Inter` font, soft shadows, rounded borders, and clean spacing.
2. **Real-Time Sockets:** Granular `postLiked` and `postCommented` Socket.io events update counts instantly across all active users.
3. **Privacy Settings:** Users can mark accounts as `isPrivate`, and posts can be set to `Public` or `Friends Only`.
4. **Multimedia Support:** Fully functional image uploads via Multer for both Profile Pictures and Post Attachments.
5. **Enhanced Profiles:** Profile pages now show friend counts, an Edit Profile modal, and respect privacy walls.
6. **Smart Notifications:** Includes unread notification badges, and organized notification history tracking.
7. **Controller Architecture:** Backend code is completely refactored into a scalable MVC (Model-View-Controller) structure for submission-ready code quality.
8. **Search Improvements:** Clean dropdown navigation search by username with debouncing.

## Tech Stack
- **Backend:** Node.js, Express
- **Database:** MongoDB (Mongoose)
- **Frontend:** Plain HTML, CSS, JavaScript (No React/Vue required)
- **Real-time:** Socket.io
- **File Uploads:** Multer

---

## How to Run the Project (Step-by-Step)

### Prerequisites
1. **Node.js** installed on your computer.
2. **MongoDB** installed and running locally on port `27017` (the default port). 

### Step 1: Install Dependencies
Open your terminal in the root folder (`social-network-platform`) and run:
```bash
npm install
```

### Step 2: Start the Server
In the same terminal, run:
```bash
npm start
```
You should see:
```text
Server running on port 3000
MongoDB connected successfully
```

### Step 3: Open the Platform
Open your web browser and go to:
[http://localhost:3000](http://localhost:3000)

1. Register a new account.
2. Create a test post with an uploaded image.
3. Open a second incognito window, register another user, and test the real-time likes, comments, privacy modes, and friend requests!
