import { FormEvent, useEffect, useState } from "react";
import { api, setToken } from "../api";
import type { CalendarItem, Parish, Photo, PhotoAlbum, Post } from "../types";

type AdminTab = "posts" | "albums" | "photos" | "calendar";
type PendingDelete = { type: "post" | "photo" | "event"; id: number };

type EditorState = {
  tab: AdminTab;
  mode: "create" | "edit";
  post?: Post;
  photo?: Photo;
  event?: CalendarItem;
};

export default function AdminPage() {
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [albums, setAlbums] = useState<PhotoAlbum[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [events, setEvents] = useState<CalendarItem[]>([]);
  const [message, setMessage] = useState("");
  const [successModal, setSuccessModal] = useState("");
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [editorError, setEditorError] = useState("");
  const [newAlbumName, setNewAlbumName] = useState("");
  const [newAlbumDescription, setNewAlbumDescription] = useState("");
  const [albumFormParishId, setAlbumFormParishId] = useState("all");
  const [activeTab, setActiveTab] = useState<AdminTab>("posts");
  const [postFilter, setPostFilter] = useState("");
  const [postDateFilter, setPostDateFilter] = useState("");
  const [postParishFilter, setPostParishFilter] = useState("all");
  const [photoFilter, setPhotoFilter] = useState("");
  const [photoDateFilter, setPhotoDateFilter] = useState("");
  const [photoParishFilter, setPhotoParishFilter] = useState("all");
  const [photoAlbumFilter, setPhotoAlbumFilter] = useState("all");
  const [eventFilter, setEventFilter] = useState("");
  const [eventDateFilter, setEventDateFilter] = useState("");
  const [eventParishFilter, setEventParishFilter] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  function showSuccessModal(text: string) {
    setSuccessModal(text);
    window.setTimeout(() => setSuccessModal(""), 2200);
  }

  async function loadData() {
    const [parishList, albumList, postList, photoList, eventList] = await Promise.all([
      api<Parish[]>('/api/parishes'),
      api<PhotoAlbum[]>('/api/photo-albums'),
      api<Post[]>('/api/posts'),
      api<Photo[]>('/api/photos'),
      api<CalendarItem[]>('/api/calendar')
    ]);
    setParishes(parishList);
    setAlbums(albumList);
    setPosts(postList);
    setPhotos(photoList);
    setEvents(eventList);
  }

  async function createAlbum(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newAlbumName.trim()) {
      setEditorError('Le nom de l’album est obligatoire.');
      return;
    }

    try {
      const payload = {
        parishId: albumFormParishId === 'all' ? null : Number(albumFormParishId),
        name: newAlbumName,
        description: newAlbumDescription
      };

      await api('/api/photo-albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      setNewAlbumName('');
      setNewAlbumDescription('');
      setAlbumFormParishId('all');
      setMessage('Album créé.');
      showSuccessModal('Album créé.');
      await loadData();
    } catch (error) {
      setEditorError(error instanceof Error ? error.message : 'Erreur inconnue.');
    }
  }

  function closeEditor() {
    setEditor(null);
    setEditorError("");
  }

  function matchesText(value: string | null | undefined, query: string) {
    if (!query.trim()) return true;
    return (value ?? '').toLowerCase().includes(query.toLowerCase());
  }

  function matchesParish(parishId: number | null | undefined, selected: string) {
    if (selected === 'all') return true;
    return Number(parishId) === Number(selected);
  }

  function matchesAlbum(albumId: number | null | undefined, selected: string) {
    if (selected === 'all') return true;
    return Number(albumId) === Number(selected);
  }

  function matchesDate(date: string | null | undefined, selectedDate: string) {
    if (!selectedDate) return true;
    if (!date) return false;
    return new Date(date).toISOString().slice(0, 10) === selectedDate;
  }

  const filteredPosts = posts.filter((post) => {
    const haystack = `${post.title} ${post.body} ${post.parish?.name ?? ''}`;
    return (
      matchesText(haystack, postFilter) &&
      matchesDate(post.eventStartsAt ?? post.publishedAt, postDateFilter) &&
      matchesParish(post.parishId, postParishFilter)
    );
  });

  const filteredAlbums = albums.filter((album) => {
    const haystack = `${album.name} ${album.description ?? ''} ${album.parish?.name ?? 'Unité pastorale'}`;
    return matchesText(haystack, photoFilter) && matchesParish(album.parishId, photoParishFilter);
  });

  const filteredPhotos = photos.filter((photo) => {
    const haystack = `${photo.title} ${photo.caption} ${photo.parish?.name ?? ''} ${photo.album?.name ?? ''}`;
    return (
      matchesText(haystack, photoFilter) &&
      matchesDate(photo.takenAt, photoDateFilter) &&
      matchesParish(photo.parishId, photoParishFilter) &&
      matchesAlbum(photo.albumId, photoAlbumFilter)
    );
  });

  const filteredEvents = events.filter((event) => {
    const haystack = `${event.title} ${event.description} ${event.location} ${event.parish?.name ?? ''}`;
    return (
      matchesText(haystack, eventFilter) &&
      matchesDate(event.startsAt, eventDateFilter) &&
      matchesParish(event.parishId, eventParishFilter)
    );
  });

  async function handleSubmitPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      if (editor?.mode === 'edit' && editor.post) {
        await api(`/api/posts/${editor.post.id}`, { method: 'PUT', body: data });
        setMessage('Publication mise à jour.');
        showSuccessModal('Publication mise à jour.');
      } else {
        await api('/api/posts', { method: 'POST', body: data });
        setMessage('Publication enregistrée.');
        showSuccessModal('Publication enregistrée.');
      }

      form.reset();
      closeEditor();
      await loadData();
    } catch (error) {
      setEditorError(error instanceof Error ? error.message : 'Erreur inconnue.');
    }
  }

  async function handleSubmitPhoto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      if (editor?.mode === 'edit' && editor.photo) {
        const payload = new FormData();
        payload.append('ParishId', String(data.get('ParishId') ?? ''));
        payload.append('AlbumId', String(data.get('AlbumId') ?? ''));
        payload.append('Title', String(data.get('Title') ?? ''));
        payload.append('Caption', String(data.get('Caption') ?? ''));
        if (data.get('File')) {
          payload.append('File', data.get('File') as File);
        }
        await api(`/api/photos/${editor.photo.id}`, { method: 'PUT', body: payload });
        setMessage('Photo mise à jour.');
        showSuccessModal('Photo mise à jour.');
      } else {
        await api('/api/photos', { method: 'POST', body: data });
        setMessage('Photo téléchargée.');
        showSuccessModal('Photo téléchargée.');
      }

      form.reset();
      closeEditor();
      await loadData();
    } catch (error) {
      setEditorError(error instanceof Error ? error.message : 'Erreur inconnue.');
    }
  }

  async function handleSubmitEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      parishId: Number(data.get('parishId')),
      title: String(data.get('title') ?? ''),
      description: String(data.get('description') ?? ''),
      location: String(data.get('location') ?? ''),
      startsAt: String(data.get('startsAt') ?? ''),
      endsAt: String(data.get('endsAt') ?? '') || null,
      allDay: data.get('allDay') === 'on'
    };

    try {
      if (editor?.mode === 'edit' && editor.event) {
        await api(`/api/calendar/${editor.event.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        setMessage('Événement mis à jour.');
        showSuccessModal('Événement mis à jour.');
      } else {
        await api('/api/calendar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        setMessage('Événement ajouté au calendrier.');
        showSuccessModal('Événement ajouté au calendrier.');
      }

      form.reset();
      closeEditor();
      await loadData();
    } catch (error) {
      setEditorError(error instanceof Error ? error.message : 'Erreur inconnue.');
    }
  }

  async function executeDelete(target: PendingDelete) {
    if (target.type === 'post') {
      await api(`/api/posts/${target.id}`, { method: 'DELETE' });
      setMessage('Publication supprimée.');
      showSuccessModal('Publication supprimée.');
    }

    if (target.type === 'photo') {
      await api(`/api/photos/${target.id}`, { method: 'DELETE' });
      setMessage('Photo supprimée.');
      showSuccessModal('Photo supprimée.');
    }

    if (target.type === 'event') {
      await api(`/api/calendar/${target.id}`, { method: 'DELETE' });
      setMessage('Événement supprimé.');
      showSuccessModal('Événement supprimé.');
    }

    setPendingDelete(null);
    await loadData();
  }

  function openCreatePostModal() {
    setEditor({ tab: 'posts', mode: 'create' });
    setEditorError('');
  }

  function getPostTypeValue(type: Post['type'] | string | null | undefined) {
    if (type === null || type === undefined) return '0';
    if (typeof type === 'number') return String(type);
    const normalized = String(type).toLowerCase();
    if (normalized === 'news') return '0';
    if (normalized === 'event') return '1';
    if (normalized === 'document') return '2';
    return '0';
  }

  function openEditPostModal(post: Post) {
    setEditor({ tab: 'posts', mode: 'edit', post });
    setEditorError('');
    setTimeout(() => {
      const form = document.querySelector('form[data-post-form]') as HTMLFormElement | null;
      if (!form) return;
      const fields = form.elements as any;
      fields.namedItem('Type').value = getPostTypeValue(post.type);
      fields.namedItem('ParishId').value = post.parishId ? String(post.parishId) : '';
      fields.namedItem('Title').value = post.title;
      fields.namedItem('Body').value = post.body || '';
      fields.namedItem('EventStartsAt').value = post.eventStartsAt ? new Date(post.eventStartsAt).toISOString().slice(0, 16) : '';
    }, 0);
  }

  function openCreateAlbumModal() {
    setEditor({ tab: 'albums', mode: 'create' });
    setEditorError('');
  }

  function openCreatePhotoModal() {
    setEditor({ tab: 'photos', mode: 'create' });
    setEditorError('');
  }

  function openEditPhotoModal(photo: Photo) {
    setEditor({ tab: 'photos', mode: 'edit', photo });
    setEditorError('');
    setTimeout(() => {
      const form = document.querySelector('form[data-photo-form]') as HTMLFormElement | null;
      if (!form) return;
      const fields = form.elements as any;
      fields.namedItem('ParishId').value = photo.parishId ? String(photo.parishId) : '';
      fields.namedItem('AlbumId').value = photo.albumId ? String(photo.albumId) : '';
      fields.namedItem('Title').value = photo.title || '';
      fields.namedItem('Caption').value = photo.caption || '';
    }, 0);
  }

  function openCreateEventModal() {
    setEditor({ tab: 'calendar', mode: 'create' });
    setEditorError('');
  }

  function openEditEventModal(event: CalendarItem) {
    setEditor({ tab: 'calendar', mode: 'edit', event });
    setEditorError('');
    setTimeout(() => {
      const form = document.querySelector('form[data-event-form]') as HTMLFormElement | null;
      if (!form) return;
      const fields = form.elements as any;
      fields.namedItem('parishId').value = String(event.parishId);
      fields.namedItem('title').value = event.title;
      fields.namedItem('description').value = event.description || '';
      fields.namedItem('location').value = event.location || '';
      fields.namedItem('startsAt').value = new Date(event.startsAt).toISOString().slice(0, 16);
      fields.namedItem('endsAt').value = event.endsAt ? new Date(event.endsAt).toISOString().slice(0, 16) : '';
      fields.namedItem('allDay').checked = Boolean(event.allDay);
    }, 0);
  }

  function renderAlbumModal() {
    if (!editor || editor.tab !== 'albums') return null;
    return (
      <div className="modal-backdrop" onClick={closeEditor}>
        <div className="modal-card" onClick={(event) => event.stopPropagation()}>
          <div className="modal-header">
            <h3>Créer un album</h3>
            <button type="button" className="close-button" onClick={closeEditor}>×</button>
          </div>

          {editorError && <p className="modal-error">{editorError}</p>}

          <form className="stack" onSubmit={createAlbum}>
            <label>
              Nom de l’album
              <input value={newAlbumName} onChange={(event) => setNewAlbumName(event.target.value)} required />
            </label>
            <label>
              Description
              <textarea value={newAlbumDescription} onChange={(event) => setNewAlbumDescription(event.target.value)} rows={3} />
            </label>
            <label>
              Associer à une paroisse
              <select value={albumFormParishId} onChange={(event) => setAlbumFormParishId(event.target.value)}>
                <option value="all">Toute l’unité pastorale</option>
                {parishes.map((parish) => (
                  <option key={parish.id} value={parish.id}>
                    {parish.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="modal-actions">
              <button type="button" onClick={closeEditor}>Annuler</button>
              <button type="submit" className="primary">Créer</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  function renderPostModal() {
    if (!editor || editor.tab !== 'posts') return null;
    const isEdit = editor.mode === 'edit';
    return (
      <div className="modal-backdrop" onClick={closeEditor}>
        <div className="modal-card" onClick={(event) => event.stopPropagation()}>
          <div className="modal-header">
            <h3>{isEdit ? 'Modifier la publication' : 'Ajouter une publication'}</h3>
            <button type="button" className="close-button" onClick={closeEditor}>×</button>
          </div>

          {editorError && <p className="modal-error">{editorError}</p>}

          <form className="stack" data-post-form onSubmit={handleSubmitPost}>
            <label>
              Type
              <select name="Type" defaultValue={getPostTypeValue(editor.post?.type)}>
                <option value="0">Actualité</option>
                <option value="1">Événement</option>
                <option value="2">Document</option>
              </select>
            </label>
            <label>
              Paroisse
              <select name="ParishId" defaultValue={editor.post?.parishId ? String(editor.post.parishId) : ''}>
                <option value="">Toute l’unité</option>
                {parishes.map((parish) => (
                  <option key={parish.id} value={parish.id}>
                    {parish.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Titre
              <input name="Title" required defaultValue={editor.post?.title ?? ''} />
            </label>
            <label>
              Texte
              <textarea name="Body" rows={4} defaultValue={editor.post?.body ?? ''} />
            </label>
            <label>
              Date de l’événement
              <input name="EventStartsAt" type="datetime-local" defaultValue={editor.post?.eventStartsAt ? new Date(editor.post.eventStartsAt).toISOString().slice(0, 16) : ''} />
            </label>
            <label>
              Image de couverture
              <input name="Cover" type="file" accept="image/*" />
            </label>
            <label>
              Document joint
              <input name="Attachment" type="file" />
            </label>
            <div className="modal-actions">
              <button type="button" onClick={closeEditor}>Annuler</button>
              <button className="primary" type="submit">
                {isEdit ? 'Sauvegarder' : 'Ajouter'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  function renderPhotoModal() {
    if (!editor || editor.tab !== 'photos') return null;
    const isEdit = editor.mode === 'edit';
    return (
      <div className="modal-backdrop" onClick={closeEditor}>
        <div className="modal-card" onClick={(event) => event.stopPropagation()}>
          <div className="modal-header">
            <h3>{isEdit ? 'Modifier la photo' : 'Ajouter une photo'}</h3>
            <button type="button" className="close-button" onClick={closeEditor}>×</button>
          </div>

          {editorError && <p className="modal-error">{editorError}</p>}

          <form className="stack" data-photo-form onSubmit={handleSubmitPhoto}>
            <label>
              Paroisse
              <select name="ParishId" defaultValue={editor.photo?.parishId ? String(editor.photo.parishId) : ''}>
                <option value="">Toute l’unité</option>
                {parishes.map((parish) => (
                  <option key={parish.id} value={parish.id}>
                    {parish.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Album
              <select name="AlbumId" defaultValue={editor.photo?.albumId ? String(editor.photo.albumId) : ''}>
                <option value="">Sans album</option>
                {albums.map((album) => (
                  <option key={album.id} value={album.id}>
                    {album.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Titre
              <input name="Title" defaultValue={editor.photo?.title ?? ''} />
            </label>
            <label>
              Légende
              <input name="Caption" defaultValue={editor.photo?.caption ?? ''} />
            </label>
            <label>
              Fichier
              <input name="File" type="file" accept="image/*" required={!isEdit} />
            </label>
            <div className="modal-actions">
              <button type="button" onClick={closeEditor}>Annuler</button>
              <button className="primary" type="submit">
                {isEdit ? 'Sauvegarder' : 'Télécharger'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  function renderCalendarModal() {
    if (!editor || editor.tab !== 'calendar') return null;
    const isEdit = editor.mode === 'edit';
    return (
      <div className="modal-backdrop" onClick={closeEditor}>
        <div className="modal-card" onClick={(event) => event.stopPropagation()}>
          <div className="modal-header">
            <h3>{isEdit ? 'Modifier l’événement' : 'Ajouter un événement'}</h3>
            <button type="button" className="close-button" onClick={closeEditor}>×</button>
          </div>

          {editorError && <p className="modal-error">{editorError}</p>}

          <form className="stack" data-event-form onSubmit={handleSubmitEvent}>
            <label>
              Paroisse
              <select name="parishId" defaultValue={editor.event?.parishId ? String(editor.event.parishId) : String(parishes[0]?.id ?? '')} required>
                {parishes.map((parish) => (
                  <option key={parish.id} value={parish.id}>
                    {parish.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Titre
              <input name="title" required defaultValue={editor.event?.title ?? ''} />
            </label>
            <label>
              Description
              <textarea name="description" rows={3} defaultValue={editor.event?.description ?? ''} />
            </label>
            <label>
              Lieu
              <input name="location" defaultValue={editor.event?.location ?? ''} />
            </label>
            <label>
              Début
              <input name="startsAt" type="datetime-local" required defaultValue={editor.event?.startsAt ? new Date(editor.event.startsAt).toISOString().slice(0, 16) : ''} />
            </label>
            <label>
              Fin
              <input name="endsAt" type="datetime-local" defaultValue={editor.event?.endsAt ? new Date(editor.event.endsAt).toISOString().slice(0, 16) : ''} />
            </label>
            <label className="checkbox-row">
              <input name="allDay" type="checkbox" defaultChecked={Boolean(editor.event?.allDay)} /> Toute la journée
            </label>
            <div className="modal-actions">
              <button type="button" onClick={closeEditor}>Annuler</button>
              <button className="primary" type="submit">
                {isEdit ? 'Sauvegarder' : 'Ajouter'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <h1>Administration</h1>
      <p>
        <button
          onClick={() => {
            setToken(null);
            window.location.href = '/';
          }}
        >
          Déconnexion
        </button>
      </p>
      {message && <p className="admin-message">{message}</p>}

      {successModal && (
        <div className="success-modal-backdrop" aria-live="polite">
          <div className="success-modal" role="dialog" aria-modal="true">
            <div className="success-modal-icon">✓</div>
            <strong>Enregistré</strong>
            <p>{successModal}</p>
          </div>
        </div>
      )}

      {pendingDelete && (
        <div className="confirm-modal-backdrop">
          <div className="confirm-modal">
            <h3>Confirmer la suppression</h3>
            <p>
              Voulez-vous vraiment supprimer cet élément ? Cette action est irréversible.
            </p>
            <div className="confirm-actions">
              <button type="button" onClick={() => setPendingDelete(null)}>
                Annuler
              </button>
              <button type="button" className="primary" onClick={() => executeDelete(pendingDelete)}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {renderAlbumModal()}
      {renderPostModal()}
      {renderPhotoModal()}
      {renderCalendarModal()}

      <div className="admin-tabs" role="tablist" aria-label="Catégories d’administration">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'posts'}
          className={activeTab === 'posts' ? 'active' : ''}
          onClick={() => setActiveTab('posts')}
        >
          Actualités / documents
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'albums'}
          className={activeTab === 'albums' ? 'active' : ''}
          onClick={() => setActiveTab('albums')}
        >
          Albums
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'photos'}
          className={activeTab === 'photos' ? 'active' : ''}
          onClick={() => setActiveTab('photos')}
        >
          Photos
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'calendar'}
          className={activeTab === 'calendar' ? 'active' : ''}
          onClick={() => setActiveTab('calendar')}
        >
          Calendrier
        </button>
      </div>

      <div className="admin-panel">
        {activeTab === 'posts' && (
          <section className="stack card admin-section">
            <div className="admin-toolbar">
              <h2>Actualités / documents</h2>
              <button type="button" className="primary" onClick={openCreatePostModal}>Ajouter</button>
            </div>

            <div className="admin-list-filters">
              <input
                value={postFilter}
                onChange={(e) => setPostFilter(e.target.value)}
                placeholder="Rechercher description ou titre"
              />
              <input
                type="date"
                value={postDateFilter}
                onChange={(e) => setPostDateFilter(e.target.value)}
              />
              <select value={postParishFilter} onChange={(e) => setPostParishFilter(e.target.value)}>
                <option value="all">Toutes les paroisses</option>
                {parishes.map((parish) => (
                  <option key={parish.id} value={parish.id}>
                    {parish.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-list">
              {filteredPosts.map((post) => (
                <div key={post.id} className="admin-item">
                  <div>
                    <strong>{post.title}</strong>
                    <div className="meta">{post.body || 'Aucun texte'}</div>
                    <div className="meta">
                      {post.parish?.name ?? 'Unité'} · {post.eventStartsAt ? new Date(post.eventStartsAt).toLocaleDateString('fr') : new Date(post.publishedAt).toLocaleDateString('fr')}
                    </div>
                  </div>
                  <div className="admin-actions">
                    <button type="button" onClick={() => openEditPostModal(post)}>Modifier</button>
                    <button type="button" onClick={() => setPendingDelete({ type: 'post', id: post.id })}>Supprimer</button>
                  </div>
                </div>
              ))}
              {!filteredPosts.length && <p className="meta empty-state">Aucune publication ne correspond aux filtres.</p>}
            </div>
          </section>
        )}

        {activeTab === 'albums' && (
          <section className="stack card admin-section">
            <div className="admin-toolbar">
              <h2>Albums</h2>
              <button type="button" className="primary" onClick={openCreateAlbumModal}>Créer un album</button>
            </div>

            <div className="admin-list-filters">
              <input
                value={photoFilter}
                onChange={(e) => setPhotoFilter(e.target.value)}
                placeholder="Rechercher un album"
              />
              <select value={photoParishFilter} onChange={(e) => setPhotoParishFilter(e.target.value)}>
                <option value="all">Toute l’unité pastorale</option>
                {parishes.map((parish) => (
                  <option key={parish.id} value={parish.id}>
                    {parish.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-list">
              {filteredAlbums.map((album) => (
                <div key={album.id} className="admin-item">
                  <div>
                    <strong>{album.name}</strong>
                    <div className="meta">{album.description || 'Sans description'}</div>
                    <div className="meta">
                      {album.parish?.name ?? 'Toute l’unité pastorale'} · {new Date(album.createdAt).toLocaleDateString('fr')}
                    </div>
                  </div>
                  <div className="admin-actions">
                    <button type="button" onClick={() => setPendingDelete({ type: 'photo', id: 0 })} disabled>
                      Modifier
                    </button>
                    <button type="button" onClick={() => setPendingDelete({ type: 'photo', id: 0 })} disabled>
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
              {!filteredAlbums.length && <p className="meta empty-state">Aucun album ne correspond aux filtres.</p>}
            </div>
          </section>
        )}

        {activeTab === 'photos' && (
          <section className="stack card admin-section">
            <div className="admin-toolbar">
              <h2>Photos</h2>
              <button type="button" className="primary" onClick={openCreatePhotoModal}>Ajouter</button>
            </div>

            <div className="admin-list-filters">
              <input
                value={photoFilter}
                onChange={(e) => setPhotoFilter(e.target.value)}
                placeholder="Rechercher description ou titre"
              />
              <input
                type="date"
                value={photoDateFilter}
                onChange={(e) => setPhotoDateFilter(e.target.value)}
              />
              <select value={photoParishFilter} onChange={(e) => setPhotoParishFilter(e.target.value)}>
                <option value="all">Toutes les paroisses</option>
                {parishes.map((parish) => (
                  <option key={parish.id} value={parish.id}>
                    {parish.name}
                  </option>
                ))}
              </select>
              <select value={photoAlbumFilter} onChange={(e) => setPhotoAlbumFilter(e.target.value)}>
                <option value="all">Tous les albums</option>
                {albums.map((album) => (
                  <option key={album.id} value={album.id}>
                    {album.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-list">
              {filteredPhotos.map((photo) => (
                <div key={photo.id} className="admin-item">
                  <div>
                    <strong>{photo.title}</strong>
                    <div className="meta">{photo.caption || 'Sans légende'}</div>
                    <div className="meta">
                      {photo.parish?.name ?? 'Unité'} · {photo.album?.name ?? 'Sans album'} · {new Date(photo.takenAt).toLocaleDateString('fr')}
                    </div>
                  </div>
                  <div className="admin-actions">
                    <button type="button" onClick={() => openEditPhotoModal(photo)}>Modifier</button>
                    <button type="button" onClick={() => setPendingDelete({ type: 'photo', id: photo.id })}>Supprimer</button>
                  </div>
                </div>
              ))}
              {!filteredPhotos.length && <p className="meta empty-state">Aucune photo ne correspond aux filtres.</p>}
            </div>
          </section>
        )}

        {activeTab === 'calendar' && (
          <section className="stack card admin-section">
            <div className="admin-toolbar">
              <h2>Calendrier</h2>
              <button type="button" className="primary" onClick={openCreateEventModal}>Ajouter</button>
            </div>

            <div className="admin-list-filters">
              <input
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
                placeholder="Rechercher description ou lieu"
              />
              <input
                type="date"
                value={eventDateFilter}
                onChange={(e) => setEventDateFilter(e.target.value)}
              />
              <select value={eventParishFilter} onChange={(e) => setEventParishFilter(e.target.value)}>
                <option value="all">Toutes les paroisses</option>
                {parishes.map((parish) => (
                  <option key={parish.id} value={parish.id}>
                    {parish.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-list">
              {filteredEvents.map((event) => (
                <div key={event.id} className="admin-item admin-item-event">
                  <div>
                    <strong>{event.title}</strong>
                    <div className="meta">{event.description || 'Aucune description'}</div>
                    <div className="meta">
                      {event.parish?.name ?? 'Paroisse'} · {new Date(event.startsAt).toLocaleString('fr')}
                    </div>
                  </div>
                  <div className="admin-actions">
                    <button type="button" onClick={() => openEditEventModal(event)}>Modifier</button>
                    <button type="button" onClick={() => setPendingDelete({ type: 'event', id: event.id })}>Supprimer</button>
                  </div>
                </div>
              ))}
              {!filteredEvents.length && <p className="meta empty-state">Aucun événement ne correspond aux filtres.</p>}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
