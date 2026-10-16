import type { ReactNode } from "react";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import { getToken } from "./api";
import AdminPage from "./pages/AdminPage";
import CalendarPage from "./pages/CalendarPage";
import FeedPage from "./pages/FeedPage";
import GalleryPage from "./pages/GalleryPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ParishPage from "./pages/ParishPage";
import PostPage from "./pages/PostPage";

function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="shell">
      <header className="top">
        <Link className="brand" to="/">
          Unité pastorale
        </Link>
        <nav>
          <Link to="/">Accueil</Link>
          <Link to="/actualites">Actualités</Link>
          <Link to="/evenements">Événements</Link>
          <Link to="/documents">Documents</Link>
          <Link to="/photos">Photos</Link>
          <Link to="/calendrier">Calendrier</Link>
          <Link to="/paroisses">Paroisses</Link>
          <Link to="/admin">Publier</Link>
        </nav>
      </header>
      {children}
      <footer>
        <div className="footer-grid">
          <div>
            <strong>Unité pastorale</strong>
            <p>
              Contact :{" "}
              <a href="mailto:uniteparoissiale.sn.sh@gmail.com">
                uniteparoissiale.sn.sh@gmail.com
              </a>
            </p>
            <p>Responsable : Monsieur l’Abbé Philippe Delaume</p>
            <p>Tél. : 04 226 45 68</p>
          </div>
          <div>
            <strong>Paroisses</strong>
            <p>Saint-Nicolas · Saint-Hubert · Notre-Dame des Pauvres</p>
            <p>Saint-François de Sales · Saint-Gilles</p>
          </div>
          <div>
            <strong>Contacts paroissiaux</strong>
            <p>Philippe Delaume : 04-226.45.68</p>
            <p>Pierre Verger : 0470-955.725</p>
            <p>Pierre-Yves Delfanne : 0456-951.716</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function RequireAdmin({ children }: { children: ReactNode }) {
  if (!getToken()) {
    return <Navigate to="/admin/connexion" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/paroisses" element={<HomePage />} />
        <Route path="/parroquias/:slug" element={<ParishPage />} />
        <Route
          path="/actualites"
          element={<FeedPage type="News" title="Actualités" />}
        />
        <Route
          path="/evenements"
          element={<FeedPage type="Event" title="Événements" />}
        />
        <Route
          path="/documents"
          element={<FeedPage type="Document" title="Documents" />}
        />
        <Route path="/aviso/:slug" element={<PostPage />} />
        <Route path="/photos" element={<GalleryPage />} />
        <Route path="/calendrier" element={<CalendarPage />} />
        <Route path="/admin/connexion" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminPage />
            </RequireAdmin>
          }
        />
      </Routes>
    </Layout>
  );
}
