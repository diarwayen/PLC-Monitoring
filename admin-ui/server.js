import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// API Handler'ları
import machinesHandler from './pages/api/machines.js';
import parametersHandler from './pages/api/parameters.js';
// db.js'i import etmene gerek yok, handler'lar onu çağırıyor zaten.

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// --- API ---
app.all('/api/machines', async (req, res) => {
    try { await machinesHandler(req, res); } 
    catch (e) { console.error(e); res.status(500).json({error: e.message}); }
});

app.all('/api/parameters', async (req, res) => {
    try { await parametersHandler(req, res); } 
    catch (e) { console.error(e); res.status(500).json({error: e.message}); }
});

// --- Frontend (Vite Build) ---
app.use(express.static(path.join(__dirname, 'dist')));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Sunucu http://localhost:${PORT} adresinde çalışıyor`);
});