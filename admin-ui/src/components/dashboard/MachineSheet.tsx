import { useState, useEffect } from 'react';
import { Machine, Parameter } from '@/types';
// Projende global bir helper yoksa bu basit fonksiyonu kullan:
const generateId = () => Math.floor(Math.random() * 100000);

import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const [parameters, setParameters] = useState<any[]>([]);

  const isEditing = !!machine;

  useEffect(() => {
    if (machine) {
      setName(machine.name);
      setType(machine.type);
      setEndpoint(machine.endpoint);
      // Gelen veriyi state'e yükle. Null değerleri boş string yap (Input hatası olmasın diye)
      setParameters(machine.parameters.map((p) => ({
        ...p,
        threshold: (p.threshold !== null && p.threshold !== undefined) ? p.threshold : ''
      })));
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
        node_id: 'ns=1;i=',
        name: '',
        data_type: 'Double',
        unit: '',
        threshold: '', // Yeni eklenen boş başlar
      },
    ]);
  };

  const updateParameter = (index: number, field: string, value: any) => {
    const updated = [...parameters];
    updated[index] = { ...updated[index], [field]: value };
    setParameters(updated);
  };

  const removeParameter = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const machineId = machine?.id || generateId();
    
    // API'ye göndermeden önce temizlik yap
    const formattedParameters = parameters.map((p) => {
      // Eğer threshold boş string ise NULL gönder, yoksa Sayıya çevir
      let safeThreshold = null;
      if (p.threshold !== '' && p.threshold !== null && p.threshold !== undefined) {
         safeThreshold = Number(p.threshold);
      }

      return {
        ...p,
        machine_id: machineId,
        threshold: safeThreshold
      };
    });

    const newMachine: Machine = {
      id: machineId,
      name,
      type,
      endpoint,
      status: machine?.status || 'offline',
      parameters: formattedParameters,
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
            Makine bilgilerini ve alarm limitlerini (threshold) yönetin.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6 pb-6">
            <div className="space-y-4">
               <div className="space-y-2"><Label>Makine Adı</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Örn: CNC Torna" /></div>
               <div className="space-y-2"><Label>Tip</Label>
                 <Select value={type} onValueChange={(v) => setType(v as any)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{machineTypes.map(t=><SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
               </div>
               <div className="space-y-2"><Label>Endpoint</Label><Input value={endpoint} onChange={(e) => setEndpoint(e.target.value)} className="font-mono text-sm"/></div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="font-medium text-sm">Parametreler</div>
                <Button size="sm" variant="outline" onClick={addParameter}><Plus className="w-3 h-3 mr-1"/> Ekle</Button>
              </div>
              
              <div className="space-y-3">
                {parameters.map((param, index) => (
                  <div key={index} className="p-4 rounded-lg bg-surface border border-border/50 space-y-3">
                    <div className="flex justify-between items-center">
                       <span className="text-xs text-muted-foreground">Parametre #{index+1}</span>
                       <Button variant="ghost" size="icon" onClick={() => removeParameter(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1"><Label className="text-xs">Node ID</Label><Input value={param.node_id} onChange={(e) => updateParameter(index, 'node_id', e.target.value)} className="h-8 text-xs font-mono"/></div>
                      <div className="space-y-1"><Label className="text-xs">İsim</Label><Input value={param.name} onChange={(e) => updateParameter(index, 'name', e.target.value)} className="h-8 text-xs"/></div>
                      <div className="space-y-1"><Label className="text-xs">Birim</Label><Input value={param.unit} onChange={(e) => updateParameter(index, 'unit', e.target.value)} className="h-8 text-xs"/></div>
                      
                      {/* THRESHOLD INPUT */}
                      <div className="space-y-1">
                        <Label className="text-xs text-red-500 font-medium">Alarm Limiti</Label>
                        <Input 
                          type="number" 
                          step="0.1"
                          placeholder="Örn: 70"
                          value={param.threshold} 
                          onChange={(e) => updateParameter(index, 'threshold', e.target.value)} 
                          className="h-8 text-xs border-red-200 focus:border-red-500" 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <SheetFooter className="p-6 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>İptal</Button>
            <Button onClick={handleSave} disabled={!isValid}>Kaydet</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}