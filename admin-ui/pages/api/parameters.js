import { openDb } from './db';

export default async function handler(req, res) {
  const db = await openDb();

  if (req.method === 'GET') {
    const { machineId } = req.query;
    if (machineId) {
      const params = await db.all('SELECT * FROM parameters WHERE machine_id = ?', machineId);
      res.status(200).json(params);
    } else {
      const allParams = await db.all('SELECT * FROM parameters');
      res.status(200).json(allParams);
    }
  } 
  else if (req.method === 'POST') {
    const { machine_id, node_id, name, data_type, unit } = req.body;
    const result = await db.run(
      'INSERT INTO parameters (machine_id, node_id, name, data_type, unit) VALUES (?, ?, ?, ?, ?)',
      [machine_id, node_id, name, data_type, unit]
    );
    res.status(201).json({ id: result.lastID });
  } 
  else if (req.method === 'DELETE') { 
    // Makine güncellenirken toplu temizlik için kullanılır
    const { machine_id } = req.query;
    if(machine_id) {
       await db.run('DELETE FROM parameters WHERE machine_id = ?', machine_id);
       res.status(200).json({ message: 'Makine parametreleri temizlendi' });
    }
  }
}