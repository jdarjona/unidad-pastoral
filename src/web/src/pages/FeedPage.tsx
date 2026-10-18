import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, assetUrl } from "../api";
import type { Parish, Post, PostType } from "../types";

export default function FeedPage({ type, title }: { type: PostType; title: string }) {
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [parishId, setParishId] = useState<number | "all">("all");
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    api<Parish[]>("/api/parishes").then(setParishes);
  }, []);

  useEffect(() => {
    const query = parishId === "all" ? `/api/posts?type=${type}` : `/api/posts?type=${type}&parishId=${parishId}`;
    api<Post[]>(query).then(setPosts);
  }, [type, parishId]);

  return (
    <>
      <h1>{title}</h1>
      <div className="filters">
        <button className={parishId === "all" ? "active" : ""} onClick={() => setParishId("all")}>
          Toute l’unité
        </button>
        {parishes.map((parish) => (
          <button
            key={parish.id}
            className={parishId === parish.id ? "active" : ""}
            onClick={() => setParishId(parish.id)}
          >
            {parish.name}
          </button>
        ))}
      </div>
      <div className="grid">
        {posts.map((post) => (
          <article key={post.id} className="card">
            <span className="kicker">{post.parish?.name ?? "Unité"}</span>
            <h3>
              <Link to={`/aviso/${post.slug}`}>{post.title}</Link>
            </h3>
            <p className="meta">{new Date(post.publishedAt).toLocaleDateString("fr")}</p>
            {post.attachmentPath && (
              <a href={assetUrl(post.attachmentPath)} target="_blank" rel="noreferrer">
                Télécharger {post.attachmentName ?? "document"}
              </a>
            )}
          </article>
        ))}
      </div>
    </>
  );
}
