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

## Publicar una demo gratis

La web se puede alojar en Vercel y la API en Render. No hace falta comprar un dominio: ambas plataformas proporcionan una URL pública.

### API en Render

1. Abre el [Dashboard de Render](https://dashboard.render.com/) y crea un **Web Service** conectado al repositorio `jdarjona/unidad-pastoral`.
2. Selecciona **Docker** como entorno y el plan **Free**. El `Dockerfile` está en la raíz del repositorio.
3. Antes de desplegar, añade estas variables en **Environment**:

| Variable | Valor |
| --- | --- |
| `Jwt__Key` | Secreto aleatorio de al menos 32 caracteres |
| `Admin__Username` | El nombre de usuario del administrador |
| `Admin__InitialPassword` | Una contraseña inicial única y segura |
| `Cors__AllowedOrigins` | La URL de Vercel, por ejemplo `https://unidad-pastoral.vercel.app` |
| `Demo__RestoreOnStartup` | `true` para restaurar los datos y archivos demo al arrancar |

4. Despliega y copia la URL que Render asigne a la API, por ejemplo `https://unidad-pastoral-api.onrender.com`.

### Web en Vercel

1. Abre [Vercel](https://vercel.com/new) e importa el mismo repositorio.
2. Configura **Root Directory** como `src/web`. El comando de compilación es `npm run build` y la carpeta de salida es `dist`.
3. Añade esta variable de entorno:

| Variable | Valor |
| --- | --- |
| `VITE_API_URL` | URL de la API en Render, sin barra final |

4. Despliega. Si Vercel asigna una URL distinta de la que pusiste en `Cors__AllowedOrigins`, actualiza esa variable en Render y reinicia la API.

### Límites de la demo gratuita

- Render puede suspender la API tras 15 minutos sin visitas; la primera petición posterior puede tardar alrededor de un minuto.
- Con `Demo__RestoreOnStartup=true`, cada arranque restaura `src/UnidadPastoral.Api/demo-data/unidad-pastoral.db` y sus uploads. El snapshot incluye el contenido local empaquetado, pero no usuarios ni hashes de contraseña: el administrador se crea con `Admin__Username` y `Admin__InitialPassword`.
- Las modificaciones hechas desde el panel de la demo no actualizan el snapshot; al reiniciar volverá el contenido empaquetado. Para cambiar la base de partida, actualiza los archivos de `demo-data`, haz commit y vuelve a desplegar.
- El plan Hobby de Vercel está destinado a proyectos personales y no comerciales. Revisa sus condiciones para un sitio institucional; también puedes alojar la web estática en Render.

## GitHub

El repositorio ya tiene configurado el remoto `origin`. Para enviar futuros cambios a la rama `master`:

```powershell
cd C:\Users\jdarj\source\repos\unidad-pastoral
git add .
git commit -m "Descripción del cambio"
git push origin master
```
