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

/* ================= STATUS MAP ================= */
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
  cancel: {
    label: 'Bekor qilingan',
    variant: 'destructive',
    icon: <XCircle className="w-4 h-4 text-destructive" />,
  },
  cancelled: {
    label: 'Bekor qilingan',
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

  // Telegram WebApp obyektini olish
  const tg = window.Telegram?.WebApp;

  /* ================= FETCH PAYMENTS ================= */
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
          throw new Error(data.description || data.message || 'API xatosi');
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
    if (!status) return statusMap.default;

    const key = status.toLowerCase().trim();

    if (key === 'cancel' || key === 'cancelled') {
      return statusMap.cancel;
    }

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

  const handlePay = (link) => {
    if (link && tg) {
      tg.openLink(link);
    } else if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  const filteredPayments = payments.filter((p) => {
    if (filter === 'all') return true;

    const status = p.status?.toLowerCase?.().trim() || '';

    if (filter === 'cancel') {
      return status === 'cancel' || status === 'cancelled';
    }

    return status === filter;
  });

  /* ================= LOADING / ERROR STATES ================= */
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

  /* ================= MAIN UI ================= */
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
          <Chip
            selected={filter === 'cancel'}
            onClick={() => setFilter('cancel')}
          >
            Bekor qilingan
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
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">To'lov turi: {tx.type || 'To‘lov'}</p>
                      <p className="text-xs text-muted-foreground">
                        Raqami: #{tx.order_id}
                      </p>
                    </div>
                    {statusCfg.icon}
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-semibold flex items-center gap-1">
                      {tx.amount} So'm 
                    </span>
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
            description={
              filter === 'all'
                ? 'Hozircha tranzaksiya mavjud emas'
                : `Bu filtr bo‘yicha (${statusMap[filter]?.label || filter}) tranzaksiya topilmadi`
            }
          />
        )}
      </div>

      {/* ================= MODAL ================= */}
      <Dialog.Root
        open={!!selectedPayment}
        onOpenChange={(open) => !open && setSelectedPayment(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {selectedPayment && (() => {
              const statusCfg = getStatusConfig(selectedPayment.status);
              const dateObj = parseApiDate(selectedPayment.date);
              const isPending = selectedPayment.status?.toLowerCase().trim() === 'pending';
              const hasLink = !!selectedPayment.link;

              // Avatar uchun birinchi harf (agar type bo'lsa, masalan "Tonkeeper" → T)
              const avatarInitial = (selectedPayment.type || 'T').charAt(0).toUpperCase();

              return (
                <div className="w-full max-w-[380px] bg-[#0f0f17] text-white rounded-3xl overflow-hidden shadow-2xl border border-gray-800/50">
                  {/* Header / Avatar qismi */}
                  <div className="pt-10 pb-6 px-6 text-center">
                    <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-5xl font-bold shadow-xl">
                      {avatarInitial}
                    </div>

                    <h2 className="mt-5 text-2xl font-semibold">
                      {selectedPayment.type || 'To‘lov'}
                    </h2>

                    <p className="text-gray-400 text-sm mt-1">
                      #{selectedPayment.order_id}
                    </p>

                   
                    
                  </div>

                  {/* Ma'lumotlar bloki */}
                  <div className="px-6 pb-10 pt-4 bg-black/30 space-y-6">
                    <div className="space-y-5">
                      <div className="flex justify-between items-center text-base">
                        <span className="text-gray-400">Holati</span>
                        <Badge
                          variant={statusCfg.variant}
                          className={
                            statusCfg.variant === 'success'
                              ? 'bg-green-600/30 text-green-400 border-green-500/30 px-4 py-1'
                              : statusCfg.variant === 'warning'
                              ? 'bg-yellow-600/30 text-yellow-400 border-yellow-500/30 px-4 py-1'
                              : 'bg-red-600/30 text-red-400 border-red-500/30 px-4 py-1'
                          }
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center text-base">
                        <span className="text-gray-400">Miqdori</span>
                        <span className="font-medium flex items-center gap-2 text-lg">
                          {selectedPayment.amount} So'm
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-base">
                        <span className="text-gray-400">Ton</span>
                        <span className="font-medium flex items-center gap-2 text-lg">
                          {selectedPayment.ton} Ton
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-base">
                        <span className="text-gray-400">Sana</span>
                        <span className="text-base">
                          {format(dateObj, 'dd MMM yyyy • HH:mm')}
                        </span>
                      </div>

                      {selectedPayment.transaction_id && (
                        <div className="flex justify-between items-start gap-3 text-sm pt-2">
                          <span className="text-gray-400 shrink-0">Tranzaksiya ID</span>
                          <span className="font-mono text-gray-300 break-all text-right">
                            {selectedPayment.transaction_id}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Tugmalar */}
                    <div className="pt-6 space-y-4">
                      {isPending && hasLink && (
                        <button
                          onClick={() => handlePay(selectedPayment.link)}
                          className="w-full py-4 bg-green-600 hover:bg-green-500 active:bg-green-700 text-white font-medium rounded-2xl transition text-lg shadow-lg"
                        >
                          To‘lov qilish
                        </button>
                      )}

                      <Dialog.Close asChild>
                        <button className="w-full py-4 bg-gray-800 hover:bg-gray-700 active:bg-gray-900 text-white font-medium rounded-2xl transition text-lg">
                          Yopish
                        </button>
                      </Dialog.Close>
                    </div>
                  </div>
                </div>
              );
            })()}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}