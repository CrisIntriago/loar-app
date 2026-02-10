# Guía de Despliegue Manual en Netlify (Draft)

El proyecto ha sido construido exitosamente (`npm run build` ✅).
Para desplegar manualmente desde tu máquina, sigue estos pasos:

## 1. Login en Netlify CLI
Como la sesión de terminal es nueva, necesitas autenticarte una vez:
```bash
npx netlify login
```
Esto abrirá una ventana en tu navegador para autorizar el acceso.

## 2. Iniciar Despliegue (Draft)
Ejecuta el siguiente comando para subir los archivos de la carpeta `.next` y `public`:
```bash
npx netlify deploy
```

### Respuestas a las preguntas del CLI:
*   **What would you like to do?**: Selecciona `Create & configure a new site` (o `Link this directory to an existing site` si ya tienes uno).
*   **Team**: Selecciona tu equipo personal.
*   **Site name**: Déjalo en blanco para uno aleatorio o escribe uno (ej: `loar-app-v2`).
*   **Publish directory**: Escribe `.next` (o simplemente enter y verifica que detecta la carpeta de build, aunque para Next.js a veces requiere configuración adicional).
    *   *Nota*: Si Netlify detecta Next.js automáticamente, te pedirá instalar `@netlify/plugin-nextjs`. Dile que sí.

## 3. Configurar Variables de Entorno (Crucial)
Una vez creado el sitio, ve al panel de administración de Netlify (Site Settings > Environment Variables) y agrega las mismas claves que tienes en `.env.local`:

*   `NEXT_PUBLIC_SUPABASE_URL`
*   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
*   `SUPABASE_SERVICE_ROLE_KEY`

## 4. Resultado
El comando `npx netlify deploy` te dará una **Website Draft URL**.
Esa es la URL que puedes usar para probar tu aplicación en la nube.
