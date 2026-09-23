import React from 'react';
import jsPDF from 'jspdf';

const PaymentReceiptModal = ({ isOpen, onClose, receipt, onGoToDashboard }) => {
  if (!isOpen || !receipt) return null;

  const downloadPDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(44, 24, 16);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('KaboDitsha', 105, 18, { align: 'center' });
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Proof of Payment', 105, 28, { align: 'center' });

    // Body
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Receipt', 20, 55);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    const lines = [
      ['Application Number:', receipt.applicationNumber || 'Pending'],
      ['Land Board:', receipt.landBoard || 'N/A'],
      ['Settlement Type:', receipt.settlementType || 'N/A'],
      ['Purpose:', receipt.purpose || 'N/A'],
      ['', ''],
      ['Amount Paid:', `P${receipt.amount}.00 ${receipt.currency}`],
      ['Payment Date:', new Date(receipt.paymentDate).toLocaleString()],
      ['Payment Reference:', receipt.paymentIntentId || 'N/A'],
      ['Status:', 'PAID'],
    ];

    let y = 70;
    lines.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 20, y);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 80, y);
      y += 10;
    });

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text('This is a system-generated receipt. No signature required.', 105, 280, { align: 'center' });
    doc.text('KaboDitsha - Digitizing Land Allocation in Botswana', 105, 287, { align: 'center' });

    doc.save(`POP_${receipt.applicationNumber || 'KaboDitsha'}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-4xl">✓</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Payment Successful!</h2>
          <p className="text-white/90 text-sm mt-1">Your application has been submitted</p>
        </div>

        {/* Receipt Details */}
        <div className="p-6 space-y-3">
          <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Application Number</span>
              <span className="font-bold text-[#2C1810]">{receipt.applicationNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Amount Paid</span>
              <span className="font-bold text-green-600">P{receipt.amount}.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment Date</span>
              <span className="font-medium">{new Date(receipt.paymentDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Land Board</span>
              <span className="font-medium">{receipt.landBoard}</span>
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Save this receipt for your records. You can download a PDF copy below.
          </p>

          {/* Actions */}
          <button
            onClick={downloadPDF}
            className="w-full bg-[#2C1810] text-white py-3 rounded-lg font-semibold hover:bg-[#3A241C] transition-colors flex items-center justify-center gap-2"
          >
            📄 Download Proof of Payment (PDF)
          </button>

          <button
            onClick={onGoToDashboard}
            className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentReceiptModal;