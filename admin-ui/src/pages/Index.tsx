import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { MachineTable } from '@/components/dashboard/MachineTable';
import { MachineSheet } from '@/components/dashboard/MachineSheet';
import { Machine } from '@/types';
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
      // Sadece /api/machines çağırıyoruz. Çünkü parametreler içinde geliyor!
      const res = await fetch('/api/machines');
      const data = await res.json();

      // Backend'den gelen veriyi Frontend tiplerine (String ID) uyduruyoruz
      const formattedData: Machine[] = data.map((m: any) => ({
        ...m,
        id: m.id.toString(), // SQLite number döner, biz string kullanıyoruz
        status: m.status || 'offline', 
        parameters: m.parameters.map((p: any) => ({
          ...p,
          id: p.id.toString(),
          machine_id: p.machine_id.toString(),
          // Threshold null gelebilir, frontend bunu handle eder
        }))
      }));

      setMachines(formattedData);
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

  // --- 2. MAKİNE KAYDETME / GÜNCELLEME (TEK SEFERDE) ---
  const handleSaveMachine = async (machineData: Machine) => {
    try {
      const isEdit = !!machineData.id; // ID varsa düzenlemedir
      
      // Tek bir istek atıyoruz. Backend her şeyi (parametreler, silme, ekleme) hallediyor.
      const method = isEdit ? 'PUT' : 'POST';
      
      console.log("📤 API'ye Giden Veri:", machineData);

      const res = await fetch('/api/machines', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...machineData,
          // ID'yi number'a çevirip gönderelim (gerçi backend string de alsa sqlite anlar ama garanti olsun)
          id: machineData.id ? Number(machineData.id) : undefined
        }),
      });

      if (!res.ok) throw new Error('API Hatası');

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
  const totalParams = machines.reduce((acc, curr) => acc + (curr.parameters?.length || 0), 0);

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