const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA = path.join(__dirname, 'data');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const drones = [
  {
    slug: 'falcon-sc-10', name: 'FALCON SC-10', category: 'Solar Cleaning Drone',
    image: '/images/solar-sc10.jpg',
    short: 'Heavy-duty autonomous cleaning platform for large solar farms.',
    description: 'A heavy-duty solar cleaning platform designed around a high-capacity cleaning attachment, autonomous route planning and reliable outdoor operation.',
    specs: { 'Cleaning Class': 'Heavy Duty', 'Flight Time': '25–30 min*', 'Cleaning Width': '1200 mm', 'Water Tank': '10 L optional', 'Brush System': 'Dual rotating rollers', 'Navigation': 'RTK GPS capable', 'Protection': 'IP67 target*' },
    price: 'Request a Quote'
  },
  {
    slug: 'falcon-sc-8', name: 'FALCON SC-8', category: 'Solar Cleaning Drone',
    image: '/images/solar-sc8.jpg',
    short: 'Medium-duty cleaning platform balancing power and agility.',
    description: 'A medium-duty solar cleaning concept for commercial installations, designed for efficient coverage and controlled cleaning operations.',
    specs: { 'Cleaning Class': 'Medium Duty', 'Flight Time': '22–25 min*', 'Cleaning Width': '1000 mm', 'Water Tank': '8 L optional', 'Brush System': 'Single roller', 'Navigation': 'Autonomous-ready', 'Use': 'Commercial solar' },
    price: 'Request a Quote'
  },
  {
    slug: 'falcon-sc-6', name: 'FALCON SC-6', category: 'Solar Cleaning Drone',
    image: '/images/solar-sc6.jpg',
    short: 'Compact cleaning platform for medium-size installations.',
    description: 'A compact solar cleaning platform intended for medium-sized installations and rooftop systems where maneuverability and efficient coverage are important.',
    specs: { 'Cleaning Class': 'Compact', 'Flight Time': '20–22 min*', 'Cleaning Width': '800 mm', 'Water Tank': '6 L optional', 'Brush System': 'Front & rear rollers', 'Use': 'Rooftop / commercial', 'Navigation': 'Autonomous-ready' },
    price: 'Request a Quote'
  },
  {
    slug: 'falcon-mini-sc-4', name: 'FALCON MINI SC-4', category: 'Solar Cleaning Drone',
    image: '/images/solar-mini-sc4.jpg',
    short: 'Lightweight solution for smaller and rooftop solar systems.',
    description: 'A smaller-format cleaning platform for residential, rooftop and compact solar installations where portability and maneuverability matter.',
    specs: { 'Cleaning Class': 'Lightweight', 'Flight Time': '18–20 min*', 'Cleaning Width': '600 mm', 'Water Tank': '4 L optional', 'Brush System': 'Compact roller system', 'Use': 'Rooftop / residential', 'Navigation': 'Autonomous-ready' },
    price: 'Request a Quote'
  },
  {
    slug: 'falcon-ag-10', name: 'FALCON AG-10', category: 'Agriculture Drone',
    image: '/images/ag-ag10.jpg',
    short: 'Precision spraying platform for efficient crop operations.',
    description: 'An agricultural UAV platform concept for precision spraying and crop operations, with configuration options tailored to farm requirements.',
    specs: { 'Tank Capacity': '10 L concept', 'Application': 'Precision spraying', 'Navigation': 'GPS / RTK capable', 'Use': 'Crop operations', 'Configuration': 'Mission dependent', 'Payload': 'Application dependent' },
    price: 'Request a Quote'
  },
  {
    slug: 'falcon-ag-6', name: 'FALCON AG-6', category: 'Agriculture Drone',
    image: '/images/ag-ag6.jpg',
    short: 'Compact agricultural platform for targeted field work.',
    description: 'A more compact agricultural platform concept for targeted spraying and smart-farming workflows where a smaller airframe is preferred.',
    specs: { 'Platform': 'Compact agriculture UAV', 'Application': 'Precision spraying', 'Navigation': 'GPS / RTK capable', 'Use': 'Targeted field work', 'Configuration': 'Mission dependent', 'Payload': 'Application dependent' },
    price: 'Request a Quote'
  }
];

function readJSON(file) {
  try { return JSON.parse(fs.readFileSync(path.join(DATA, file), 'utf8')); }
  catch { return []; }
}
function writeJSON(file, data) {
  fs.writeFileSync(path.join(DATA, file), JSON.stringify(data, null, 2));
}

app.locals.drones = drones;

app.get('/', (req, res) => res.render('home', { title: 'Falcon | Advanced Drone Solutions' }));
app.get('/drones', (req, res) => res.render('drones', { title: 'Our Drones | Falcon', drones }));
app.get('/drones/:slug', (req, res) => {
  const drone = drones.find(d => d.slug === req.params.slug);
  if (!drone) return res.status(404).render('404', { title: 'Drone Not Found | Falcon' });
  res.render('drone', { title: `${drone.name} | Falcon`, drone });
});
app.get('/about', (req, res) => res.render('about', { title: 'About Falcon | Falcon' }));
app.get('/solutions', (req, res) => res.render('solutions', { title: 'Solutions | Falcon' }));
app.get('/gallery', (req, res) => res.render('gallery', { title: 'Gallery | Falcon', drones }));
app.get('/contact', (req, res) => res.render('contact', { title: 'Contact Falcon | Falcon', drones }));

app.post('/api/quote', (req, res) => {
  const { name, phone, email, drone, message } = req.body;
  if (!name || !phone || !email) return res.status(400).json({ ok: false, message: 'Name, phone and email are required.' });
  const quotes = readJSON('quotes.json');
  quotes.push({ id: Date.now(), date: new Date().toISOString(), name, phone, email, drone: drone || 'General Inquiry', message: message || '' });
  writeJSON('quotes.json', quotes);
  res.json({ ok: true, message: 'Your quotation request has been received. Falcon will contact you shortly.' });
});

app.post('/api/order', (req, res) => {
  const { name, phone, email, drone, quantity, address, notes } = req.body;
  if (!name || !phone || !email || !drone) return res.status(400).json({ ok: false, message: 'Please complete the required fields.' });
  const orders = readJSON('orders.json');
  orders.push({ id: Date.now(), date: new Date().toISOString(), name, phone, email, drone, quantity: quantity || 1, address: address || '', notes: notes || '' });
  writeJSON('orders.json', orders);
  res.json({ ok: true, message: 'Order request received. Our sales team will contact you to confirm configuration, availability and payment terms.' });
});

app.get('/admin/inquiries', (req, res) => res.render('admin', {
  title: 'Falcon Inquiries', quotes: readJSON('quotes.json').reverse(), orders: readJSON('orders.json').reverse()
}));

app.use((req, res) => res.status(404).render('404', { title: 'Page Not Found | Falcon' }));
app.listen(PORT, () => console.log(`Falcon website running on http://localhost:${PORT}`));
