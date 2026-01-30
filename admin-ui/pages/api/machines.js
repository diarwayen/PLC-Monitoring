// admin-ui/pages/api/machines.js
import db from '../../lib/db';

export default function handler(req, res) {
  if (req.method === 'GET') {
    // Tüm makineleri listele
    db.all("SELECT * FROM machines", [], (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(200).json(rows);
    });
  } else if (req.method === 'POST') {
    // Yeni makine ekle
    const { name, endpoint, type } = req.body;
    const sql = "INSERT INTO machines (name, endpoint, type) VALUES (?, ?, ?)";
    const params = [name, endpoint, type];
    
    db.run(sql, params, function(err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.status(201).json({ id: this.lastID, name, endpoint });
    });
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}