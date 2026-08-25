import confetti from 'canvas-confetti';
import { Transaction } from '../types';

export const formatPKR = (amount: number, includeDecimals = true): string => {
  const parts = Math.abs(amount).toFixed(includeDecimals ? 2 : 0).split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const formatted = includeDecimals ? `${integerPart}.${parts[1]}` : integerPart;
  return `Rs. ${formatted}`;
};

export const formatMobilePK = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
};

export const formatCNICPK = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
};

export const generateTxnId = (): string => {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `TXN-${random}`;
};

export const generateRaastRef = (): string => {
  const random = Math.floor(10000000 + Math.random() * 90000000);
  return `RST-PK-${random}`;
};

export const playPaymentSuccessChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Play warm melodic two-tone chime
    const now = ctx.currentTime;
    
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.00, now + 0.12); // A5
    gain2.gain.setValueAtTime(0.2, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.6);
  } catch {
    // ignore audio restrictions
  }
};

export const triggerPaymentCelebration = () => {
  playPaymentSuccessChime();
  try {
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00B56A', '#FF9900', '#0284c7', '#ffffff'],
    });
  } catch {
    // fallback
  }
};

export const getWhatsAppReceiptText = (txn: Transaction): string => {
  return encodeURIComponent(
    `*PayFlow PK — Transaction Confirmation*\n\n` +
    `✅ *Status:* Successful / Kamyab\n` +
    `💰 *Amount:* Rs. ${txn.amount.toLocaleString()}\n` +
    `👤 *Recipient:* ${txn.recipient.name}\n` +
    `🏦 *Channel:* ${txn.recipient.bankOrWallet}\n` +
    `🔖 *Account / ID:* ${txn.recipient.accountNumber || txn.recipient.raastId || txn.recipient.iban}\n` +
    `🆔 *Transaction ID:* ${txn.id}\n` +
    `⚡ *RAAST Ref:* ${txn.raastRef || 'N/A'}\n` +
    `📅 *Date & Time:* ${txn.timestamp}\n` +
    `📝 *Purpose:* ${txn.purpose || 'General Transfer'}\n` +
    `💸 *Transfer Fee:* Rs. 0.00 (Zero Fee via SBP RAAST)\n\n` +
    `_Powered by State Bank of Pakistan RAAST Instant Payment Network_`
  );
};
