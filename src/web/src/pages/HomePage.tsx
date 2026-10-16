import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import type { CalendarItem, Parish, Post } from "../types";

const parishImages: Record<string, string> = {
  "St-Nicolas": "/parishes/st-nicolas.jpg",
  "St-Hubert": "/parishes/st-hubert.jpg",
  "N.-D. des Pauvres": "/parishes/notre-dame-des-pauvres.jpg",
  "St-François de Sales": "/parishes/st-francois-de-sales.jpg",
  "St-Gilles": "/parishes/st-gilles.jpg"
};

const parishSites: Record<string, string> = {
  "St-Gilles": "https://www.paroissesaintgilles.be",
  "St-François de Sales": "https://www.saint-françois-de-sales.be"
};

const upSites = [
  { label: "Paroisse Saint-Gilles", url: "https://www.paroissesaintgilles.be" },
  { label: "Paroisse Saint-François de Sales", url: "https://www.saint-françois-de-sales.be" }
];

export default function HomePage() {
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<CalendarItem[]>([]);

  useEffect(() => {
    api<Parish[]>("/api/parishes").then(setParishes);
    api<Post[]>("/api/posts?type=News").then((items) => setPosts(items.slice(0, 4)));
    api<CalendarItem[]>("/api/calendar").then((items) => setEvents(items.slice(0, 12)));
  }, []);

  const agenda = useMemo(
    () =>
      [...events].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()),
    [events]
  );

  return (
    <>
      <section className="hero hero-home">
        <div className="hero-copy">
          <p className="kicker">Unité pastorale</p>
          <h1>Une seule paroisse, plusieurs communautés.</h1>
          <p>
            Bienvenue sur le site de l’Unité pastorale. Retrouvez les annonces, les célébrations,
            les activités, les photos et les informations des communautés de Saint-Nicolas,
            Saint-Hubert, Notre-Dame des Pauvres, Saint-François de Sales et Saint-Gilles.
          </p>
          <div className="cta-row">
            <Link to="/actualites" className="button primary">Voir les actualités</Link>
            <Link to="/paroisses" className="button">Découvrir les paroisses</Link>
          </div>
        </div>

        <aside className="agenda-panel card">
          <div className="agenda-header">
            <h3>Agenda</h3>
            <Link to="/calendrier">Voir le calendrier</Link>
          </div>
          <div className="agenda-scroll">
            {agenda.length === 0 && <p className="meta">Aucun événement pour le moment.</p>}
            {agenda.map((event) => (
              <div key={event.id} className="agenda-item">
                <span className="agenda-date">
                  {new Date(event.startsAt).toLocaleDateString("fr", { day: "2-digit", month: "short" })}
                </span>
                <div>
                  <strong>{event.title}</strong>
                  <p className="meta">{event.location || "Lieu à préciser"}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="home-section">
        <div className="section-heading">
          <h2>Dernières actualités</h2>
          <Link to="/actualites">Tout voir</Link>
        </div>
        <div className="grid">
          {posts.map((post) => (
            <article key={post.id} className="card content-card">
              <span className="kicker">{post.parish?.name ?? "Unité pastorale"}</span>
              <h3>
                <Link to={`/aviso/${post.slug}`}>{post.title}</Link>
              </h3>
              <p className="meta">{new Date(post.publishedAt).toLocaleDateString("fr")}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="section-heading">
          <h2>Nos paroisses</h2>
          <Link to="/calendrier">Calendrier</Link>
        </div>
        <div className="grid parish-grid">
          {parishes.map((parish) => {
            const image = parishImages[parish.name] ?? "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=900&q=80";
            const url = parishSites[parish.name];
            return (
              <div key={parish.id} className="card parish-card">
                <img src={image} alt={parish.name} className="parish-card-image" />
                <div className="parish-card-body">
                  <span className="parish-dot" style={{ background: parish.accentColor }} />
                  <span className="kicker">{parish.patron}</span>
                  <h3>{parish.name}</h3>
                  <p className="meta">{parish.address}</p>
                  <p className="meta">{parish.massSchedule}</p>
                  <div className="parish-links">
                    <Link to={`/parroquias/${parish.slug}`}>Voir la paroisse</Link>
                    {url ? (
                      <a href={url} target="_blank" rel="noreferrer">
                        Site web
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="home-section">
        <div className="section-heading">
          <h2>Sites de l’UP à visiter</h2>
        </div>
        <div className="sites-grid">
          {upSites.map((site) => (
            <a key={site.url} href={site.url} target="_blank" rel="noreferrer" className="site-link card">
              {site.label}
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
