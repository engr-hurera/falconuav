# Falcon Drones — Website

A clean, application-led UAV website built with Node.js, Express and EJS.

## Run locally

```bash
npm install
npm start
```

Open `http://localhost:3000`.

## Railway / GitHub

The app is Railway-friendly:

- `npm start` launches `server.js`.
- The server reads Railway's `PORT` variable and binds to `0.0.0.0`.
- No Dockerfile or paid service is required for the website itself.
- Static assets live in `public/` and EJS pages live in `views/`.

If Railway does not auto-detect the command, set the Start Command to `npm start`.

## Admin inquiries

Set these Railway Variables:

- `ADMIN_USER`
- `ADMIN_PASSWORD`

Then open `/admin/inquiries`. The page uses HTTP Basic Authentication and is not available when those variables are missing.

## Important data note

Quote/order requests currently use JSON files in `data/`. This is deliberately simple and works for local development, but a hosted filesystem should not be treated as permanent database storage. For production inquiries, connect the API to a managed database such as PostgreSQL or MongoDB.

## Images

All current drone images are kept in `public/images/`. Replace them with your final product photography whenever available; the layout will preserve the image proportions instead of forcing awkward crops on product pages.
