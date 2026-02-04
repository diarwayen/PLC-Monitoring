import { useState, useEffect } from 'react';
import { Machine, Parameter, MachineFormData } from '@/types';
import { generateId } from '@/data/mockData';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Server, Settings } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MachineSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  machine?: Machine | null;
  onSave: (machine: Machine) => void;
}

const machineTypes: Machine['type'][] = ['CNC', 'Robot', 'PLC', 'Sensör', 'Diğer'];
const dataTypes: Parameter['data_type'][] = ['Double', 'Int', 'Boolean'];

export function MachineSheet({ open, onOpenChange, machine, onSave }: MachineSheetProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<Machine['type']>('CNC');
  const [endpoint, setEndpoint] = useState('');
  const [parameters, setParameters] = useState<Omit<Parameter, 'machine_id'>[]>([]);

  const isEditing = !!machine;

  useEffect(() => {
    if (machine) {
      setName(machine.name);
      setType(machine.type);
      setEndpoint(machine.endpoint);
      setParameters(machine.parameters.map(({ machine_id, ...rest }) => rest));
    } else {
      setName('');
      setType('CNC');
      setEndpoint('');
      setParameters([]);
    }
  }, [machine, open]);

  const addParameter = () => {
    setParameters([
      ...parameters,
      {
        id: generateId(),
        node_id: '',
        name: '',
        data_type: 'Double',
        unit: '',
      },
    ]);
  };

  const updateParameter = (
    index: number,
    field: keyof Omit<Parameter, 'id' | 'machine_id'>,
    value: string
  ) => {
    const updated = [...parameters];
    updated[index] = { ...updated[index], [field]: value };
    setParameters(updated);
  };

  const removeParameter = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const machineId = machine?.id || generateId();
    const newMachine: Machine = {
      id: machineId,
      name,
      type,
      endpoint,
      status: machine?.status || 'offline',
      parameters: parameters.map((p) => ({ ...p, machine_id: machineId })),
    };
    onSave(newMachine);
    onOpenChange(false);
  };

  const isValid = name.trim() && endpoint.trim();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg border-l border-border bg-background p-0 flex flex-col">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle className="flex items-center gap-2 text-foreground">
            <Server className="h-5 w-5" />
            {isEditing ? 'Makineyi Düzenle' : 'Yeni Makine Ekle'}
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            {isEditing
              ? 'Makine bilgilerini güncelleyin ve parametreleri yönetin.'
              : 'Yeni bir makine ekleyin ve OPC-UA parametrelerini tanımlayın.'}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6 pb-6">
            {/* General Info Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Settings className="h-4 w-4" />
                Genel Bilgiler
              </div>
              
              <div className="space-y-4 pl-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm text-muted-foreground">
                    Makine Adı <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="CNC Freze Makinesi #1"
                    className="bg-surface border-0 focus-visible:ring-1 focus-visible:ring-navy-light"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type" className="text-sm text-muted-foreground">
                    Makine Tipi
                  </Label>
                  <Select value={type} onValueChange={(v) => setType(v as Machine['type'])}>
                    <SelectTrigger className="bg-surface border-0 focus:ring-1 focus:ring-navy-light">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {machineTypes.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endpoint" className="text-sm text-muted-foreground">
                    Endpoint URL <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="endpoint"
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    placeholder="opc.tcp://192.168.1.100:4840"
                    className="bg-surface border-0 focus-visible:ring-1 focus-visible:ring-navy-light font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-border" />

            {/* Parameters Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Settings className="h-4 w-4" />
                  Parametre Eşleştirme
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addParameter}
                  className="h-8 text-xs border-border hover:bg-surface"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Parametre Ekle
                </Button>
              </div>

              <div className="space-y-3 pl-6">
                {parameters.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground border border-dashed border-border rounded-lg bg-surface/50">
                    Henüz parametre eklenmedi.
                    <br />
                    <button
                      onClick={addParameter}
                      className="text-navy-light hover:underline mt-1 inline-block"
                    >
                      Parametre ekle
                    </button>
                  </div>
                ) : (
                  parameters.map((param, index) => (
                    <div
                      key={param.id}
                      className="p-4 rounded-lg bg-surface border border-border/50 space-y-3 animate-fade-in"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">
                          Parametre #{index + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeParameter(index)}
                          className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">
                            Node ID <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            value={param.node_id}
                            onChange={(e) => updateParameter(index, 'node_id', e.target.value)}
                            placeholder="ns=2;i=1001"
                            className="h-9 text-sm bg-background border-border focus-visible:ring-1 focus-visible:ring-navy-light font-mono"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">
                            Parametre Adı <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            value={param.name}
                            onChange={(e) => updateParameter(index, 'name', e.target.value)}
                            placeholder="Sıcaklık"
                            className="h-9 text-sm bg-background border-border focus-visible:ring-1 focus-visible:ring-navy-light"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Veri Tipi</Label>
                          <Select
                            value={param.data_type}
                            onValueChange={(v) =>
                              updateParameter(index, 'data_type', v as Parameter['data_type'])
                            }
                          >
                            <SelectTrigger className="h-9 text-sm bg-background border-border focus:ring-1 focus:ring-navy-light">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {dataTypes.map((dt) => (
                                <SelectItem key={dt} value={dt}>
                                  {dt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Birim</Label>
                          <Input
                            value={param.unit}
                            onChange={(e) => updateParameter(index, 'unit', e.target.value)}
                            placeholder="°C, RPM, bar"
                            className="h-9 text-sm bg-background border-border focus-visible:ring-1 focus-visible:ring-navy-light"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        <SheetFooter className="p-6 pt-4 border-t border-border bg-surface/50">
          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-border hover:bg-surface"
            >
              İptal
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isValid}
              className="flex-1 bg-navy hover:bg-navy/90 text-primary-foreground"
            >
              {isEditing ? 'Güncelle' : 'Kaydet'}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
