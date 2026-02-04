import { Machine, Parameter } from '@/types';

export const initialMachines: Machine[] = [
  {
    id: '1',
    name: 'CNC Freze Makinesi #1',
    type: 'CNC',
    endpoint: 'opc.tcp://192.168.1.100:4840',
    status: 'online',
    parameters: [
      { id: 'p1', machine_id: '1', node_id: 'ns=2;i=1001', name: 'Sıcaklık', data_type: 'Double', unit: '°C' },
      { id: 'p2', machine_id: '1', node_id: 'ns=2;i=1002', name: 'Devir Hızı', data_type: 'Int', unit: 'RPM' },
    ],
  },
  {
    id: '2',
    name: 'Kaynak Robotu A1',
    type: 'Robot',
    endpoint: 'opc.tcp://192.168.1.101:4840',
    status: 'online',
    parameters: [
      { id: 'p3', machine_id: '2', node_id: 'ns=2;i=2001', name: 'Akım', data_type: 'Double', unit: 'A' },
      { id: 'p4', machine_id: '2', node_id: 'ns=2;i=2002', name: 'Voltaj', data_type: 'Double', unit: 'V' },
      { id: 'p5', machine_id: '2', node_id: 'ns=2;i=2003', name: 'Aktif', data_type: 'Boolean', unit: '' },
    ],
  },
  {
    id: '3',
    name: 'Ana PLC Kontrolör',
    type: 'PLC',
    endpoint: 'opc.tcp://192.168.1.102:4840',
    status: 'offline',
    parameters: [
      { id: 'p6', machine_id: '3', node_id: 'ns=2;i=3001', name: 'CPU Yükü', data_type: 'Double', unit: '%' },
    ],
  },
  {
    id: '4',
    name: 'Basınç Sensörü PS-01',
    type: 'Sensör',
    endpoint: 'opc.tcp://192.168.1.103:4840',
    status: 'online',
    parameters: [
      { id: 'p7', machine_id: '4', node_id: 'ns=2;i=4001', name: 'Basınç', data_type: 'Double', unit: 'bar' },
    ],
  },
];

export const generateId = () => Math.random().toString(36).substr(2, 9);
