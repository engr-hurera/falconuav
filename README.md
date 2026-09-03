# Falcon Drones — Full-Stack Website

Professional Falcon drone website using Express + EJS.

## Included
- Falcon black/white/gold theme
- Six drone product pages
- Four solar-cleaning drone platforms
- Two agriculture drone platforms
- Individual drone imagery (no SVG drone placeholders)
- Get a Quote form backed by `/api/quote`
- Buy Now / Order Request form backed by `/api/order`
- Internal inquiry page at `/admin/inquiries`
- About, Solutions, Gallery and Contact pages
- Responsive layout
- JSON storage for quote and order requests

## Run
1. Install Node.js LTS.
2. Open a terminal in this folder.
3. Run `npm install`.
4. Run `npm start`.
5. Open `http://localhost:3000`.

Quote requests are stored in `data/quotes.json` and order requests in `data/orders.json`.

For production, connect the same API endpoints to MongoDB and add admin authentication before publishing the inquiry dashboard publicly.
