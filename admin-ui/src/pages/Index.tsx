import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { MachineTable } from '@/components/dashboard/MachineTable';
import { MachineSheet } from '@/components/dashboard/MachineSheet';
import { Machine, Parameter } from '@/types';
import { Server, Activity, Database } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [loading, setLoading] = useState(true);

  // --- 1. VERİLERİ ÇEKME (READ) ---
  const fetchData = async () => {
    try {
      setLoading(true);
      // Paralel olarak hem makineleri hem parametreleri çek
      const [machinesRes, paramsRes] = await Promise.all([
        fetch('/api/machines'),
        fetch('/api/parameters')
      ]);

      const machinesData = await machinesRes.json();
      const paramsData = await paramsRes.json();

      // Backend'den gelen veriyi Frontend yapısına (iç içe) dönüştür
      // Not: SQLite ID'leri number döner, frontend string bekler. toString() yapıyoruz.
      const mergedData: Machine[] = machinesData.map((m: any) => ({
        ...m,
        id: m.id.toString(),
        status: 'offline', // Şimdilik varsayılan offline, ileride Node-RED'den alırız
        parameters: paramsData
          .filter((p: any) => p.machine_id === m.id)
          .map((p: any) => ({ ...p, id: p.id.toString(), machine_id: p.machine_id.toString() }))
      }));

      setMachines(mergedData);
    } catch (error) {
      console.error('Veri çekme hatası:', error);
      toast.error('Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- 2. MAKİNE KAYDETME / GÜNCELLEME (CREATE / UPDATE) ---
  const handleSaveMachine = async (machineData: Machine) => {
    try {
      const isEdit = !!selectedMachine;
      let machineId = machineData.id;

      // A) Makineyi Kaydet
      if (isEdit) {
        // Güncelleme (PUT)
        await fetch('/api/machines', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: machineData.id,
            name: machineData.name,
            type: machineData.type,
            endpoint: machineData.endpoint
          }),
        });
        
        // Düzenleme modunda eski parametreleri temizle (Basit yöntem)
        await fetch(`/api/parameters?machine_id=${machineData.id}`, { method: 'DELETE' });

      } else {
        // Yeni Kayıt (POST)
        const res = await fetch('/api/machines', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: machineData.name,
            type: machineData.type,
            endpoint: machineData.endpoint
          }),
        });
        const savedMachine = await res.json();
        machineId = savedMachine.id; // DB'den gelen gerçek ID
      }

      // B) Parametreleri Kaydet (Döngü ile tek tek ekle)
      if (machineData.parameters && machineData.parameters.length > 0) {
        for (const param of machineData.parameters) {
          await fetch('/api/parameters', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              machine_id: machineId,
              node_id: param.node_id,
              name: param.name,
              data_type: param.data_type,
              unit: param.unit
            }),
          });
        }
      }

      toast.success(isEdit ? 'Makine güncellendi' : 'Makine başarıyla eklendi');
      fetchData(); // Listeyi yenile
      setIsSheetOpen(false);
      setSelectedMachine(null);

    } catch (error) {
      console.error('Kaydetme hatası:', error);
      toast.error('İşlem başarısız oldu');
    }
  };

  // --- 3. SİLME (DELETE) ---
  const handleDeleteMachine = async (id: string) => {
    if (!window.confirm('Bu makineyi silmek istediğinize emin misiniz?')) return;

    try {
      await fetch(`/api/machines?id=${id}`, { method: 'DELETE' });
      toast.success('Makine silindi');
      fetchData();
    } catch (error) {
      console.error('Silme hatası:', error);
      toast.error('Silme işlemi başarısız');
    }
  };

  const handleEditMachine = (machine: Machine) => {
    setSelectedMachine(machine);
    setIsSheetOpen(true);
  };

  const handleAddMachine = () => {
    setSelectedMachine(null);
    setIsSheetOpen(true);
  };

  // --- KPI Hesaplamaları ---
  const totalMachines = machines.length;
  const totalOnline = machines.filter(m => m.status === 'online').length;
  const totalParams = machines.reduce((acc, curr) => acc + curr.parameters.length, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        
        {/* KPI KARTLARI */}
        <div className="grid gap-4 md:grid-cols-3">
          <KPICard
            title="Toplam Makine"
            value={totalMachines}
            icon={Server}
            trend="+12%"
            trendUp={true}
          />
          <KPICard
            title="Aktif Bağlantılar"
            value={totalOnline}
            icon={Activity}
            description="Şu an veri akışı olanlar"
          />
          <KPICard
            title="İzlenen Parametre"
            value={totalParams}
            icon={Database}
            description="Toplam sensör/veri noktası"
          />
        </div>

        {/* MAKİNE LİSTESİ */}
        <MachineTable
          machines={machines}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddMachine={handleAddMachine}
          onEditMachine={handleEditMachine}
          onDeleteMachine={handleDeleteMachine}
        />

        {/* EKLEME/DÜZENLEME PANELİ */}
        <MachineSheet
          open={isSheetOpen}
          onOpenChange={(open) => {
            setIsSheetOpen(open);
            if (!open) setSelectedMachine(null);
          }}
          machine={selectedMachine}
          onSave={handleSaveMachine}
        />
      </div>
    </DashboardLayout>
  );
};

export default Index;