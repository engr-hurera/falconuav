const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';
const DATA = path.join(__dirname, 'data');

app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(express.urlencoded({ extended: true, limit: '20kb' }));
app.use(express.json({ limit: '20kb' }));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '7d' }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { ok: false, message: 'Too many requests. Please try again in a few minutes.' }
});

const drones = [
  { slug:'falcon-sc-10', name:'FALCON SC-10', category:'Solar Cleaning Drone', image:'/images/solar-sc10.jpg', short:'Heavy-duty cleaning platform for large solar installations.', description:'A heavy-duty solar cleaning platform designed around a high-capacity cleaning attachment, route planning and reliable outdoor operation.', specs:{'Cleaning Class':'Heavy Duty','Flight Time':'25–30 min*','Cleaning Width':'1200 mm','Water Tank':'10 L optional','Brush System':'Dual rotating rollers','Navigation':'RTK GPS capable','Protection':'IP67 target*'}, price:'Request a Quote' },
  { slug:'falcon-sc-8', name:'FALCON SC-8', category:'Solar Cleaning Drone', image:'/images/solar-sc8.jpg', short:'Medium-duty cleaning platform balancing power and agility.', description:'A medium-duty solar cleaning platform for commercial installations, designed for efficient coverage and controlled cleaning operations.', specs:{'Cleaning Class':'Medium Duty','Flight Time':'22–25 min*','Cleaning Width':'1000 mm','Water Tank':'8 L optional','Brush System':'Single roller','Navigation':'Autonomous-ready','Use':'Commercial solar'}, price:'Request a Quote' },
  { slug:'falcon-sc-6', name:'FALCON SC-6', category:'Solar Cleaning Drone', image:'/images/solar-sc6.jpg', short:'Compact platform for medium-size and rooftop installations.', description:'A compact solar cleaning platform intended for medium-sized installations and rooftop systems where maneuverability and efficient coverage are important.', specs:{'Cleaning Class':'Compact','Flight Time':'20–22 min*','Cleaning Width':'800 mm','Water Tank':'6 L optional','Brush System':'Front & rear rollers','Use':'Rooftop / commercial','Navigation':'Autonomous-ready'}, price:'Request a Quote' },
  { slug:'falcon-mini-sc-4', name:'FALCON MINI SC-4', category:'Solar Cleaning Drone', image:'/images/solar-mini-sc4.jpg', short:'Lightweight solution for smaller and rooftop solar systems.', description:'A smaller-format cleaning platform for residential, rooftop and compact solar installations where portability and maneuverability matter.', specs:{'Cleaning Class':'Lightweight','Flight Time':'18–20 min*','Cleaning Width':'600 mm','Water Tank':'4 L optional','Brush System':'Compact roller system','Use':'Rooftop / residential','Navigation':'Autonomous-ready'}, price:'Request a Quote' },
  { slug:'falcon-ag-10', name:'FALCON AG-10', category:'Agriculture Drone', image:'/images/ag-ag10.jpg', short:'Precision spraying platform for efficient crop operations.', description:'An agricultural UAV platform concept for precision spraying and crop operations, with configuration options tailored to farm requirements.', specs:{'Tank Capacity':'10 L concept','Application':'Precision spraying','Navigation':'GPS / RTK capable','Use':'Crop operations','Configuration':'Mission dependent','Payload':'Application dependent'}, price:'Request a Quote' },
  { slug:'falcon-ag-6', name:'FALCON AG-6', category:'Agriculture Drone', image:'/images/ag-ag6.jpg', short:'Compact agricultural platform for targeted field work.', description:'A compact agricultural platform concept for targeted spraying and smart-farming workflows where a smaller airframe is preferred.', specs:{'Platform':'Compact agriculture UAV','Application':'Precision spraying','Navigation':'GPS / RTK capable','Use':'Targeted field work','Configuration':'Mission dependent','Payload':'Application dependent'}, price:'Request a Quote' }
];

function ensureDataFiles() {
  fs.mkdirSync(DATA, { recursive: true });
  for (const file of ['quotes.json','orders.json']) {
    const target = path.join(DATA, file);
    if (!fs.existsSync(target)) fs.writeFileSync(target, '[]');
  }
}
function readJSON(file) {
  try { return JSON.parse(fs.readFileSync(path.join(DATA, file), 'utf8')); }
  catch { return []; }
}
function writeJSON(file, data) { fs.writeFileSync(path.join(DATA, file), JSON.stringify(data, null, 2)); }
function clean(value, max = 1000) { return String(value || '').trim().slice(0, max); }
function validEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function requireAdmin(req, res, next) {
  const user = process.env.ADMIN_USER;
  const password = process.env.ADMIN_PASSWORD;
  if (!user || !password) return res.status(404).render('404', { title:'Page Not Found | Falcon' });
  const header = req.headers.authorization || '';
  if (!header.startsWith('Basic ')) { res.set('WWW-Authenticate', 'Basic realm="Falcon Admin"'); return res.status(401).send('Authentication required.'); }
  let supplied;
  try { supplied = Buffer.from(header.slice(6), 'base64').toString('utf8'); } catch { supplied = ''; }
  const index = supplied.indexOf(':');
  const givenUser = index >= 0 ? supplied.slice(0, index) : '';
  const givenPassword = index >= 0 ? supplied.slice(index + 1) : '';
  const safeEqual = (a,b) => { const aa=Buffer.from(a); const bb=Buffer.from(b); return aa.length===bb.length && crypto.timingSafeEqual(aa,bb); };
  if (!safeEqual(givenUser,user) || !safeEqual(givenPassword,password)) { res.set('WWW-Authenticate', 'Basic realm="Falcon Admin"'); return res.status(401).send('Invalid credentials.'); }
  next();
}

ensureDataFiles();
app.locals.drones = drones;

app.get('/', (req,res)=>res.render('home',{title:'Falcon Drones | UAV Engineering'}));
app.get('/drones',(req,res)=>res.render('drones',{title:'Our Drones | Falcon',drones}));
app.get('/drones/:slug',(req,res)=>{ const drone=drones.find(d=>d.slug===req.params.slug); if(!drone)return res.status(404).render('404',{title:'Drone Not Found | Falcon'}); res.render('drone',{title:`${drone.name} | Falcon`,drone}); });
app.get('/about',(req,res)=>res.render('about',{title:'About Falcon | Falcon'}));
app.get('/solutions',(req,res)=>res.render('solutions',{title:'Solutions | Falcon'}));
app.get('/gallery',(req,res)=>res.render('gallery',{title:'Gallery | Falcon',drones}));
app.get('/contact',(req,res)=>res.render('contact',{title:'Contact Falcon | Falcon',drones}));

app.post('/api/quote', apiLimiter, (req,res)=>{
  const name=clean(req.body.name,100), phone=clean(req.body.phone,40), email=clean(req.body.email,160), drone=clean(req.body.drone,100), message=clean(req.body.message,1500);
  if(!name || !phone || !email) return res.status(400).json({ok:false,message:'Name, phone and email are required.'});
  if(!validEmail(email)) return res.status(400).json({ok:false,message:'Please enter a valid email address.'});
  const quotes=readJSON('quotes.json');
  quotes.push({id:crypto.randomUUID(),date:new Date().toISOString(),name,phone,email,drone:drone||'General Inquiry',message});
  try { writeJSON('quotes.json',quotes); res.json({ok:true,message:'Thanks. Your request has been received. Falcon will contact you shortly.'}); }
  catch { res.status(500).json({ok:false,message:'We could not save your request. Please contact Falcon directly.'}); }
});

app.post('/api/order', apiLimiter, (req,res)=>{
  const name=clean(req.body.name,100), phone=clean(req.body.phone,40), email=clean(req.body.email,160), drone=clean(req.body.drone,100), quantity=Math.max(1,Math.min(99,Number.parseInt(req.body.quantity,10)||1)), address=clean(req.body.address,1000), notes=clean(req.body.notes,1500);
  if(!name || !phone || !email || !drone) return res.status(400).json({ok:false,message:'Please complete the required fields.'});
  if(!validEmail(email)) return res.status(400).json({ok:false,message:'Please enter a valid email address.'});
  const orders=readJSON('orders.json');
  orders.push({id:crypto.randomUUID(),date:new Date().toISOString(),name,phone,email,drone,quantity,address,notes});
  try { writeJSON('orders.json',orders); res.json({ok:true,message:'Your order request has been received. Our sales team will contact you to confirm the configuration.'}); }
  catch { res.status(500).json({ok:false,message:'We could not save your request. Please contact Falcon directly.'}); }
});

app.get('/admin/inquiries', requireAdmin, (req,res)=>res.render('admin',{title:'Falcon Inquiries',quotes:readJSON('quotes.json').reverse(),orders:readJSON('orders.json').reverse()}));
app.get('/robots.txt',(req,res)=>res.type('text').send('User-agent: *\nAllow: /\nDisallow: /admin/\n'));
app.use((req,res)=>res.status(404).render('404',{title:'Page Not Found | Falcon'}));

app.listen(PORT,HOST,()=>console.log(`Falcon website running on port ${PORT}`));
