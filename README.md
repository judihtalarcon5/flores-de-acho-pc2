# Flores de Acho | PC2

Aplicación de demostración académica para el Mercado de Flores de Acho.

## Alcance implementado

- Catálogo de productos, búsqueda y filtro por categoría.
- Carrito y cálculo del total.
- Registro, inicio de sesión y cierre de sesión.
- Registro de pedidos, control básico de stock e historial por cliente.
- API Express con Helmet, CORS configurado y validaciones básicas.
- Pruebas API con Node test y flujo CI en GitHub Actions.

## Limitaciones reales

Los datos están en memoria y se pierden al reiniciar. No hay PostgreSQL, panel de comerciantes, pagos, delivery real ni pipeline automático de despliegue. La autenticación es una demostración y no debe usarse con datos reales ni publicarse para usuarios reales sin persistencia, controles adicionales y revisión de seguridad. El flujo CI incluye build, pruebas, auditoría de dependencias y escaneo de secretos; todavía no incluye SAST ni despliegue automático.

## Requisitos

Node.js 22 y npm.

## Ejecución local

Terminal 1:

```bash
cd api
npm install
npm test
npm start
```

Terminal 2:

```bash
cd web
npm install
npm run dev
```

Abrir http://localhost:5173. API en http://localhost:3000/api/health.

## Ramas GitHub

Crear repositorio vacío y, desde esta carpeta:

```bash
git init
git add .
git commit -m "feat: prototipo web y API Flores de Acho"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/flores-de-acho-pc2.git
git push -u origin main
git checkout -b test
git push -u origin test
```

Para evidenciar un Pull Request, realizar después una mejora auténtica en `test`, confirmar el commit y abrir el PR hacia `main` desde GitHub. No inventar PR ni capturas.

## Despliegue manual orientativo

- Frontend: Vercel, directorio raíz `web`, comando `npm run build`, salida `dist`, variable `VITE_API_URL` con la URL real de la API.
- Backend: Render u otro proveedor compatible, directorio raíz `api`, comando `npm install`, inicio `npm start`, variable `FRONTEND_ORIGIN` con el dominio del frontend.
- Verificar disponibilidad y límites actuales del plan gratuito antes de publicar.

## Evidencias

Guardar capturas reales del backlog y épicas de Jira, cuatro sprints y Kanban, ejecuciones CI, ramas y PR, pruebas y URL pública. Completar los enlaces en el informe antes de la entrega.
