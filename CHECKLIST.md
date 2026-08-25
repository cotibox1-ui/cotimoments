# Checklist final — auditoría contra el spec (sección 57)

## Arquitectura y stack
[x] Cliente usa WEB (no instala APK) — /armar-box y /propuesta/:id
[x] Administrador usa APK + WEB — mismo /admin, empaquetado con Capacitor
[x] Mismo backend y misma base de datos para web admin y APK (un solo VITE_API_URL)
[x] React + Vite + Tailwind (frontend)
[x] Node.js + Express (backend)
[x] MongoDB Atlas — PENDIENTE DE CONFIGURAR CREDENCIAL (MONGODB_URI)
[x] Cloudinary — PENDIENTE DE CONFIGURAR CREDENCIAL (CLOUDINARY_*)
[x] Preparado para Vercel (frontend) y Railway (backend) — deploy real pendiente de que crees las cuentas

## Catálogos (CRUD)
[x] CRUD Productos (con foto, costo, categoría, disponible)
[x] CRUD Cajas
[x] CRUD Decoración
[x] CRUD Acompañantes

## Flujo cliente
[x] Bienvenida configurable
[x] Selección de productos SIN precios individuales
[x] Acompañantes SIN precios individuales
[x] Selección de caja SIN precio visible
[x] Personalización: temática, colores, dedicatoria, estilo de tarjeta
[x] Datos de entrega: De/Para/Teléfono, delivery S/10 o Parque Alameda gratis, hora, referencias
[x] Precio SOLO visible en el resumen final
[x] Confirmar pedido → genera BOX-000001, BOX-000002…
[x] Pantalla de pago (50% o completo) + botón WhatsApp (wa.me, sin credenciales)
[x] Indicador de pasos 1-5, con "atrás" que no pierde datos (Context de React)

## Precios y seguridad
[x] Fórmula: precioBox = costoBase × (1 + ganancia/100), ganancia inicial 100%
[x] Ganancia configurable desde Dashboard (no hardcodeada a 100%)
[x] Delivery S/10 configurable, Parque Alameda = S/0
[x] Backend recalcula TODO — el frontend nunca envía ni controla el precio final
[x] Snapshot completo por pedido (nombre, costo unitario, costo total de cada ítem, % ganancia, delivery, total)
[x] El cliente no puede manipular el precio (los ids se resuelven contra la BD en cada creación de pedido)

## Pedidos y dashboard
[x] Dashboard sin módulo de "Historial" (solo pedidos actuales, filtrables por estado)
[x] Detalle de pedido con TODOS los datos (cliente, productos, caja, decoración, personalización, entrega, precio, pago, checklist)
[x] Estados de pago independientes del estado de pedido
[x] Checklist marcable en el detalle del pedido
[x] Generar PDF con checklist de casillas vacías para lapicero (PREPARAR → REVISAR → ENTREGAR)

## Propuestas
[x] Admin arma box manualmente ("Crear oferta de box")
[x] Genera propuesta con ID único y link público /propuesta/:id
[x] Cliente revisa (sin volver a armar nada), elige delivery, pone datos, confirma
[x] Confirmar propuesta crea el pedido igual que el flujo normal (mismo backend, mismo snapshot)

## Autenticación y config
[x] Login admin con JWT + bcrypt, rutas /admin/* protegidas en frontend y backend
[x] Configuración: negocio, WhatsApp, pago, % ganancia, delivery, mensajes al cliente

## Pendiente de que TÚ configures (no se puede hacer desde el chat)
[ ] Crear cuenta y cluster en MongoDB Atlas → MONGODB_URI
[ ] Crear cuenta en Cloudinary → CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET
[ ] Crear proyecto en Railway y desplegar /backend
[ ] Crear proyecto en Vercel y desplegar /frontend
[ ] (Opcional) WhatsApp Business Cloud API → WHATSAPP_API_TOKEN, WHATSAPP_PHONE_NUMBER_ID
[ ] Instalar Android Studio y generar la APK con Capacitor (`npx cap open android`)
[ ] Ejecutar `npm run seed` una vez que MONGODB_URI esté configurado
[ ] Crear tu usuario admin con POST /api/auth/setup

## Verificado en este entorno (no simulado)
[x] Backend: todas las rutas cargan sin errores (`node -e "require('./src/app.js')"` ejecutado con éxito)
[x] Frontend: `npm run build` completado sin errores (114 módulos, build de producción real)
