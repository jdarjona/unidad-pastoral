import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import type { CalendarItem, Parish, Photo, PhotoAlbum, Post } from "../types";

export default function ParishPage() {
  const { slug } = useParams();
  const [parish, setParish] = useState<Parish | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [albums, setAlbums] = useState<PhotoAlbum[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [events, setEvents] = useState<CalendarItem[]>([]);

  useEffect(() => {
    if (!slug) {
      return;
    }

    api<Parish>(`/api/parishes/${slug}`).then((item) => {
      setParish(item);
      api<Post[]>(`/api/posts?parishId=${item.id}`).then(setPosts);
      api<PhotoAlbum[]>(`/api/photo-albums?parishId=${item.id}`).then(setAlbums);
      api<Photo[]>(`/api/photos?parishId=${item.id}`).then(setPhotos);
      api<CalendarItem[]>(`/api/calendar?parishId=${item.id}`).then(setEvents);
    });
  }, [slug]);

  if (!parish) {
    return <p>Chargement de la paroisse…</p>;
  }

  return (
    <>
      <p className="kicker">{parish.patron}</p>
      <h1>{parish.name}</h1>
      <p>{parish.description}</p>
      <p className="meta">
        {parish.address} · {parish.massSchedule}
      </p>
      <h2>Annonces</h2>
      <div className="grid">
        {posts.map((post) => (
          <Link key={post.id} className="card" to={`/aviso/${post.slug}`}>
            <span className="kicker">{post.type}</span>
            <h3>{post.title}</h3>
          </Link>
        ))}
      </div>
      <h2>Prochains événements</h2>
      {events.map((event) => (
        <div key={event.id} className="card" style={{ marginBottom: 8 }}>
          <strong>{event.title}</strong>
          <p className="meta">{new Date(event.startsAt).toLocaleString("fr")}</p>
        </div>
      ))}

      <h2>Albums</h2>
      <div className="sites-grid">
        {albums.map((album) => (
          <div key={album.id} className="card">
            <h3>{album.name}</h3>
            {album.description && <p className="meta">{album.description}</p>}
          </div>
        ))}
      </div>

      <h2>Photos</h2>
      <div className="gallery">
        {photos.map((photo) => (
          <figure key={photo.id}>
            <img src={photo.filePath} alt={photo.title} />
            <figcaption className="meta">
              {photo.title}
              {photo.album ? ` · ${photo.album.name}` : ""}
            </figcaption>
          </figure>
        ))}
      </div>
    </>
  );
}
