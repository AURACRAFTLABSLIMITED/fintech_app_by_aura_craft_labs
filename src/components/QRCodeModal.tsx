import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  X,
  QrCode,
  Scan,
  Share2,
  Download,
  Copy,
  Check,
  Camera,
  Store,
  Sparkles,
  Zap,
  CheckCircle2,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import { Transaction, UserProfile } from '../types';
import { formatPKR, generateRaastRef, generateTxnId, triggerPaymentCelebration } from '../utils/formatters';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  initialTab?: 'my_qr' | 'scan_qr';
  onCompleteQRPay: (newTxn: Transaction) => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  user,
  initialTab = 'my_qr',
  onCompleteQRPay,
}) => {
  const [activeTab, setActiveTab] = useState<'my_qr' | 'scan_qr'>(initialTab);
  const [qrAmount, setQrAmount] = useState<string>('');
  const [copiedId, setCopiedId] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [isProcessingPay, setIsProcessingPay] = useState<boolean>(false);
  const [successTxn, setSuccessTxn] = useState<Transaction | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Generate real scannable QR Code Data URL whenever user or amount changes
  useEffect(() => {
    const numAmt = parseFloat(qrAmount);
    // Standard SBP RAAST EMVCo formatted payload
    const payload = numAmt && numAmt > 0
      ? `00020101021226580010pk.gov.sbp011803017894562001520454115303586540${numAmt.toFixed(2).length}${numAmt.toFixed(2)}5802PK5923Aura Craft Labs Limited6009Islamabad6220011603017894562@raast6304`
      : `00020101021126580010pk.gov.sbp0118030178945620015204541153035865802PK5923Aura Craft Labs Limited6009Islamabad6220011603017894562@raast6304`;

    QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'M',
      margin: 1,
      scale: 8,
      color: {
        dark: '#0A111E',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR generation error', err));
  }, [user.raastId, user.name, qrAmount]);

  // Sample Merchant QR Presets for quick realistic testing
  const merchantPresets = [
    {
      name: 'Aura Craft Labs Limited (RAAST Direct)',
      account: 'PK82PAYF03017894562001',
      bank: 'PayFlow Corporate RAAST QR',
      amount: qrAmount ? parseFloat(qrAmount) : 5000,
      city: 'Islamabad HQ',
    },
    {
      name: 'Cafe Aylanto (Meezan QR)',
      account: 'MEZN-MERCH-81920',
      bank: 'Meezan Bank Merchant RAAST',
      amount: 3850,
      city: 'Islamabad / Lahore',
    },
    {
      name: 'Shell Fuel Station F-7',
      account: 'HABB-RAAST-49102',
      bank: 'HBL RAAST Merchant',
      amount: 3000,
      city: 'Islamabad',
    },
    {
      name: 'Imtiaz Super Market',
      account: 'ALFH-MERCH-99412',
      bank: 'Bank Alfalah RAAST QR',
      amount: 5420,
      city: 'Karachi / Lahore',
    },
  ];

  useEffect(() => {
    setActiveTab(initialTab);
    setSuccessTxn(null);
  }, [initialTab, isOpen]);

  // Camera stream starter
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isOpen && activeTab === 'scan_qr') {
      navigator.mediaDevices
        ?.getUserMedia({ video: { facingMode: 'environment' } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            setCameraActive(true);
          }
        })
        .catch(() => {
          setCameraActive(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleCopyRaast = () => {
    navigator.clipboard.writeText(user.raastId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyShareLink = () => {
    const link = `https://payflow.pk/pay?id=${encodeURIComponent(user.raastId)}&name=${encodeURIComponent(user.name)}${qrAmount ? `&amt=${qrAmount}` : ''}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `Aura_Craft_Labs_RAAST_QR${qrAmount ? `_${qrAmount}PKR` : ''}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleScanPreset = (preset: typeof merchantPresets[0]) => {
    setIsProcessingPay(true);

    setTimeout(() => {
      const newTxn: Transaction = {
        id: generateTxnId(),
        type: 'qr_pay',
        title: preset.name,
        subtitle: `${preset.bank} • SBP RAAST QR`,
        amount: preset.amount,
        timestamp: 'Just now',
        status: 'completed',
        recipient: {
          name: preset.name,
          accountNumber: preset.account,
          bankOrWallet: preset.bank,
          type: 'raast',
          avatarBg: '#059669',
          verified: true,
        },
        raastRef: generateRaastRef(),
        fee: 0.0,
        purpose: 'Merchant QR Purchase',
        category: 'QR Payment',
      };

      setIsProcessingPay(false);
      setSuccessTxn(newTxn);
      triggerPaymentCelebration();
      onCompleteQRPay(newTxn);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#0D1524] border border-slate-700 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-950/70 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">RAAST Dynamic QR</h3>
              <p className="text-xs text-slate-400">State Bank of Pakistan QR Standard</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-4 pt-3">
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                setActiveTab('my_qr');
                setSuccessTxn(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'my_qr'
                  ? 'bg-emerald-500 text-[#0A111E] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>My QR Code</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('scan_qr');
                setSuccessTxn(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'scan_qr'
                  ? 'bg-emerald-500 text-[#0A111E] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Scan className="w-4 h-4" />
              <span>Scan Merchant QR</span>
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {successTxn ? (
            /* Success Receipt */
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">QR Payment Successful!</h3>
              <p className="text-xs text-slate-300">
                Paid to <span className="text-emerald-400 font-bold">{successTxn.recipient.name}</span>
              </p>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                Amount Paid: <span className="font-bold text-emerald-400 font-mono-numbers">{formatPKR(successTxn.amount)}</span>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
              >
                Done / Back to Home
              </button>
            </div>
          ) : activeTab === 'my_qr' ? (
            /* TAB 1: MY QR CODE */
            <div className="text-center space-y-4">
              {/* QR Card Container */}
              <div className="p-5 bg-white rounded-2xl shadow-xl max-w-xs mx-auto text-slate-900 border-4 border-emerald-500 relative">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="text-left">
                    <h4 className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider">
                      PayFlow PK
                    </h4>
                    <p className="text-[10px] text-slate-500 font-semibold">SBP RAAST Payee</p>
                  </div>
                  <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-700" />
                    RAAST P2P
                  </span>
                </div>

                {/* Scannable High-DPI QR Visual */}
                <div className="p-3 flex items-center justify-center min-h-[190px]">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Aura Craft Labs Limited RAAST QR Code"
                      className="w-48 h-48 rounded-lg shadow-xs object-contain"
                    />
                  ) : (
                    <div className="w-48 h-48 bg-slate-100 rounded-lg flex items-center justify-center animate-pulse">
                      <QrCode className="w-12 h-12 text-slate-400" />
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <p className="text-sm font-extrabold text-slate-900 leading-tight">{user.name}</p>
                  <p className="text-xs font-mono-numbers text-slate-600 font-semibold mt-0.5">{user.raastId}</p>
                  {qrAmount && parseFloat(qrAmount) > 0 ? (
                    <p className="text-xs font-extrabold text-emerald-700 font-mono-numbers mt-1.5 bg-emerald-50 py-1 rounded">
                      Amount: Rs. {parseFloat(qrAmount).toLocaleString()}
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-500 mt-1 font-medium">
                      Accepts payments from all Pakistani banking apps
                    </p>
                  )}
                </div>
              </div>

              {/* Set Custom Amount input */}
              <div className="max-w-xs mx-auto">
                <label className="block text-xs font-semibold text-slate-400 mb-1 text-left">
                  Request Specific Amount (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                    Rs.
                  </span>
                  <input
                    type="number"
                    value={qrAmount}
                    onChange={(e) => setQrAmount(e.target.value)}
                    placeholder="Enter amount to embed in QR"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs font-mono-numbers text-white focus:border-emerald-500 focus:outline-none"
                  />
                  {qrAmount && (
                    <button
                      onClick={() => setQrAmount('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300 font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 max-w-xs mx-auto">
                <button
                  onClick={handleCopyRaast}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-700 active:scale-95 transition-all"
                >
                  {copiedId ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedId ? 'Copied ID' : 'Copy ID'}</span>
                </button>
                <button
                  onClick={handleCopyShareLink}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-700 active:scale-95 transition-all"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                  <span>{copiedLink ? 'Link Copied' : 'Share Link'}</span>
                </button>
                <button
                  onClick={handleDownloadQR}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Save QR</span>
                </button>
              </div>
            </div>
          ) : (
            /* TAB 2: SCAN MERCHANT QR */
            <div className="space-y-4">
              {/* Scanner Viewport */}
              <div className="relative w-full h-52 bg-slate-950 rounded-2xl overflow-hidden border-2 border-dashed border-emerald-500/60 flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                />

                {/* Animated Scanner Laser */}
                <div className="absolute inset-x-8 top-1/2 h-0.5 bg-emerald-400 shadow-md shadow-emerald-400 animate-pulse" />

                {!cameraActive && (
                  <div className="text-center p-4">
                    <Camera className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-400 font-medium">
                      Camera scanner active. You can also tap any sample merchant QR below to simulate an instant payment.
                    </p>
                  </div>
                )}
              </div>

              {/* Sample Merchant QRs to Test */}
              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-2">
                  Simulate Scan & Pay (Tested Pakistani Merchants):
                </span>
                <div className="space-y-2">
                  {merchantPresets.map((m, idx) => (
                    <button
                      key={idx}
                      disabled={isProcessingPay}
                      onClick={() => handleScanPreset(m)}
                      className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/80 text-left flex items-center justify-between group transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
                          {idx === 0 ? <Building2 className="w-4 h-4" /> : <Store className="w-4 h-4" />}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white group-hover:text-emerald-300">
                            {m.name}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-mono-numbers">
                            {m.bank} • {m.city}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-emerald-400 font-mono-numbers">
                          {formatPKR(m.amount)}
                        </span>
                        <span className="block text-[10px] font-semibold text-amber-400">
                          1-Tap Scan & Pay
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

