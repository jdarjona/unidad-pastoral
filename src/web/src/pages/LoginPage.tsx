import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setToken } from "../api";

export default function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      const result = await api<{ token: string }>("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.get("username"),
          password: data.get("password")
        })
      });
      setToken(result.token);
      navigate("/admin");
    } catch {
      setError("Nom d’utilisateur ou mot de passe incorrect.");
    }
  }

  return (
    <form className="stack card" onSubmit={onSubmit} style={{ maxWidth: 420 }}>
      <h1>Connexion au panneau</h1>
      <p className="meta">Compte d’administration</p>
      <label>
        Nom d’utilisateur
        <input name="username" defaultValue="admin" />
      </label>
      <label>
        Mot de passe
        <input name="password" type="password" />
      </label>
      {error && <p className="error">{error}</p>}
      <button className="primary" type="submit">
        Se connecter
      </button>
    </form>
  );
}
