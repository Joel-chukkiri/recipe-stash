import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Discover from './pages/Discover';
import MyStash from './pages/MyStash';
import CreateRecipe from './pages/CreateRecipe';
import EditRecipe from './pages/EditRecipe';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Discover Experience */}
          <Route
            path="/discover"
            element={
              <ProtectedRoute>
                <Discover />
              </ProtectedRoute>
            }
          />
          <Route
            path="/discover/meal/:id"
            element={
              <ProtectedRoute>
                <Discover />
              </ProtectedRoute>
            }
          />

          {/* Personal My Stash Experience */}
          <Route
            path="/stash"
            element={
              <ProtectedRoute>
                <MyStash />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MyStash />
              </ProtectedRoute>
            }
          />

          {/* Dedicated 2-Column Create Recipe Experience */}
          <Route
            path="/recipes/create"
            element={
              <ProtectedRoute>
                <CreateRecipe />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-recipe"
            element={
              <ProtectedRoute>
                <CreateRecipe />
              </ProtectedRoute>
            }
          />

          {/* Dedicated 2-Column Edit Recipe Experience */}
          <Route
            path="/recipes/:id/edit"
            element={
              <ProtectedRoute>
                <EditRecipe />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-recipe/:id"
            element={
              <ProtectedRoute>
                <EditRecipe />
              </ProtectedRoute>
            }
          />

          {/* Root & Catch-all */}
          <Route path="/" element={<Navigate to="/discover" replace />} />
          <Route path="*" element={<Navigate to="/discover" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
