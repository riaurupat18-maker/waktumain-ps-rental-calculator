import { useEffect, useMemo } from 'react';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { Trash2, History, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { Calculation } from '@shared/types';
import { useTheme } from '@/hooks/use-theme';
import { TimePicker } from '@/components/ui/time-picker';
// --- UTILITY FUNCTIONS ---
const parseTime = (timeStr: string): [number, number] | null => {
  const parts = timeStr.match(/^(\d{1,2})[:.]?(\d{2})$/);
  if (!parts) return null;
  const hours = parseInt(parts[1], 10);
  const minutes = parseInt(parts[2], 10);
  if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
    return [hours, minutes];
  }
  return null;
};
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
// --- ZUSTAND STORE ---
interface ResultState {
  duration: string;
  total: number;
}
interface AppState {
  startTime: string;
  endTime: string;
  hourlyRate: string;
  result: ResultState | null;
  history: Calculation[];
}
interface AppActions {
  setStartTime: (time: string) => void;
  setEndTime: (time: string) => void;
  setHourlyRate: (rate: string) => void;
  calculate: () => void;
  addHistory: (item: Calculation) => void;
  clearHistory: () => void;
  setHistory: (history: Calculation[]) => void;
}
const useStore = create<AppState & AppActions>()(
  immer((set, get) => ({
    startTime: '20:30',
    endTime: '23:45',
    hourlyRate: '5000',
    result: null,
    history: [],
    setStartTime: (time) => set({ startTime: time }),
    setEndTime: (time) => set({ endTime: time }),
    setHourlyRate: (rate) => set({ hourlyRate: rate }),
    setHistory: (history) => set({ history }),
    addHistory: (item) => set((state) => {
      state.history.unshift(item);
    }),
    clearHistory: () => {
      set({ history: [], result: null });
      toast.success('Riwayat berhasil dihapus.');
    },
    calculate: () => {
      const { startTime, endTime, hourlyRate } = get();
      const start = parseTime(startTime);
      const end = parseTime(endTime);
      const rate = parseFloat(hourlyRate);
      if (!start) {
        toast.error('Format Waktu Mulai salah. Gunakan HH:MM.');
        return;
      }
      if (!end) {
        toast.error('Format Waktu Selesai salah. Gunakan HH:MM.');
        return;
      }
      if (isNaN(rate) || rate <= 0) {
        toast.error('Tarif per Jam harus angka positif.');
        return;
      }
      const startDate = new Date(0);
      startDate.setUTCHours(start[0], start[1], 0, 0);
      const endDate = new Date(0);
      endDate.setUTCHours(end[0], end[1], 0, 0);
      if (endDate <= startDate) {
        endDate.setDate(endDate.getDate() + 1);
      }
      const diffMs = endDate.getTime() - startDate.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      const total = Math.round(diffHours * rate);
      const durationHours = Math.floor(diffMs / (1000 * 60 * 60));
      const durationMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const duration = `${durationHours} jam ${durationMinutes} menit`;
      const newResult = { duration, total };
      set({ result: newResult });
      const newHistoryEntry: Calculation = {
        id: crypto.randomUUID(),
        startTime,
        endTime,
        hourlyRate: rate,
        duration,
        total,
        timestamp: Date.now(),
      };
      get().addHistory(newHistoryEntry);
      toast.success('Perhitungan berhasil!');
    },
  }))
);
// --- COMPONENTS ---
function CalculatorForm() {
  const startTime = useStore((s) => s.startTime);
  const setStartTime = useStore((s) => s.setStartTime);
  const endTime = useStore((s) => s.endTime);
  const setEndTime = useStore((s) => s.setEndTime);
  const hourlyRate = useStore((s) => s.hourlyRate);
  const setHourlyRate = useStore((s) => s.setHourlyRate);
  const calculate = useStore((s) => s.calculate);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculate();
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start-time">Waktu Mulai</Label>
          <TimePicker value={startTime} onChange={setStartTime} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end-time">Waktu Selesai</Label>
          <TimePicker value={endTime} onChange={setEndTime} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="hourly-rate">Tarif per Jam (Rp)</Label>
        <Input id="hourly-rate" type="number" placeholder="cth: 5000" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} />
      </div>
      <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold text-lg py-6 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-100">
        Hitung
      </Button>
    </form>
  );
}
function ResultDisplay() {
  const result = useStore((s) => s.result);
  return (
    <AnimatePresence>
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <Card className="bg-violet-600/10 border-violet-600/30">
            <CardContent className="p-6 space-y-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Durasi Main</p>
                <p className="text-2xl font-bold text-foreground">{result.duration}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Biaya</p>
                <p className="text-4xl font-extrabold text-violet-500">{formatCurrency(result.total)}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
function HistoryTable() {
  const history = useStore((s) => s.history);
  const clearHistory = useStore((s) => s.clearHistory);
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <History className="w-5 h-5" />
          Riwayat
        </h3>
        {history.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Hapus Riwayat
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Anda yakin?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tindakan ini akan menghapus semua riwayat perhitungan secara permanen.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={clearHistory}>Hapus</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Durasi</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {history.length > 0 ? (
                    history.map((item, index) => (
                      <motion.tr
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="w-full"
                      >
                        <TableCell>
                          <div className="font-medium">{item.startTime} - {item.endTime}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(item.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                        </TableCell>
                        <TableCell>{item.duration}</TableCell>
                        <TableCell className="text-right font-semibold text-violet-400">{formatCurrency(item.total)}</TableCell>
                      </motion.tr>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                        Belum ada riwayat perhitungan.
                      </TableCell>
                    </TableRow>
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
// --- MAIN PAGE COMPONENT ---
export function HomePage() {
  const { isDark, toggleTheme } = useTheme();
  const [history, setHistoryInLocalStorage] = useLocalStorage<Calculation[]>('waktuMainHistory', []);
  const setHistoryInStore = useStore((s) => s.setHistory);
  const historyFromStore = useStore((s) => s.history);
  // Sync localStorage with Zustand store
  useEffect(() => {
    setHistoryInStore(history);
  }, [history, setHistoryInStore]);
  useEffect(() => {
    setHistoryInLocalStorage(historyFromStore);
  }, [historyFromStore, setHistoryInLocalStorage]);
  // Set dark theme by default
  useEffect(() => {
    if (!isDark) {
      toggleTheme();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <main className="min-h-screen bg-background text-foreground font-sans antialiased">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-950 to-black" />
        <div className="relative container max-w-lg mx-auto px-4 py-8 md:py-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center bg-violet-600/10 p-3 rounded-full mb-4 border border-violet-600/20">
              <Gamepad2 className="w-8 h-8 text-violet-500" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-zinc-50 to-zinc-400">
              WaktuMain
            </h1>
            <p className="text-muted-foreground mt-2">Kalkulator Rental PS</p>
          </div>
          <div className="space-y-8">
            <Card className="bg-card/80 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle>Hitung Biaya Rental</CardTitle>
              </CardHeader>
              <CardContent>
                <CalculatorForm />
              </CardContent>
            </Card>
            <ResultDisplay />
            <HistoryTable />
          </div>
          <footer className="text-center text-muted-foreground/50 mt-12 text-sm">
            <p>Built with ❤️ at Cloudflare</p>
          </footer>
        </div>
      </main>
      <Toaster richColors theme={isDark ? 'dark' : 'light'} />
    </>
  );
}