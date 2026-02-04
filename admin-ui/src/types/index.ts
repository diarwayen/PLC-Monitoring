export interface Parameter {
  id: string;
  machine_id: string;
  node_id: string;
  name: string;
  data_type: 'Double' | 'Int' | 'Boolean';
  unit: string;
}

export interface Machine {
  id: string;
  name: string;
  type: 'CNC' | 'Robot' | 'PLC' | 'Sensör' | 'Diğer';
  endpoint: string;
  status: 'online' | 'offline';
  parameters: Parameter[];
}

export type MachineFormData = Omit<Machine, 'id' | 'status'>;
