import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, assetUrl } from "../api";
import type { Post } from "../types";

export default function PostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
    if (slug) {
      api<Post>(`/api/posts/${slug}`).then(setPost);
    }
  }, [slug]);

  if (!post) {
    return <p>Chargement…</p>;
  }

  return (
    <article>
      <p className="kicker">
        {post.type} · {post.parish?.name ?? "Unité pastorale"}
      </p>
      <h1>{post.title}</h1>
      {post.coverImagePath && <img src={assetUrl(post.coverImagePath)} alt="" style={{ maxWidth: "100%", borderRadius: 16 }} />}
      <p style={{ whiteSpace: "pre-wrap" }}>{post.body}</p>
      {post.attachmentPath && (
        <p>
          <a className="button primary" href={assetUrl(post.attachmentPath)}>
            {post.attachmentName ?? "Document"}
          </a>
        </p>
      )}
    </article>
  );
}
