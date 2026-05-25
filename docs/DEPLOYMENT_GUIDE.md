# PharmaSys Deployment Guide

## Production checklist

- [ ] Set `NODE_ENV=production` on backend
- [ ] Use strong `JWT_SECRET`
- [ ] Configure production MySQL with backups
- [ ] Set `CLIENT_URL` to production web URL
- [ ] Build web: `cd web && npm run build`
- [ ] Serve web static files (Nginx, Vercel, etc.)
- [ ] Deploy API (Railway, Render, VPS, etc.)
- [ ] Configure Cloudinary for uploads
- [ ] Enable HTTPS and CORS for production domains
- [ ] Publish mobile via Expo EAS

## Suggested stack

| Layer | Options |
|-------|---------|
| API | Railway, Render, DigitalOcean |
| Web | Vercel, Netlify, Nginx |
| DB | Managed MySQL (PlanetScale, RDS) |
| Files | Cloudinary |
| Mobile | Expo EAS Build |

## CI and deployment automation

- GitHub Actions workflows have been added to validate backend and web builds on push and pull request.
- The `web` project can deploy to GitHub Pages automatically from `web/dist` using the `deploy-web.yml` workflow.
- Backend deployment is scaffolded for Render via `deploy-backend.yml`; set `RENDER_API_KEY` and `RENDER_SERVICE_ID` in repo secrets to enable it.

## Environment validation

- Backend now validates `.env` values using Zod and fails fast on invalid or missing production settings.
- Example environment files are available at `backend/.env.example` and `web/.env.example`.

Detailed deployment steps will be added after Step 2 (backend) is complete.
