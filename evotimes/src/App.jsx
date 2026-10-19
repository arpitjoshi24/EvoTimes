
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";

import HomePage from "./pages/HomePage";
import NewsPage from "./pages/NewsPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminNewsForm from "./pages/AdminNewsForm";

export default function App() {
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {!isAdminRoute && <Header />}

      <Routes>
        {/* Public pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/news/:slug" element={<NewsPage />} />

        {/* Admin pages */}
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin"
          element={<Navigate to="/admin/dashboard" replace />}
        />

        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        <Route path="/admin/news/new" element={<AdminNewsForm />} />

        <Route
          path="/admin/news/:id/edit"
          element={<AdminNewsForm />}
        />

        {/* Unknown URLs */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {!isAdminRoute && <Footer />}
    </div>
  );
}
