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

  // Telegram WebApp obyektini olish (Mini App ichida mavjud bo'ladi)
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
      // Telegram Mini App ichida tashqi linkni ochish
      tg.openLink(link);
    } else if (link) {
      // fallback: oddiy brauzerda ochish
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
                      {tx.amount} <Sparkles className="w-4 h-4" />
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
          <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md">
            {selectedPayment &&
              (() => {
                const statusCfg = getStatusConfig(selectedPayment.status);
                const dateObj = parseApiDate(selectedPayment.date);
                const isPending = selectedPayment.status?.toLowerCase().trim() === 'pending';
                const hasLink = !!selectedPayment.link;

                return (
                  <Card className="p-6 space-y-5 bg-card text-card-foreground rounded-2xl shadow-xl">
                    <div className="text-center">
                      <h2 className="text-xl font-bold">
                        To'lov turi: {selectedPayment.type || 'To‘lov'}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        raqami: #{selectedPayment.order_id}
                      </p>
                    </div>

                    <div className="space-y-3 border-t border-b border-border py-4">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Holati:</span>
                        <Badge variant={statusCfg.variant}>
                          {statusCfg.label}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Miqdori:</span>
                        <span className="font-medium flex items-center gap-1">
                          {selectedPayment.amount} <Sparkles className="w-4 h-4" />
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Sana:</span>
                        <span>{format(dateObj, 'dd MMMM yyyy, HH:mm')}</span>
                      </div>
                      {selectedPayment.transaction_id && (
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-muted-foreground shrink-0">
                            Tranzaksiya ID:
                          </span>
                          <span className="font-mono text-xs break-all text-right">
                            {selectedPayment.transaction_id}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Dialog.Close asChild>
                        <button className="w-full h-11 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition">
                          Yopish
                        </button>
                      </Dialog.Close>

                      {isPending && hasLink && (
                        <button
                          onClick={() => handlePay(selectedPayment.link)}
                          className="w-full h-11 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition"
                        >
                          To‘lov qilish
                        </button>
                      )}
                    </div>
                  </Card>
                );
              })()}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}