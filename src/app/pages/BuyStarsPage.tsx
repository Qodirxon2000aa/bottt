import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp, TelegramProfile } from '@/app/context/AppContext';
import { TopBar } from '@/app/components/ui/TopBar';
import { Card, CardContent } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { ChipGroup, Chip } from '@/app/components/ui/Chip';
import { MessageBox } from '@/app/components/ui/EmptyState';
import { UsernameInput } from '@/app/components/UsernameInput';
import { StarsStepper } from '@/app/components/StarsStepper';
import { SummaryCard } from '@/app/components/SummaryCard';
import { ArrowLeft, Sparkles, Bookmark } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';

const PRESET_AMOUNTS = [50, 100, 250, 500, 1000];

export function BuyStarsPage() {
  const navigate = useNavigate();
  const { currentRate, addTransaction } = useApp();
  
  const [username, setUsername] = useState('');
  const [foundProfile, setFoundProfile] = useState<TelegramProfile | null>(null);
  const [stars, setStars] = useState(100);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(100);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStarsChange = (value: number) => {
    setStars(value);
    setSelectedPreset(PRESET_AMOUNTS.includes(value) ? value : null);
  };

  const handlePresetClick = (amount: number) => {
    setStars(amount);
    setSelectedPreset(amount);
  };

  const canProceed = username.length > 0 && foundProfile?.status === 'found' && stars > 0;

  const handleConfirmPayment = async () => {
    if (!foundProfile || foundProfile.status !== 'found') return;

    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    addTransaction({
      recipientUsername: foundProfile.username,
      recipientDisplayName: foundProfile.displayName,
      stars,
      rateUZS: currentRate,
      totalUZS: stars * currentRate
    });

    setIsProcessing(false);
    setShowConfirmDialog(false);
    
    toast.success('Payment successful!', {
      description: `${stars} stars sent to @${foundProfile.username}`
    });

    // Reset form
    setUsername('');
    setFoundProfile(null);
    setStars(100);
    setSelectedPreset(100);

    // Navigate to history after a short delay
    setTimeout(() => {
      navigate('/history');
    }, 1000);
  };

  return (
    <div className="min-h-screen">
      <TopBar
        title="Buy Stars"
        subtitle="Send Telegram Stars to any user"
        backButton={
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full hover:bg-accent flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        }
      />

      <div className="p-4 space-y-6">
        {/* Info Banner */}
        <MessageBox type="info">
          Current rate: <strong>1 ⭐ = {new Intl.NumberFormat('uz-UZ').format(currentRate)} UZS</strong>
        </MessageBox>

        {/* Recipient Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Recipient Username</label>
            <button className="text-sm text-primary hover:underline flex items-center gap-1">
              <Bookmark className="w-3.5 h-3.5" />
              Saved
            </button>
          </div>
          <UsernameInput
            value={username}
            onChange={setUsername}
            onProfileFound={setFoundProfile}
          />
        </div>

        {/* Stars Amount Section */}
        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-telegram-gold" />
            Stars Amount
          </label>

          <ChipGroup>
            {PRESET_AMOUNTS.map((amount) => (
              <Chip
                key={amount}
                selected={selectedPreset === amount}
                onClick={() => handlePresetClick(amount)}
              >
                {amount}
              </Chip>
            ))}
          </ChipGroup>

          <StarsStepper
            value={stars}
            onChange={handleStarsChange}
            min={1}
            max={100000}
          />
        </div>

        {/* Summary */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Summary</label>
          <SummaryCard stars={stars} rateUZS={currentRate} />
        </div>

        {/* Actions */}
        <div className="space-y-2 sticky bottom-20 bg-background/80 backdrop-blur-lg p-4 -mx-4 border-t border-border">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!canProceed}
            onClick={() => setShowConfirmDialog(true)}
          >
            <Sparkles className="w-5 h-5" />
            Pay & Send Stars
          </Button>
          
          <Button
            variant="secondary"
            size="md"
            fullWidth
            disabled={!foundProfile || foundProfile.status !== 'found'}
          >
            <Bookmark className="w-4 h-4" />
            Save Recipient
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog.Root open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md z-50">
            <Card className="shadow-2xl">
              <div className="p-6 space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <Dialog.Title className="text-xl font-medium mb-2">
                    Confirm Payment
                  </Dialog.Title>
                  <Dialog.Description className="text-sm text-muted-foreground">
                    Review your order before confirming
                  </Dialog.Description>
                </div>

                {foundProfile && (
                  <Card className="bg-accent/20">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white">
                          {foundProfile.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{foundProfile.displayName}</p>
                          <p className="text-sm text-muted-foreground">@{foundProfile.username}</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Stars</span>
                          <span className="font-medium">{stars} ⭐</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Rate</span>
                          <span className="font-medium">{new Intl.NumberFormat('uz-UZ').format(currentRate)} UZS</span>
                        </div>
                        <div className="h-px bg-border my-2" />
                        <div className="flex justify-between text-base">
                          <span className="font-medium">Total</span>
                          <span className="font-bold">{new Intl.NumberFormat('uz-UZ').format(stars * currentRate)} UZS</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => setShowConfirmDialog(false)}
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={handleConfirmPayment}
                    loading={isProcessing}
                  >
                    Confirm & Pay
                  </Button>
                </div>
              </div>
            </Card>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
