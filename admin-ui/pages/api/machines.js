import { openDb } from './db.js';

// İsimleri standartlaştır (Boşluk -> _, Türkçe -> İngilizce)
function normalizeName(name) {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/\s+/g, "_")       // Boşlukları alt tire yap
    .replace(/[^a-z0-9_]/g, ""); // Geçersiz karakterleri sil
}

export default async function handler(req, res) {
  const db = await openDb();

  if (req.method === 'GET') {
    const machines = await db.all('SELECT * FROM machines');
    const machinesWithParams = await Promise.all(machines.map(async (machine) => {
      const params = await db.all('SELECT * FROM parameters WHERE machine_id = ?', machine.id);
      return { ...machine, parameters: params };
    }));
    res.status(200).json(machinesWithParams);
  } 
  
  else if (req.method === 'POST') {
    const { name, type, endpoint, parameters } = req.body;
    const normalizedName = normalizeName(name);

    // 1. Makineyi Ekle
    const result = await db.run(
      'INSERT INTO machines (name, type, endpoint) VALUES (?, ?, ?)',
      [normalizedName, type, endpoint]
    );
    const machineId = result.lastID;

    // 2. Parametreleri Ekle
    if (parameters && parameters.length > 0) {
      const stmt = await db.prepare(
        'INSERT INTO parameters (machine_id, node_id, name, data_type, unit, threshold) VALUES (?, ?, ?, ?, ?, ?)'
      );
      
      for (const param of parameters) {
        await stmt.run(
          machineId, 
          param.node_id, 
          normalizeName(param.name), 
          param.data_type, 
          param.unit, 
          param.threshold // Null veya Sayı olarak gelir
        );
      }
      await stmt.finalize();
    }
    const newMachine = await db.get('SELECT * FROM machines WHERE id = ?', machineId);
    res.status(201).json(newMachine);
  } 
  
  else if (req.method === 'PUT') {
    const { id, name, type, endpoint, parameters } = req.body;
    const normalizedName = normalizeName(name);

    // 1. Makine Bilgilerini Güncelle
    await db.run(
      'UPDATE machines SET name = ?, type = ?, endpoint = ? WHERE id = ?',
      [normalizedName, type, endpoint, id]
    );

    // 2. Eski Parametreleri Sil (Temiz başlangıç için)
    await db.run('DELETE FROM parameters WHERE machine_id = ?', id);

    // 3. Yeni Parametreleri Ekle
    if (parameters && parameters.length > 0) {
      const stmt = await db.prepare(
        'INSERT INTO parameters (machine_id, node_id, name, data_type, unit, threshold) VALUES (?, ?, ?, ?, ?, ?)'
      );
      
      for (const param of parameters) {
        await stmt.run(
          id, 
          param.node_id, 
          normalizeName(param.name), 
          param.data_type, 
          param.unit, 
          param.threshold // Null veya Sayı
        );
      }
      await stmt.finalize();
    }
    res.status(200).json({ message: 'Güncellendi' });
  }
  
  else if (req.method === 'DELETE') {
    const { id } = req.query;
    await db.run('DELETE FROM machines WHERE id = ?', id);
    res.status(200).json({ message: 'Silindi' });
  }
}