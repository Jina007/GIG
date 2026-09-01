import React, { useEffect } from 'react';
import { Invoice } from '../../types';
import { ShieldCheck, Printer, CheckCircle2, X, Landmark } from 'lucide-react';

interface InvoiceModalProps {
  isOpen?: boolean;
  invoice: Invoice | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen = true,
  invoice,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Top Control Bar */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">Official Cooperative Digital Invoice</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Close invoice"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Document Body */}
        <div id="printable-invoice" className="p-8 space-y-6 text-slate-900 bg-white">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b-2 border-slate-200 gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-700 font-black text-xl">
                <ShieldCheck className="w-7 h-7" />
                <span>{invoice.worker_cooperative_name || 'Coimbatore Labour Cooperative Society'}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Registered under Tamil Nadu Cooperative Societies Act (Reg No: TN-CBE-LCS-1994)
              </p>
              <p className="text-xs text-slate-500">
                GSTIN: 33AAAAA0000A1Z5 • State Labour Welfare Fund Affiliated
              </p>
            </div>
            <div className="text-left sm:text-right font-mono text-xs">
              <div className="text-slate-400 font-bold">INVOICE NO:</div>
              <div className="text-slate-900 font-extrabold text-sm sm:text-base">
                {invoice.invoice_no}
              </div>
              <div className="text-slate-500 mt-1">
                Date: {new Date(invoice.issued_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Billed To / Service By */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs pb-4 border-b border-slate-200">
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Customer Details</span>
              <div className="font-extrabold text-sm text-slate-900">{invoice.customer_name}</div>
              <div className="text-slate-600">{invoice.customer_phone || '+91 98421 77301'}</div>
              <div className="text-slate-600">{invoice.customer_address || 'Peelamedu, Coimbatore'}</div>
            </div>
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Assigned Cooperative Worker</span>
              <div className="font-extrabold text-sm text-slate-900">{invoice.worker_name}</div>
              <div className="text-emerald-700 font-semibold">{invoice.worker_cooperative_name}</div>
              <div className="text-slate-500">Service Category: {invoice.service_name}</div>
            </div>
          </div>

          {/* Line Items Breakdown */}
          <div>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 text-slate-500 font-bold uppercase">
                  <th className="py-2.5">Service Description</th>
                  <th className="py-2.5 text-right">Direct Worker (88%)</th>
                  <th className="py-2.5 text-right">Coop Fund (7%)</th>
                  <th className="py-2.5 text-right">Platform (5%)</th>
                  <th className="py-2.5 text-right">Base Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3">
                    <div className="font-bold text-slate-900">{invoice.service_name}</div>
                    <div className="text-[11px] text-slate-400">
                      {invoice.is_emergency ? '⚡ Rapid Emergency Service Surcharge Included' : 'Standard Cooperative Home Service'}
                    </div>
                  </td>
                  <td className="py-3 text-right font-mono font-bold text-emerald-700">
                    ₹{Math.round(invoice.base_amount * 0.88)}
                  </td>
                  <td className="py-3 text-right font-mono text-slate-600">
                    ₹{invoice.cooperative_fee}
                  </td>
                  <td className="py-3 text-right font-mono text-slate-600">
                    ₹{invoice.platform_fee}
                  </td>
                  <td className="py-3 text-right font-mono font-bold text-slate-900">
                    ₹{invoice.base_amount}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Fair Pay Transparency Note */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Cooperative Fair Pay Guarantee:</strong> Exactly 88% of this bill goes directly to {invoice.worker_name}. 7% is allocated to the Worker Social Security & Medical Welfare Fund.
            </span>
          </div>

          {/* Totals Summary */}
          <div className="flex justify-end pt-2">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Base Service Amount:</span>
                <span className="font-semibold">₹{invoice.base_amount}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>GST (18% Included):</span>
                <span className="font-semibold">₹{invoice.taxes}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t-2 border-slate-300">
                <span>Total Amount Paid:</span>
                <span className="text-emerald-700 font-black text-base">₹{invoice.total_amount}</span>
              </div>
            </div>
          </div>

          {/* Payment Method & QR Placeholder */}
          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-950">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold block">Digital Payment Settled via UPI Sandbox</span>
                <span className="text-[11px] text-emerald-800">
                  Ref: {invoice.transaction_id || 'TXN-UPI-9948201'}
                </span>
              </div>
            </div>
            <div className="text-right text-[10px] text-emerald-800 font-mono">
              VERIFIED COOP TXN
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Official Cooperative Digital Bill
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-extrabold transition-colors active:scale-95 shadow-2xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
