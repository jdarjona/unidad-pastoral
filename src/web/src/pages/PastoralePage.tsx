import { useEffect, useState } from "react";
import { api } from "../api";
import type { PastoraleActivity } from "../types";

export default function PastoralePage() {
  const [activities, setActivities] = useState<PastoraleActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<PastoraleActivity[]>("/api/pastorale")
      .then(setActivities)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <p className="kicker">Unité pastorale</p>
      <h1>Pastorale</h1>
      <p className="meta">Les activités pastorales proposées dans nos paroisses.</p>

      {loading ? (
        <p className="meta">Chargement des activités…</p>
      ) : activities.length ? (
        <div className="grid pastorale-grid">
          {activities.map((activity) => (
            <article className="card pastorale-card" key={activity.id}>
              <p className="kicker">{activity.parishName}</p>
              <h2>{activity.name}</h2>
              <p>{activity.description}</p>
            </article>
          ))}
        </div>
      ) : (
        <p className="meta pastorale-empty">Aucune activité pastorale n’a encore été publiée.</p>
      )}
    </>
  );
}