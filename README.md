# 🏠 WGorganiser

**WGorganiser** is a comprehensive, modern web application designed for shared apartment (Wohngemeinschaft) management. It streamlines daily co-living tasks such as room bookings, housekeeping instructions, community events, and house communication, all within a sleek, user-friendly interface.

---

## 🌟 Key Features

- **Stay Management**: Smart check-in/check-out system with customizable handover checklists and room assignments.
- **Dynamic Calendar**: Visual room occupancy tracking with integrated Berlin event highlights.
- **House Manuals**: Digitized appliance manuals and house rules with image support for quick troubleshooting.
- **Berlin Community Hub**: Post event tips, share useful local links, and filter content via hashtags.
- **Integrated House Chat**: Real-time communication for roommates with support for threaded replies.
- **House Settings**: Customizable room names, color coding, and global checklist templates.
- **Plant Care Assistant**: Automated timers to ensure the WG's greenery stays hydrated.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) & [React Router 7](https://reactrouter.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **State & Logic**: React Hook Form, Zod (Validation), Axios

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Database**: [MongoDB](https://www.mongodb.com/) with Motor (Async driver)
- **Validation**: Pydantic

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB (Local or Atlas)

### Backend Setup
1. **Navigate to backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```
2. **Configure environment**
   ```bash
   cp .env.example .env
   # Set MONGO_URL, DB_NAME, and CORS_ORIGIN
   ```
3. **Start the API**
   ```bash
   uvicorn server:app --reload
   ```

### Frontend Setup
1. **Navigate to frontend**
   ```bash
   cd frontend
   npm install
   npm start
   ```

---

## 📁 Project Structure

```text
WGorganiser/
├── frontend/          # React UI & State Management
├── backend/           # FastAPI & MongoDB Logic
├── tests/             # Comprehensive Python Test Suite
├── memory/            # Detailed PRD & Project Docs
└── design_guidelines/ # Visual Consistency Definitions
```

---

## 🛡️ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Simplifying co-living through thoughtful technology.*
