require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const server = createServer(app);

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const PORT = process.env.PORT || 4000;
const DATA_DIR = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Simple file-based storage
const db = {
  users: [],
  bookings: [],
  enquiries: [],
  reports: [],
  announcements: []
};

// Load data from files
function loadData() {
  const files = ['users', 'bookings', 'enquiries', 'reports', 'announcements'];
  files.forEach(file => {
    const filePath = path.join(DATA_DIR, `${file}.json`);
    if (fs.existsSync(filePath)) {
      try {
        db[file] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      } catch (e) {
        console.error(`Error loading ${file}:`, e.message);
      }
    }
  });
}

// Save data to files
function saveData(type) {
  const filePath = path.join(DATA_DIR, `${type}.json`);
  fs.writeFileSync(filePath, JSON.stringify(db[type], null, 2));
}

loadData();

// Seed initial data
if (db.users.length === 0) {
  db.users = [
    { id: 'admin@unibell', userId: 'admin@unibell', passwordHash: 'Admin@123', userType: 'admin', phone: '', theme: 'dark', createdAt: new Date() },
    { id: 'student1', userId: 'student1', passwordHash: 'student123', userType: 'student', phone: '', theme: 'dark', createdAt: new Date() }
  ];
  saveData('users');
  console.log('✓ Seeded admin and student accounts');
}

// Helpers
const uid = (p='id') => `${p}_${Math.random().toString(36).slice(2,10)}`;

function authMiddleware(req, res, next) {
  const h = req.headers.authorization;
  if (!h) return res.status(401).json({ error: 'Missing token' });
  const token = h.split(' ')[1];
  // Simple token validation (in production use JWT)
  const user = db.users.find(u => u.id === token);
  if (!user) return res.status(401).json({ error: 'Invalid token' });
  req.user = { userId: user.userId, userType: user.userType };
  next();
}

// Auth
app.post('/api/register', (req, res) => {
  try {
    const { userId, password, userType = 'student', phone = '' } = req.body;
    if (!userId || !password || password.length < 6) return res.status(400).json({ error: 'Invalid input' });
    const exists = db.users.find(u => u.userId === userId);
    if (exists) return res.status(400).json({ error: 'User exists' });
    
    const user = { id: uid('user'), userId, passwordHash: password, userType, phone, theme: 'dark', createdAt: new Date() };
    db.users.push(user);
    saveData('users');
    
    res.json({ user: { userId: user.userId, userType: user.userType, phone: user.phone, theme: user.theme }, token: user.id });
  } catch (e) { console.error(e); res.status(500).json({ error: 'server error' }); }
});

app.post('/api/login', (req, res) => {
  try {
    const { userId, password } = req.body;
    const user = db.users.find(u => u.userId === userId && u.passwordHash === password);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ user: { userId: user.userId, userType: user.userType, phone: user.phone, theme: user.theme }, token: user.id });
  } catch (e) { console.error(e); res.status(500).json({ error: 'server error' }); }
});

app.post('/api/profile', authMiddleware, (req, res) => {
  try {
    const { phone, theme } = req.body;
    const user = db.users.find(u => u.userId === req.user.userId);
    if (!user) return res.status(404).json({ error: 'not found' });
    if (phone !== undefined) user.phone = phone;
    if (theme !== undefined) user.theme = theme;
    saveData('users');
    res.json({ ok: true, user: { userId: user.userId, userType: user.userType, phone: user.phone, theme: user.theme } });
  } catch (e) { console.error(e); res.status(500).json({ error: 'server' }); }
});

app.get('/api/profile', authMiddleware, (req, res) => {
  try {
    const user = db.users.find(u => u.userId === req.user.userId);
    if (!user) return res.status(404).json({ error: 'not found' });
    res.json({ userId: user.userId, userType: user.userType, phone: user.phone, theme: user.theme });
  } catch (e) { console.error(e); res.status(500).json({ error: 'server' }); }
});

// Slots
app.get('/api/slots', (req, res) => {
  const laundrySlots = [];
  for (let h = 6; h < 24; h++) {
    for (let m = 0; m < 60; m += 50) {
      const start = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const endMin = m + 50;
      const endH = h + Math.floor(endMin / 60);
      const endM = endMin % 60;
      const end = `${String(endH % 24).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
      laundrySlots.push(`${start}-${end}`);
    }
  }
  res.json({
    gym: ["05:00-06:00", "06:00-07:00", "17:00-18:00", "18:00-19:00"],
    laundry: laundrySlots,
    machineCapacity: 10,
    gymCapacity: 10,
    loadsPerSession: 3,
    arrivalMinutesBefore: 10,
    loadDurationMinutes: 50
  });
});

// Gym booking
app.post('/api/book/gym', authMiddleware, (req, res) => {
  try {
    const { slot } = req.body;
    if (!slot) return res.status(400).json({ error: 'slot required' });

    const today = new Date().toDateString();
    const todayBooking = db.bookings.find(b => b.userId === req.user.userId && b.type === 'Gym' && new Date(b.createdAt).toDateString() === today && b.status !== 'Rejected');
    if (todayBooking) return res.status(409).json({ error: 'You already booked a gym slot today' });

    const cap = db.bookings.filter(b => b.type === 'Gym' && b.slot === slot && new Date(b.createdAt).toDateString() === today && b.status !== 'Rejected').length;
    if (cap >= 10) return res.status(409).json({ error: 'slot full' });

    const token = uid('gym');
    const booking = { id: uid('booking'), userId: req.user.userId, type: 'Gym', slot, status: 'Pending', token, createdAt: new Date() };
    db.bookings.push(booking);
    saveData('bookings');

    res.json({ ok: true, status: 'Pending', token });
  } catch (e) { console.error(e); res.status(500).json({ error: 'server' }); }
});

// Admin confirm/reject gym
app.post('/api/admin/gym/:id/:action', authMiddleware, (req, res) => {
  try {
    if (req.user.userType !== 'admin') return res.status(403).json({ error: 'forbidden' });
    const id = req.params.id, action = req.params.action;
    const booking = db.bookings.find(b => b.id === id);
    if (!booking) return res.status(404).json({ error: 'not found' });
    if (booking.type !== 'Gym') return res.status(400).json({ error: 'not gym booking' });

    if (action === 'confirm') {
      booking.status = 'Confirmed';
      saveData('bookings');
      res.json({ ok: true });
    } else if (action === 'reject') {
      booking.status = 'Rejected';
      saveData('bookings');
      res.json({ ok: true });
    } else {
      res.status(400).json({ error: 'invalid action' });
    }
  } catch (e) { console.error(e); res.status(500).json({ error: 'server' }); }
});

// Laundry booking
app.post('/api/book/laundry', authMiddleware, (req, res) => {
  try {
    const { slot, numLoads = 1 } = req.body;
    if (!slot) return res.status(400).json({ error: 'slot required' });
    if (numLoads < 1 || numLoads > 3) return res.status(400).json({ error: 'numLoads must be 1-3' });

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const weekBooking = db.bookings.find(b => b.userId === req.user.userId && b.type === 'Laundry' && new Date(b.createdAt) >= weekStart && new Date(b.createdAt) <= weekEnd && b.status !== 'Rejected');
    if (weekBooking) return res.status(409).json({ error: 'You already booked laundry this week. Try again next week.' });

    const today = new Date().toDateString();
    const cap = db.bookings.filter(b => b.type === 'Laundry' && b.slot === slot && new Date(b.createdAt).toDateString() === today && b.status !== 'Rejected').length;
    if (cap >= 10) return res.status(409).json({ error: 'slot full' });

    const token = uid('laundry');
    const startHHMM = slot.split('-')[0];
    const [hh, mm] = startHHMM.split(':').map(v => parseInt(v, 10));
    const arrive = new Date();
    arrive.setHours(hh, mm, 0, 0);
    arrive.setMinutes(arrive.getMinutes() - 10);
    const arrivalAt = arrive.toTimeString().slice(0, 5);

    const totalMinutes = numLoads * 50;
    const endMin = mm + totalMinutes;
    const endH = hh + Math.floor(endMin / 60);
    const endM = endMin % 60;
    const endTime = `${String(endH % 24).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

    const booking = { id: uid('booking'), userId: req.user.userId, type: 'Laundry', slot, numLoads, status: 'Confirmed', token, meta: { arrivalAt, endTime, totalMinutes }, createdAt: new Date() };
    db.bookings.push(booking);
    saveData('bookings');

    res.json({ ok: true, token, arrivalAt, endTime, numLoads });
  } catch (e) { console.error(e); res.status(500).json({ error: 'server' }); }
});

// Bookings list
app.get('/api/bookings', authMiddleware, (req, res) => {
  try {
    if (req.user.userType === 'admin') {
      res.json(db.bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } else {
      res.json(db.bookings.filter(b => b.userId === req.user.userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    }
  } catch (e) { console.error(e); res.status(500).json({ error: 'server' }); }
});

// QR
app.get('/api/qr', (req, res) => {
  try {
    const token = req.query.token;
    if (!token) return res.status(400).json({ error: 'token required' });
    const payload = `UNIBELL|${token}`;
    // Simple QR code placeholder
    res.json({ dataUrl: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='white' width='200' height='200'/%3E%3Ctext x='50' y='100' font-size='12'%3E${token}%3C/text%3E%3C/svg%3E` });
  } catch (e) { console.error(e); res.status(500).json({ error: 'server' }); }
});

// Enquiries
app.post('/api/enquiry', authMiddleware, (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'text required' });
    const enquiry = { id: uid('enquiry'), userId: req.user.userId, text, feedback: null, feedbackAt: null, repliedBy: null, createdAt: new Date() };
    db.enquiries.push(enquiry);
    saveData('enquiries');
    res.json({ ok: true, id: enquiry.id });
  } catch (e) { console.error(e); res.status(500).json({ error: 'server' }); }
});

app.get('/api/enquiries/user', authMiddleware, (req, res) => {
  try {
    const list = db.enquiries.filter(e => e.userId === req.user.userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(list);
  } catch (e) { console.error(e); res.status(500).json({ error: 'server' }); }
});

app.get('/api/admin/enquiries', authMiddleware, (req, res) => {
  if (req.user.userType !== 'admin') return res.status(403).json({ error: 'forbidden' });
  const list = db.enquiries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(list);
});

app.post('/api/admin/enquiry/:id/reply', authMiddleware, (req, res) => {
  if (req.user.userType !== 'admin') return res.status(403).json({ error: 'forbidden' });
  const { feedback } = req.body;
  if (!feedback) return res.status(400).json({ error: 'feedback required' });
  const enquiry = db.enquiries.find(e => e.id === req.params.id);
  if (!enquiry) return res.status(404).json({ error: 'not found' });
  enquiry.feedback = feedback;
  enquiry.feedbackAt = new Date();
  enquiry.repliedBy = req.user.userId;
  saveData('enquiries');
  res.json({ ok: true });
});

// Reports
app.post('/api/report', authMiddleware, (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'text required' });
    const report = { id: uid('report'), userId: req.user.userId, text, feedback: null, feedbackAt: null, repliedBy: null, createdAt: new Date() };
    db.reports.push(report);
    saveData('reports');
    res.json({ ok: true, id: report.id });
  } catch (e) { console.error(e); res.status(500).json({ error: 'server' }); }
});

app.get('/api/reports/user', authMiddleware, (req, res) => {
  try {
    const list = db.reports.filter(r => r.userId === req.user.userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(list);
  } catch (e) { console.error(e); res.status(500).json({ error: 'server' }); }
});

app.get('/api/admin/reports', authMiddleware, (req, res) => {
  if (req.user.userType !== 'admin') return res.status(403).json({ error: 'forbidden' });
  const list = db.reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(list);
});

app.post('/api/admin/report/:id/reply', authMiddleware, (req, res) => {
  if (req.user.userType !== 'admin') return res.status(403).json({ error: 'forbidden' });
  const { feedback } = req.body;
  if (!feedback) return res.status(400).json({ error: 'feedback required' });
  const report = db.reports.find(r => r.id === req.params.id);
  if (!report) return res.status(404).json({ error: 'not found' });
  report.feedback = feedback;
  report.feedbackAt = new Date();
  report.repliedBy = req.user.userId;
  saveData('reports');
  res.json({ ok: true });
});

// Announcements
app.post('/api/admin/announcement', authMiddleware, (req, res) => {
  if (req.user.userType !== 'admin') return res.status(403).json({ error: 'forbidden' });
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'text required' });
  const announcement = { id: uid('announcement'), text, createdAt: new Date() };
  db.announcements.push(announcement);
  saveData('announcements');
  res.json({ ok: true });
});

app.get('/api/announcements', (req, res) => {
  const list = db.announcements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 50);
  res.json(list);
});

// CSV export
app.get('/api/admin/bookings/export', authMiddleware, (req, res) => {
  if (req.user.userType !== 'admin') return res.status(403).json({ error: 'forbidden' });
  const rows = db.bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  let csv = 'type,id,user,slot,status,numLoads,token,meta,createdAt\n';
  rows.forEach(r => {
    csv += `${r.type},${r.id},${r.userId},${r.slot},${r.status},${r.numLoads || 1},${r.token},"${JSON.stringify(r.meta || {}).replace(/"/g, '""')}",${r.createdAt}\n`;
  });
  res.header('Content-Type', 'text/csv');
  res.attachment('bookings.csv');
  res.send(csv);
});

// Verify endpoint
app.get('/verify/:token', (req, res) => {
  try {
    const token = req.params.token;
    const booking = db.bookings.find(b => b.token === token);
    if (!booking) return res.status(404).send(`<pre>Token not found</pre>`);
    res.send(`<pre>Booking token: ${booking.token}\nType: ${booking.type}\nUser: ${booking.userId}\nSlot: ${booking.slot}\nStatus: ${booking.status}\nCreated: ${booking.createdAt}</pre>`);
  } catch (e) { console.error(e); res.status(500).send('server error'); }
});

// Start
server.listen(PORT, () => {
  console.log(`\n✓ Unibell server running on http://localhost:${PORT}`);
  console.log(`✓ Demo: admin@unibell / Admin@123 or student1 / student123\n`);
});
