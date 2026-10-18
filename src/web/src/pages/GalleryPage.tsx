import { useEffect, useState } from "react";
import { api, assetUrl } from "../api";
import type { Parish, Photo, PhotoAlbum } from "../types";

export default function GalleryPage() {
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [albums, setAlbums] = useState<PhotoAlbum[]>([]);
  const [parishId, setParishId] = useState<number | "all">("all");
  const [albumId, setAlbumId] = useState<number | "all">("all");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    api<Parish[]>("/api/parishes").then(setParishes);
  }, []);

  useEffect(() => {
    const query =
      parishId === "all" ? "/api/photo-albums" : `/api/photo-albums?parishId=${parishId}`;
    api<PhotoAlbum[]>(query).then(setAlbums);
  }, [parishId]);

  useEffect(() => {
    const query =
      parishId === "all" && albumId === "all"
        ? "/api/photos"
        : albumId === "all"
        ? `/api/photos?parishId=${parishId}`
        : `/api/photos?parishId=${parishId === "all" ? "" : parishId}&albumId=${albumId}`;

    api<Photo[]>(query).then(setPhotos);
  }, [parishId, albumId]);

  return (
    <>
      <h1>Photos</h1>
      <div className="filters">
        <button className={parishId === "all" ? "active" : ""} onClick={() => { setParishId("all"); setAlbumId("all"); }}>
          Toutes
        </button>
        {parishes.map((parish) => (
          <button
            key={parish.id}
            className={parishId === parish.id ? "active" : ""}
            onClick={() => { setParishId(parish.id); setAlbumId("all"); }}
          >
            {parish.name}
          </button>
        ))}
      </div>

      <div className="filters filters-secondary">
        <button className={albumId === "all" ? "active" : ""} onClick={() => setAlbumId("all")}>
          Tous les albums
        </button>
        {albums.map((album) => (
          <button
            key={album.id}
            className={albumId === album.id ? "active" : ""}
            onClick={() => setAlbumId(album.id)}
          >
            {album.name}
          </button>
        ))}
      </div>

      <div className="gallery">
        {photos.map((photo) => (
          <figure key={photo.id}>
            <button type="button" className="photo-tile-button" onClick={() => setSelectedPhoto(photo)}>
              <img src={assetUrl(photo.filePath)} alt={photo.title} />
            </button>
            <figcaption className="meta">
              {photo.title}
              {photo.album ? ` · ${photo.album.name}` : ""}
              {photo.parish ? ` · ${photo.parish.name}` : ""}
            </figcaption>
          </figure>
        ))}
      </div>
      {photos.length === 0 && <p className="meta">Aucune photo pour le moment. Ajoutez-en depuis le panneau Publier.</p>}

      {selectedPhoto && (
        <div className="photo-modal-backdrop" onClick={() => setSelectedPhoto(null)}>
          <div className="photo-modal-card" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="close-button" onClick={() => setSelectedPhoto(null)} aria-label="Fermer">×</button>
            <img src={assetUrl(selectedPhoto.filePath)} alt={selectedPhoto.title} className="photo-modal-image" />
            <div className="photo-modal-content">
              <h3>{selectedPhoto.title}</h3>
              {selectedPhoto.caption && <p>{selectedPhoto.caption}</p>}
              <p className="meta">
                {selectedPhoto.parish?.name ?? 'Unité pastorale'}
                {selectedPhoto.album ? ` · ${selectedPhoto.album.name}` : ''}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
