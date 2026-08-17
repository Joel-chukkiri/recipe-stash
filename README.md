# 🍳 Recipe Stash — Final Product

A modern, full-stack recipe discovery and cookbook web application built with **Django REST Framework**, **React (Vite)**, and **TheMealDB API**.

---

## 🌟 The Product Experience

Recipe Stash combines two powerful experiences:
1. **🔍 Discover (`/discover`)**: Live exploration of thousands of authentic world recipes powered by **TheMealDB** with search, category filters, world cuisines, surprise random meal generator, full ingredient measurements, and a 1-click `♡ Stash Recipe` action.
2. **📖 My Stash (`/stash`)**: Your private, user-scoped digital cookbook. Organize custom created recipes and stashed TheMealDB recipes with instant search, source filtering, interactive ingredient checklists, and 1-click copy to clipboard.

---

## 🛠️ Technology Stack

### Backend
- **Python 3.13+** & **Django 6.0**
- **Django REST Framework**
- **djangorestframework-simplejwt** (Access + Refresh tokens with auto-rotation)
- **django-cors-headers**
- **SQLite**

### Frontend
- **React 19** with **Vite**
- **React Router v7**
- **Axios** (with automatic 401 token refresh queue interceptor)
- **TheMealDB API Service** (with in-memory caching)
- **Lucide React** (icons)
- **Vanilla CSS** with Google Fonts (*Playfair Display* & *Plus Jakarta Sans*)

---

## 🚀 Quick Start Guide

### 1. Start the Django Backend
```bash
# Navigate to the backend folder
cd backend

# Run database migrations
python manage.py migrate

# (Optional) Seed demo recipes and demo chef account
python manage.py seed_recipes

# Start the Django development server
python manage.py runserver 8000
```

> **Demo Chef Credentials**:
> - **Username**: `chef_julia`
> - **Password**: `password123`

### 2. Start the React Frontend
```bash
# Navigate to the frontend folder
cd frontend

# Install node dependencies
npm install

# Start Vite dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 📡 API Endpoints Reference

### Authentication (`/api/auth/`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register/` | Register new chef account | No |
| `POST` | `/api/auth/login/` | Obtain JWT access + refresh tokens | No |
| `POST` | `/api/auth/refresh/` | Refresh expired access token | No |
| `GET` | `/api/auth/me/` | Retrieve logged-in user profile | Yes |

### Recipes & Stash (`/api/recipes/`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/recipes/` | List user's recipes (`?search=`, `?source_type=`, `?category=`, `?favorite=true`, `?ordering=`) | Yes (User Scoped) |
| `POST` | `/api/recipes/` | Stash a recipe (auto-assigns `owner = request.user` with duplicate prevention) | Yes (User Scoped) |
| `GET` | `/api/recipes/<id>/` | Retrieve recipe detail | Yes (User Scoped) |
| `PUT` / `PATCH` | `/api/recipes/<id>/` | Edit custom recipe | Yes (User Scoped) |
| `DELETE` | `/api/recipes/<id>/` | Delete recipe from stash | Yes (User Scoped) |
| `POST` | `/api/recipes/<id>/toggle-favorite/` | Toggle favorite state | Yes (User Scoped) |
| `GET` | `/api/recipes/stashed-ids/` | Returns list of external IDs currently stashed by user | Yes (User Scoped) |
| `GET` | `/api/recipes/stats/` | Computed metrics (total, custom count, TheMealDB count, favorites) | Yes (User Scoped) |

---

## 🧪 Testing & Verification

### Run Django Unit Test Suite
```bash
cd backend
python manage.py test accounts recipes
```

### Run Full E2E & TheMealDB Integration Suite
```bash
cd backend
python test_e2e_verification.py
```
