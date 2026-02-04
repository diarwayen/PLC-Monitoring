import { Machine } from '@/types';
import { StatusBadge } from './StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Search, Pencil, Trash2, Server } from 'lucide-react';

interface MachineTableProps {
  machines: Machine[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddMachine: () => void;
  onEditMachine: (machine: Machine) => void;
  onDeleteMachine: (id: string) => void;
}

const machineTypeLabels: Record<Machine['type'], string> = {
  CNC: 'CNC',
  Robot: 'Robot',
  PLC: 'PLC',
  Sensör: 'Sensör',
  Diğer: 'Diğer',
};

export function MachineTable({
  machines,
  searchQuery,
  onSearchChange,
  onAddMachine,
  onEditMachine,
  onDeleteMachine,
}: MachineTableProps) {
  const filteredMachines = machines.filter(
    (machine) =>
      machine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      machine.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      machine.endpoint.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-card rounded-xl shadow-card border-0 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Makine Listesi</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Tüm bağlı makinelerinizi yönetin
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Makine ara..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 w-64 bg-surface border-0 focus-visible:ring-1 focus-visible:ring-navy-light"
              />
            </div>
            <Button onClick={onAddMachine} className="bg-navy hover:bg-navy/90 text-primary-foreground">
              <Plus className="h-4 w-4 mr-2" />
              Makine Ekle
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="text-muted-foreground font-medium">Makine Adı</TableHead>
              <TableHead className="text-muted-foreground font-medium">Tip</TableHead>
              <TableHead className="text-muted-foreground font-medium">Endpoint URL</TableHead>
              <TableHead className="text-muted-foreground font-medium">Parametre</TableHead>
              <TableHead className="text-muted-foreground font-medium">Durum</TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMachines.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Server className="h-8 w-8" />
                    <p>Henüz makine eklenmedi</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredMachines.map((machine, index) => (
                <TableRow
                  key={machine.id}
                  className="hover:bg-surface/50 border-border animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TableCell className="font-medium text-foreground">{machine.name}</TableCell>
                  <TableCell>
                    <span className="px-2.5 py-1 rounded-md bg-surface text-sm text-muted-foreground">
                      {machineTypeLabels[machine.type]}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground max-w-xs truncate">
                    {machine.endpoint}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {machine.parameters.length} parametre
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={machine.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditMachine(machine)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-surface"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteMachine(machine.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
