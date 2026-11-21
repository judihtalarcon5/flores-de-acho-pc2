import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import crypto from 'node:crypto';

export const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN?.split(',') || 'http://localhost:5173' }));
app.use(express.json({ limit: '30kb' }));

// Demostración: los datos se reinician al reiniciar el servidor.
const products = [
  { id: 1, name: 'Ramo de rosas', category: 'Ramos', price: 35, stock: 20, description: 'Rosas frescas de temporada' },
  { id: 2, name: 'Girasoles', category: 'Flores', price: 18, stock: 30, description: 'Girasoles por unidad' },
  { id: 3, name: 'Arreglo floral', category: 'Arreglos', price: 65, stock: 12, description: 'Arreglo para ocasiones especiales' },
  { id: 4, name: 'Tulipanes', category: 'Flores', price: 28, stock: 18, description: 'Tulipanes de colores' }
];
const users = new Map();
const sessions = new Map();
const orders = [];
const hash = (password, salt) => crypto.scryptSync(password, salt, 64).toString('hex');
const publicUser = u => ({ id: u.id, name: u.name, email: u.email, role: u.role });
const auth = (req, res, next) => {
  const token = (req.headers.authorization || '').replace(/^Bearer /, '');
  const user = users.get(sessions.get(token));
  if (!user) return res.status(401).json({ error: 'Inicia sesión' });
  req.user = user; next();
};
app.get('/api/health', (_, res) => res.json({ status: 'ok', mode: 'demo-memory' }));
app.get('/api/products', (req, res) => {
  const search = String(req.query.search || '').toLowerCase();
  const category = String(req.query.category || '');
  res.json(products.filter(p => p.name.toLowerCase().includes(search) && (!category || p.category === category)));
});
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body || {};
  if (typeof name !== 'string' || name.trim().length < 2 || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || typeof password !== 'string' || password.length < 8) return res.status(400).json({ error: 'Datos inválidos. Contraseña mínima: 8 caracteres' });
  const key = email.trim().toLowerCase();
  if (users.has(key)) return res.status(409).json({ error: 'Correo ya registrado' });
  const salt = crypto.randomBytes(16).toString('hex');
  const user = { id: key, name: name.trim(), email: key, salt, passwordHash: hash(password, salt), role: 'customer' };
  users.set(key, user);
  res.status(201).json(publicUser(user));
});
app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = users.get(String(email || '').toLowerCase());
  if (!user || typeof password !== 'string' || !crypto.timingSafeEqual(Buffer.from(user.passwordHash, 'hex'), Buffer.from(hash(password, user.salt), 'hex'))) return res.status(401).json({ error: 'Credenciales incorrectas' });
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, user.id);
  res.json({ token, user: publicUser(user) });
});
app.get('/api/me', auth, (req, res) => res.json(publicUser(req.user)));
app.post('/api/orders', auth, (req, res) => {
  const { items, address } = req.body || {};
  if (!Array.isArray(items) || !items.length || items.length > 30 || typeof address !== 'string' || address.trim().length < 8 || address.length > 250) return res.status(400).json({ error: 'Pedido inválido' });
  const lines = [];
  for (const item of items) {
    const p = products.find(p => p.id === item.id);
    if (!p || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > p.stock) return res.status(400).json({ error: 'Producto o cantidad inválida' });
    lines.push({ id: p.id, name: p.name, quantity: item.quantity, price: p.price });
  }
  const quantities = new Map();
  for (const line of lines) quantities.set(line.id, (quantities.get(line.id) || 0) + line.quantity);
  for (const [id, qty] of quantities) if (qty > products.find(p => p.id === id).stock) return res.status(400).json({ error: 'Stock insuficiente' });
  for (const [id, qty] of quantities) products.find(p => p.id === id).stock -= qty;
  const order = { id: crypto.randomUUID(), userId: req.user.id, items: lines, total: lines.reduce((sum, l) => sum + l.price * l.quantity, 0), address: address.trim(), status: 'Recibido', createdAt: new Date().toISOString() };
  orders.push(order);
  res.status(201).json(order);
});
app.get('/api/orders', auth, (req, res) => res.json(orders.filter(o => o.userId === req.user.id)));
app.use((_, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
