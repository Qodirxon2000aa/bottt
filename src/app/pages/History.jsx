import { useState, useEffect } from 'react';
import { useTelegram } from '@/app/context/TelegramContext';
import { TopBar } from '@/app/components/ui/TopBar';
import { Card } from '@/app/components/ui/Card';
import { Badge } from '@/app/components/ui/Badge';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { ChipGroup, Chip } from '@/app/components/ui/Chip';
import {
  History,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import * as Dialog from '@radix-ui/react-dialog';

/* ================= STATUS MAP (JS VERSION) ================= */
const statusMap = {
  paid: {
    label: 'To‘landi',
    variant: 'success',
    icon: <CheckCircle2 className="w-4 h-4 text-success" />,
  },
  pending: {
    label: 'Jarayonda',
    variant: 'warning',
    icon: <Loader2 className="w-4 h-4 text-warning animate-spin" />,
  },
  failed: {
    label: 'Muvaffaqiyatsiz',
    variant: 'destructive',
    icon: <XCircle className="w-4 h-4 text-destructive" />,
  },
  default: {
    label: 'Nomaʼlum',
    variant: 'secondary',
    icon: null,
  },
};

export default function HistoryPage() {
  const { user } = useTelegram();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState(null);

  /* ================= FETCH ================= */
  useEffect(() => {
    if (!user?.id) {
      setError('Foydalanuvchi ID topilmadi');
      setLoading(false);
      return;
    }

    const fetchPayments = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://m4746.myxvest.ru/webapp/payments.php?user_id=${user.id}`
        );

        if (!res.ok) throw new Error(`Server xatosi: ${res.status}`);

        const data = await res.json();
        if (data.ok !== true) {
          throw new Error(data.description || 'API xatosi');
        }

        setPayments(data.payments || []);
      } catch (e) {
        setError(e.message || "Ma'lumotlarni yuklab bo‘lmadi");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [user?.id]);

  /* ================= HELPERS ================= */
  const getStatusConfig = (status) => {
    const key = status?.toLowerCase?.().trim();
    return statusMap[key] || statusMap.default;
  };

  const parseApiDate = (dateStr) => {
    try {
      const cleaned = dateStr.replace(/📆|⏰/g, '').trim();
      const [datePart, timePart] = cleaned.split('|').map((s) => s.trim());
      const [dd, mm, yyyy] = datePart.split('.');
      return new Date(`${yyyy}-${mm}-${dd}T${timePart}:00`);
    } catch {
      return new Date();
    }
  };

  const formatUZS = (stars) => {
    const rate = 150;
    return new Intl.NumberFormat('uz-UZ').format(stars * rate);
  };

  const filteredPayments = payments.filter((p) =>
    filter === 'all' ? true : p.status?.toLowerCase() === filter
  );

  /* ================= STATES ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <EmptyState
          icon={<XCircle className="w-16 h-16 text-destructive" />}
          title="Xatolik"
          description={error}
        />
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-background">
      <TopBar title="To‘lovlar tarixi" subtitle="Barcha tranzaksiyalar" />

      <div className="p-4 space-y-5">
        <ChipGroup>
          <Chip selected={filter === 'all'} onClick={() => setFilter('all')}>
            Hammasi
          </Chip>
          <Chip selected={filter === 'paid'} onClick={() => setFilter('paid')}>
            To‘landi
          </Chip>
          <Chip
            selected={filter === 'pending'}
            onClick={() => setFilter('pending')}
          >
            Jarayonda
          </Chip>
          <Chip
            selected={filter === 'failed'}
            onClick={() => setFilter('failed')}
          >
            Muvaffaqiyatsiz
          </Chip>
        </ChipGroup>

        {filteredPayments.length ? (
          filteredPayments.map((tx) => {
            const statusCfg = getStatusConfig(tx.status);
            const dateObj = parseApiDate(tx.date);

            return (
              <Card
                key={tx.order_id}
                onClick={() => setSelectedPayment(tx)}
                className="cursor-pointer hover:shadow-md transition"
              >
                <div className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{tx.type}</p>
                      <p className="text-xs text-muted-foreground">
                        Buyurtma #{tx.order_id}
                      </p>
                    </div>
                    {statusCfg.icon}
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex gap-3">
                      <span className="font-semibold">
                        <Sparkles className="inline w-4 h-4" /> {tx.amount}
                      </span>
                      <span className="text-muted-foreground">
                        {formatUZS(tx.amount)} UZS
                      </span>
                    </div>
                    <Badge variant={statusCfg.variant}>
                      {statusCfg.label}
                    </Badge>
                  </div>

                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(dateObj, 'dd MMM yyyy • HH:mm')}
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <EmptyState
            icon={<History className="w-16 h-16" />}
            title="Maʼlumot yo‘q"
            description="Hozircha tranzaksiya mavjud emas"
          />
        )}
      </div>

      {/* MODAL */}
      <Dialog.Root
        open={!!selectedPayment}
        onOpenChange={(o) => !o && setSelectedPayment(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md">
            {selectedPayment && (
              <Card className="p-6 space-y-4">
                <h2 className="text-lg font-semibold text-center">
                  {selectedPayment.type}
                </h2>
                <p className="text-center text-muted-foreground">
                  #{selectedPayment.order_id}
                </p>

                <Dialog.Close asChild>
                  <button className="w-full h-11 bg-secondary rounded-xl">
                    Yopish
                  </button>
                </Dialog.Close>
              </Card>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
