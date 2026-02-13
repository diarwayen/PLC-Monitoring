export interface Parameter {
  id: number;
  machine_id: number;
  node_id: string;
  name: string;
  data_type: 'Double' | 'Int' | 'Boolean';
  unit: string;
  threshold: number | null; // <-- YENİ: Eklendi (Boş olabilir diye null)
}

export interface Machine {
  id: number;
  name: string;
  type: 'CNC' | 'Robot' | 'PLC' | 'Sensör' | 'Robot'|'Diğer';
  endpoint: string;
  status: 'online' | 'offline';
  parameters: Parameter[];
}
