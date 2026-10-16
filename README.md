# Unidad Pastoral

Sitio web para una unidad pastoral de cinco parroquias: fotos, noticias, eventos, documentos y calendario por parroquia.

## Arquitectura

- **React + Vite** (`src/web`): web pública y panel `/admin`.
- **ASP.NET Core 9** (`src/UnidadPastoral.Api`): API REST, autenticación JWT y ficheros subidos.
- **SQLite**: base `unidad-pastoral.db` creada al arrancar la API.

Las parroquias de ejemplo se cargan en `src/UnidadPastoral.Api/Data/DbSeeder.cs`. Ese es el mejor sitio para el primer cambio: nombres reales, direcciones y horarios de misa.

## Cómo ejecutarlo

Hace falta [.NET 9 SDK](https://dotnet.microsoft.com/download) y [Node.js LTS](https://nodejs.org/).

Terminal 1 — API:

```powershell
cd src/UnidadPastoral.Api
dotnet run --launch-profile http
```

La API queda en `http://localhost:5214`.

Terminal 2 — web:

```powershell
cd src/web
npm install
npm run dev
```

Abre `http://localhost:5173`.

Panel de publicación: `/admin`  
Usuario inicial: `admin` / `CambiaEsto1`

Vite reenvía `/api` y `/uploads` a la API, así que las fotos y documentos se ven en el mismo origen.

## GitHub

Cuando tengas Git instalado:

```powershell
cd C:\Users\jdarj\source\repos\unidad-pastoral
git init
git add .
git commit -m "Sitio inicial de la unidad pastoral"
gh repo create unidad-pastoral --private --source . --remote origin --push
```
