// admin-ui/pages/index.js
import { useState, useEffect } from 'react';

export default function Home() {
  const [machines, setMachines] = useState([]);
  const [formData, setFormData] = useState({ name: '', endpoint: 'opc.tcp://sim-opcua-plc:4840', type: 'CNC' });

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    const res = await fetch('/api/machines');
    const data = await res.json();
    setMachines(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('/api/machines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    setFormData({ ...formData, name: '' });
    fetchMachines();
  };

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">PLC Yönetim Paneli</h1>
      
      {/* Form Alanı */}
      <div className="bg-gray-100 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Yeni Makine Ekle</h2>
        <form onSubmit={handleSubmit} className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium">Makine Adı</label>
            <input 
              type="text" 
              className="border p-2 rounded w-full" 
              placeholder="Örn: CNC-01"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium">OPC UA Endpoint</label>
            <input 
              type="text" 
              className="border p-2 rounded w-full" 
              value={formData.endpoint}
              onChange={(e) => setFormData({...formData, endpoint: e.target.value})}
            />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
            Ekle
          </button>
        </form>
      </div>

      {/* Liste Alanı */}
      <div className="grid gap-4">
        {machines.map((m) => (
          <div key={m.id} className="border p-4 rounded flex justify-between items-center bg-white shadow-sm">
            <div>
              <h3 className="font-bold text-lg">{m.name}</h3>
              <p className="text-gray-500 text-sm">{m.endpoint}</p>
            </div>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
              Aktif
            </span>
          </div>
        ))}
        {machines.length === 0 && <p className="text-gray-500">Henüz kayıtlı makine yok.</p>}
      </div>
    </div>
  );
}