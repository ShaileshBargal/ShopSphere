import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  CreditCard,
  Building2,
  Zap,
  Loader2,
  Lock,
} from 'lucide-react';

const RazorpayModal = ({
  isOpen,
  onClose,
  amount,
  orderId,
  onSuccess,
  customerName = 'Customer',
  customerPhone = '',
}) => {
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [processing, setProcessing] = useState(false);
  const [processingMsg, setProcessingMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [activeUpiApp, setActiveUpiApp] = useState(null);

  if (!isOpen) return null;

  const handleSimulateUpiPay = (appName = 'UPI') => {
    setActiveUpiApp(appName);
    setProcessing(true);
    setProcessingMsg(`Connecting to ${appName} (Bypassing Scanner)...`);

    setTimeout(() => {
      setProcessingMsg(`Simulating approval from ${appName}...`);
    }, 600);

    setTimeout(() => {
      setProcessingMsg('Verifying with Razorpay Test Gateway...');
    }, 1100);

    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      setTimeout(() => {
        onSuccess({
          razorpay_payment_id: `pay_test_${Math.random().toString(36).substring(2, 10)}${Date.now().toString().slice(-4)}`,
          razorpay_order_id: `order_${Math.random().toString(36).substring(2, 10)}`,
          razorpay_signature: 'simulated_test_signature',
          method: `UPI (${appName})`,
        });
      }, 700);
    }, 1600);
  };

  const handleSimulateCardPay = () => {
    setProcessing(true);
    setProcessingMsg('Authorizing test card payment...');

    setTimeout(() => {
      setProcessingMsg('Card payment auto-approved (No OTP required)...');
    }, 700);

    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      setTimeout(() => {
        onSuccess({
          razorpay_payment_id: `pay_card_${Date.now()}`,
          razorpay_order_id: `order_${Date.now()}`,
          razorpay_signature: 'simulated_test_signature',
          method: 'Card',
        });
      }, 700);
    }, 1400);
  };

  const handleSimulateNetbankingPay = (bankName) => {
    setProcessing(true);
    setProcessingMsg(`Connecting to ${bankName} netbanking simulator...`);

    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      setTimeout(() => {
        onSuccess({
          razorpay_payment_id: `pay_nb_${Date.now()}`,
          razorpay_order_id: `order_${Date.now()}`,
          razorpay_signature: 'simulated_test_signature',
          method: `Netbanking (${bankName})`,
        });
      }, 700);
    }, 1200);
  };

  const upiApps = [
    {
      id: 'gpay',
      name: 'Google Pay',
      tag: 'Auto-Pay',
      color: 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200',
      badgeColor: 'bg-blue-100 text-blue-800',
      iconText: 'GPay',
      iconBg: 'bg-blue-600 text-white',
    },
    {
      id: 'phonepe',
      name: 'PhonePe',
      tag: 'Auto-Pay',
      color: 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200',
      badgeColor: 'bg-purple-100 text-purple-800',
      iconText: 'पे',
      iconBg: 'bg-purple-700 text-white',
    },
    {
      id: 'paytm',
      name: 'Paytm UPI',
      tag: 'Auto-Pay',
      color: 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200',
      badgeColor: 'bg-sky-100 text-sky-800',
      iconText: 'Paytm',
      iconBg: 'bg-sky-500 text-white',
    },
    {
      id: 'bhim',
      name: 'BHIM / Any UPI',
      tag: 'Auto-Pay',
      color: 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      iconText: 'UPI',
      iconBg: 'bg-emerald-600 text-white',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Header styled like Razorpay Checkout */}
        <div className="bg-[#0c2340] text-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center font-black text-white text-base shadow-sm">
                R
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold tracking-tight text-sm text-white">
                    Razorpay
                  </span>
                  <span className="text-[9px] font-bold uppercase bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-mono">
                    TEST MODE
                  </span>
                </div>
                <p className="text-[11px] text-blue-200 font-medium">ShopSphere Store</p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={processing || success}
              className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-40"
              title="Close payment window"
            >
              <X size={18} />
            </button>
          </div>

          {/* Amount Badge */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-baseline justify-between">
            <span className="text-xs text-blue-200">Total Payable Amount</span>
            <span className="text-2xl font-black text-white tracking-tight">
              ₹{Number(amount).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Processing / Success State Overlay */}
        {processing && (
          <div className="p-8 text-center space-y-4 bg-slate-50 min-h-[300px] flex flex-col items-center justify-center">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-blue-100 animate-pulse" />
              <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">{processingMsg}</h4>
              <p className="text-[11px] text-slate-500">
                ⚡ Scanner bypassed: auto-completing test payment...
              </p>
            </div>
          </div>
        )}

        {success && (
          <div className="p-8 text-center space-y-4 bg-emerald-50 min-h-[300px] flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 animate-in zoom-in-75">
              <CheckCircle2 size={36} />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-extrabold text-emerald-950">
                Payment Successful!
              </h4>
              <p className="text-xs text-emerald-700">
                ₹{Number(amount).toFixed(2)} authorized via Razorpay. Confirming order...
              </p>
            </div>
          </div>
        )}

        {/* Main Selection Body */}
        {!processing && !success && (
          <div>
            {/* Method Tab Selector */}
            <div className="flex border-b border-slate-200 bg-slate-50/70 text-xs font-bold text-slate-600">
              <button
                type="button"
                onClick={() => setSelectedMethod('upi')}
                className={`flex-1 py-3 px-3 flex items-center justify-center space-x-1.5 transition-colors border-b-2 ${
                  selectedMethod === 'upi'
                    ? 'border-blue-600 text-blue-600 bg-white'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                <Smartphone size={14} />
                <span>UPI (No Scan)</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod('cards')}
                className={`flex-1 py-3 px-3 flex items-center justify-center space-x-1.5 transition-colors border-b-2 ${
                  selectedMethod === 'cards'
                    ? 'border-blue-600 text-blue-600 bg-white'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                <CreditCard size={14} />
                <span>Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod('netbanking')}
                className={`flex-1 py-3 px-3 flex items-center justify-center space-x-1.5 transition-colors border-b-2 ${
                  selectedMethod === 'netbanking'
                    ? 'border-blue-600 text-blue-600 bg-white'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                <Building2 size={14} />
                <span>Netbanking</span>
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="p-5 space-y-4">
              {/* 1. UPI TAB */}
              {selectedMethod === 'upi' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">
                      Select UPI App to Auto-Pay:
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center space-x-1">
                      <Zap size={10} />
                      <span>Scanner Disabled</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {upiApps.map((app) => (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => handleSimulateUpiPay(app.name)}
                        className="p-3 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 text-left transition-all group flex flex-col justify-between h-20 shadow-sm"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span
                            className={`w-7 h-7 rounded-lg ${app.iconBg} font-black text-[10px] flex items-center justify-center`}
                          >
                            {app.iconText}
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                            1-Click
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                            {app.name}
                          </p>
                          <p className="text-[10px] text-slate-400">Click to Pay</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Instant 1-Click UPI Quick Button */}
                  <button
                    type="button"
                    onClick={() => handleSimulateUpiPay('Instant UPI')}
                    className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.01]"
                  >
                    <Zap size={14} />
                    <span>Pay ₹{Number(amount).toFixed(2)} via Any UPI (Instant)</span>
                  </button>

                  <p className="text-[11px] text-center text-slate-400">
                    💡 Clicking any UPI option above skips the QR code and completes payment automatically.
                  </p>
                </div>
              )}

              {/* 2. CARDS TAB */}
              {selectedMethod === 'cards' && (
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center text-slate-700 font-semibold">
                      <span>Simulated Test Card</span>
                      <span className="text-[10px] font-mono font-bold bg-slate-200 px-1.5 py-0.5 rounded">
                        VISA
                      </span>
                    </div>
                    <p className="font-mono text-slate-900 font-bold tracking-wider">
                      •••• •••• •••• 4111
                    </p>
                    <p className="text-[11px] text-slate-400">
                      No card numbers, expiry, or OTP required in this mode.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSimulateCardPay}
                    className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 shadow transition-all"
                  >
                    <span>Pay ₹{Number(amount).toFixed(2)} with Test Card</span>
                  </button>
                </div>
              )}

              {/* 3. NETBANKING TAB */}
              {selectedMethod === 'netbanking' && (
                <div className="space-y-2.5 text-xs">
                  <p className="font-bold text-slate-800">Select Bank for Test Payment:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank'].map(
                      (bank) => (
                        <button
                          key={bank}
                          type="button"
                          onClick={() => handleSimulateNetbankingPay(bank)}
                          className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 text-left font-semibold text-slate-800 transition-colors flex items-center space-x-2"
                        >
                          <Building2 size={13} className="text-blue-600 flex-shrink-0" />
                          <span className="truncate">{bank}</span>
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-center space-x-1.5 text-[11px] text-slate-400">
              <ShieldCheck size={13} className="text-emerald-600" />
              <span>Razorpay Verified Sandbox • No real money deducted</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RazorpayModal;
