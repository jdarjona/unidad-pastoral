import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import type { Parish } from "../types";

const parishImages: Record<string, string> = {
  "St-Nicolas": "/parishes/st-nicolas.jpg",
  "St-Hubert": "/parishes/st-hubert.jpg",
  "N.-D. des Pauvres": "/parishes/notre-dame-des-pauvres.jpg",
  "St-François de Sales": "/parishes/st-francois-de-sales.jpg",
  "St-Gilles": "/parishes/st-gilles.jpg"
};

export default function ParishesPage() {
  const [parishes, setParishes] = useState<Parish[]>([]);

  useEffect(() => {
    api<Parish[]>("/api/parishes").then(setParishes);
  }, []);

  return (
    <>
      <p className="kicker">Unité pastorale</p>
      <h1>Nos paroisses</h1>
      <p className="meta parish-list-intro">
        Découvrez les communautés de l’unité pastorale et leurs informations pratiques.
      </p>

      <div className="grid parish-grid">
        {parishes.map((parish) => (
          <Link
            key={parish.id}
            to={`/parroquias/${parish.slug}`}
            className="card parish-card parish-card-link"
          >
            <img
              src={parishImages[parish.name] ?? "/parishes/st-nicolas.jpg"}
              alt={parish.name}
              className="parish-card-image"
            />
            <div className="parish-card-body">
              <span className="parish-dot" style={{ background: parish.accentColor }} />
              <span className="kicker">{parish.patron}</span>
              <h2>{parish.name}</h2>
              <p className="meta">{parish.address}</p>
              <p className="meta">{parish.massSchedule}</p>
              <span className="parish-card-cta">Voir la paroisse →</span>
            </div>
          </Link>
        ))}
      </div>
      {parishes.length === 0 && <p className="meta">Chargement des paroisses…</p>}
    </>
  );
}