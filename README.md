# Sistema de Boxes Personalizados

## Estructura
```
/backend   -> API Node.js + Express + MongoDB (Railway)
/frontend  -> React + Vite + Tailwind (Vercel) + APK admin (Capacitor)
```

## 1. Configurar MongoDB Atlas (obligatorio)
1. Crea cuenta gratuita en https://www.mongodb.com/cloud/atlas
2. Crea un cluster (el free tier "M0" alcanza para empezar).
3. En "Database Access" crea un usuario con contraseña.
4. En "Network Access" agrega `0.0.0.0/0` (o la IP de Railway) para permitir conexiones.
5. En "Connect" → "Drivers" copia el connection string y pégalo en `backend/.env` como `MONGODB_URI`.

## 2. Configurar Cloudinary (obligatorio para imágenes)
1. Crea cuenta gratuita en https://cloudinary.com
2. En el Dashboard copia `Cloud Name`, `API Key` y `API Secret`.
3. Pégalos en `backend/.env` (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`).

## 3. Backend local
```bash
cd backend
cp .env.example .env   # completa MONGODB_URI, JWT_SECRET, Cloudinary
npm install
npm run dev
```
Genera un JWT_SECRET con: `openssl rand -hex 32`

Crea tu primer usuario admin (solo funciona una vez, mientras no exista ningún admin):
```bash
curl -X POST http://localhost:4000/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{"name":"Tu Nombre","email":"tu@correo.com","password":"unaContraseñaSegura"}'
```

Carga los datos iniciales del spec (cajas, productos, acompañantes, config con ganancia 100% y delivery S/10):
```bash
npm run seed   # o: node src/seed.js
```

## 4. Frontend local
```bash
cd frontend
cp .env.example .env   # VITE_API_URL=http://localhost:4000/api
npm install
npm run dev
```
Abre `http://localhost:5173/armar-box` (cliente) y `http://localhost:5173/admin/login` (admin).

## 5. Deploy backend en Railway
1. Sube `/backend` a un repo de GitHub.
2. En https://railway.app crea un proyecto → "Deploy from GitHub repo".
3. En "Variables" pega el mismo contenido que tu `.env` local (MONGODB_URI, JWT_SECRET, CLOUDINARY_*, FRONTEND_URL, BUSINESS_WHATSAPP_NUMBER).
4. Railway detecta `npm start` automáticamente. Copia la URL pública que te da (ej. `https://tu-app.up.railway.app`).

## 6. Deploy frontend en Vercel
1. Sube `/frontend` a un repo de GitHub (puede ser el mismo monorepo, indicando "Root Directory: frontend").
2. En https://vercel.com importa el repo.
3. En "Environment Variables" agrega `VITE_API_URL=https://tu-app.up.railway.app/api`.
4. Deploy. Copia el dominio final (ej. `https://tu-negocio.vercel.app`) y actualízalo como `FRONTEND_URL` en Railway.

## 7. WhatsApp
- El botón "Enviar comprobante por WhatsApp" del cliente **ya funciona sin credenciales**: solo necesitas poner tu número en Configuración → WhatsApp (o `BUSINESS_WHATSAPP_NUMBER` en el backend).
- La notificación **automática** al admin cuando llega un pedido nuevo SÍ requiere WhatsApp Business Cloud API:
  - PENDIENTE DE CONFIGURAR CREDENCIAL: crea una app en https://developers.facebook.com/docs/whatsapp/cloud-api, obtén `WHATSAPP_API_TOKEN` y `WHATSAPP_PHONE_NUMBER_ID`, y agrégalos a las variables de Railway. Si no las configuras, el sistema sigue funcionando normal — el pedido simplemente no se notifica por WhatsApp automáticamente, pero SÍ aparece en el Dashboard.

## 8. Generar la APK administrativa (Capacitor)
Requiere Android Studio instalado en tu computadora (esto no se puede hacer desde este chat).

**Antes de compilar — login automático:** la APK entra directo al Dashboard, sin pantalla de login. Para eso, agrega en `frontend/.env` (nunca se sube a GitHub):
```
VITE_ADMIN_EMAIL=admin@momentos.com
VITE_ADMIN_PASSWORD=momentos123
```
Con esto vacío, la APK se comporta como la web (pide login normal). Ten en cuenta que cualquiera con el archivo `.apk` podría abrir el Dashboard sin contraseña — solo hazlo si el celular es de uso exclusivo tuyo.

```bash
cd frontend
npm install               # trae los plugins nuevos (Filesystem, Share) si es la primera vez que los usas
npm run build
npx cap add android      # solo la primera vez
npx cap sync android
npx cap open android     # abre Android Studio -> Build > Build APK
```
La APK apunta al mismo `VITE_API_URL` que configuraste en el build — o sea, al mismo backend y misma base de datos que la web.

**Ver/descargar PDF dentro de la APK:** un WebView de Android no puede usar el truco normal de "descargar" del navegador. Por eso, dentro de la APK, al tocar "Descargar PDF" se usa el plugin nativo Filesystem para guardar el archivo y se abre el selector de "compartir/abrir con" de Android — desde ahí puedes elegir un lector de PDF para verlo, o guardarlo en Archivos/Drive. Esto requiere los plugins `@capacitor/filesystem` y `@capacitor/share`, que ya están en `package.json` — solo asegúrate de correr `npm install` antes de `npx cap sync android`.

**Ícono de la app:** el logo ya está en `frontend/public/logo.png` y `frontend/src/assets/logo.png`. Para que ese logo sea también el ícono de la APK (no solo lo que se ve dentro de la app), genera los íconos de Android con:
```bash
npm install @capacitor/assets --save-dev
npx capacitor-assets generate --android
```
Esto lee `frontend/public/logo.png` y genera automáticamente todos los tamaños de ícono que Android necesita.

## 9. Notas de seguridad
- El precio JAMÁS se calcula ni se confía en el frontend: `backend/src/utils/pricingEngine.js` es la única fuente de verdad, y cada pedido guarda un snapshot inmutable de los costos usados.
- Las rutas `/admin/*` del backend requieren JWT válido (`middleware/auth.js`).
- Las claves de Cloudinary solo existen en el backend.
