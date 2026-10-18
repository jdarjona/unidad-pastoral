import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import type { CalendarItem, Post } from "../types";

const upSites = [
  { label: "Paroisse Saint-Gilles", url: "https://www.paroissesaintgilles.be" },
  { label: "Paroisse Saint-François de Sales", url: "https://www.saint-françois-de-sales.be" }
];

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<CalendarItem[]>([]);

  useEffect(() => {
    api<Post[]>("/api/posts?type=News").then((items) => setPosts(items.slice(0, 4)));
    api<CalendarItem[]>("/api/calendar").then(setEvents);
  }, []);

  const agenda = useMemo(
    () => {
      const now = Date.now();
      return [...events]
        .filter((event) => new Date(event.startsAt).getTime() >= now)
        .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
        .slice(0, 4);
    },
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
            <h3>Derniers événements</h3>
            <Link to="/calendrier">Voir le calendrier</Link>
          </div>
          <div className="agenda-scroll">
            {agenda.length === 0 && <p className="meta">Aucun événement à venir pour le moment.</p>}
            {agenda.map((event) => (
              <div key={event.id} className="agenda-item">
                <span className="agenda-date">
                  {new Date(event.startsAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                </span>
                <div>
                  <strong>{event.title}</strong>
                  <p className="meta">
                    {event.allDay ? "Toute la journée" : new Date(event.startsAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    {event.location ? ` · ${event.location}` : " · Lieu à préciser"}
                  </p>
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
