import { openDb } from './db';

export default async function handler(req, res) {
  const db = await openDb();

  if (req.method === 'GET') {
    const machines = await db.all('SELECT * FROM machines');
    res.status(200).json(machines);
  } 
  else if (req.method === 'POST') {
    const { name, type, endpoint } = req.body;
    const result = await db.run(
      'INSERT INTO machines (name, type, endpoint) VALUES (?, ?, ?)',
      [name, type, endpoint]
    );
    const newMachine = await db.get('SELECT * FROM machines WHERE id = ?', result.lastID);
    res.status(201).json(newMachine);
  } 
  else if (req.method === 'PUT') { // <--- YENİ EKLENDİ
    const { id, name, type, endpoint } = req.body;
    await db.run(
      'UPDATE machines SET name = ?, type = ?, endpoint = ? WHERE id = ?',
      [name, type, endpoint, id]
    );
    res.status(200).json({ message: 'Güncellendi' });
  }
  else if (req.method === 'DELETE') {
    const { id } = req.query;
    await db.run('DELETE FROM machines WHERE id = ?', id);
    res.status(200).json({ message: 'Silindi' });
  }
}