import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { Download, Eye, X } from 'lucide-react';

export default function MakePaymentsPage({ onPayNowClick }) {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState('All');
  const [historyPage, setHistoryPage] = useState(1);
  const itemsPerPage = 5;
  const [viewPdfUrl, setViewPdfUrl] = useState(null);

  useEffect(() => {
    fetchPendingInvoices();
  }, []);

  const fetchPendingInvoices = async () => {
    try {
      setLoading(true);
      const parentToken = localStorage.getItem('parentToken');
      if (!parentToken) return;

      const tokenPayload = JSON.parse(atob(parentToken.split('.')[1]));
      const studentId = tokenPayload.studentId;

      const [response, profileRes] = await Promise.all([
        axios.get(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/parentauth/fees?studentId=${studentId}`,
          { headers: { Authorization: `Bearer ${parentToken}` } }
        ),
        axios.get(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/parentauth/student-profile?studentId=${studentId}`,
          { headers: { Authorization: `Bearer ${parentToken}` } }
        ).catch(() => ({ data: { student: null } }))
      ]);

      if (profileRes.data && profileRes.data.student) {
        setStudentProfile(profileRes.data.student);
      }

      const allInvoices = response.data.feesOverview.allInvoices || [];
      const pendingInvoices = allInvoices.filter(inv => {
        if (!inv.status) return false;
        const s = inv.status.toLowerCase();
        return s === 'pending' || s === 'overdue' || s === 'unpaid';
      });

      setFees(pendingInvoices.map(inv => ({
        id: inv._id,
        type: inv.type,
        invoiceType: inv.invoiceType,
        dueDate: inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-GB') : 'N/A',
        amount: inv.amount,
        status: inv.status,
      })));

      const historyInvoices = allInvoices.filter(inv => {
        if (!inv.status) return false;
        return inv.status.toLowerCase() === 'paid';
      });
      setPaymentHistory(historyInvoices);

    } catch (err) {
      console.error('Error fetching pending invoices:', err);
      toast.error('Failed to load pending payments');
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async (fee) => {
    try {
      setPayingId(fee.id);
      const parentToken = localStorage.getItem('parentToken');
      const tokenPayload = JSON.parse(atob(parentToken.split('.')[1]));
      const studentId = tokenPayload.studentId;

      const orderRes = await axios.post(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/parentauth/create-razorpay-order`,
        {
          amount: fee.amount,
          studentId: studentId,
          invoiceId: fee.id
        },
        {
          headers: { Authorization: `Bearer ${parentToken}` }
        }
      );

      const order = orderRes.data;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_your_id',
        amount: order.amount,
        currency: order.currency,
        name: "KGF Hostel Management",
        description: `Payment for ${fee.type}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            const verifyRes = await axios.post(
              `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/parentauth/verify-razorpay-payment`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                invoiceId: fee.id
              },
              {
                headers: { Authorization: `Bearer ${parentToken}` }
              }
            );

            if (verifyRes.data.success) {
              toast.success('Payment successful!');
              fetchPendingInvoices();
            }
          } catch (err) {
            console.error('Payment verification failed:', err);
            toast.error('Payment verification failed. Please contact admin.');
          }
        },
        prefill: {
          name: localStorage.getItem('parentName') || '',
          email: '',
          contact: ''
        },
        theme: {
          color: "#4F8DCF"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error('Error initiating payment:', err);
      toast.error('Failed to initiate payment');
    } finally {
      setPayingId(null);
    }
  };

  const uniqueHistoryFeeTypes = ["All", ...new Set(paymentHistory.map(f => f.type))];
  const filteredHistoryFees = paymentHistory.filter(fee => {
    const matchesSearch = fee.type?.toLowerCase().includes(historySearch.toLowerCase());
    const matchesFilter = historyFilter === 'All' || fee.type === historyFilter;
    return matchesSearch && matchesFilter;
  });
  const paginatedHistoryFees = filteredHistoryFees.slice((historyPage - 1) * itemsPerPage, historyPage * itemsPerPage);
  const historyTotalPages = Math.ceil(filteredHistoryFees.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4F8CCF]"></div>
      </div>
    );
  }

  const downloadReceipt = async (row, action = 'download') => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    // ── Background ──────────────────────────────────────────────────
    doc.setFillColor(245, 247, 250);
    doc.rect(0, 0, pageW, pageH, 'F');

    // ── Header Banner ────────────────────────────────────────────────
    doc.setFillColor(170, 180, 145); // #AAB491 Website Primary Color
    doc.rect(0, 0, pageW, 90, 'F');

    // Add Logo
    try {
      const img = new window.Image();
      img.src = '/parent/logo2.png';
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error("Image failed to load"));
      });
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL('image/png');
      doc.addImage(dataUrl, 'PNG', 40, 15, 60, 60);
    } catch (err) {
      console.warn("Logo not loaded", err);
    }

    const isPaid = row.status?.toLowerCase() === 'paid';

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(30, 40, 60); // Dark text for light banner
    doc.text('KGF Boys Hostel', pageW / 2, 32, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(40, 50, 70);
    doc.text('Kokan Global Foundation', pageW / 2, 50, { align: 'center' });

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(11);
    doc.setTextColor(40, 50, 70);
    doc.text(isPaid ? 'Official Payment Receipt' : 'Official Invoice', pageW / 2, 68, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('KGF Hostel, Ground Floor, Admin Block', pageW / 2, 82, { align: 'center' });

    // ── Receipt Status Badge ─────────────────────────────────────────
    if (isPaid) {
      doc.setFillColor(34, 197, 94);
      doc.roundedRect(pageW / 2 - 55, 100, 110, 28, 6, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text('PAID', pageW / 2, 119, { align: 'center' });
    } else {
      doc.setFillColor(239, 68, 68);
      doc.roundedRect(pageW / 2 - 55, 100, 110, 28, 6, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text('UNPAID', pageW / 2, 119, { align: 'center' });
    }

    // ── Receipt Info Box ─────────────────────────────────────────────
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(40, 145, pageW - 80, 78, 8, 8, 'F');
    doc.setDrawColor(170, 180, 145); // #AAB491
    doc.setLineWidth(1);
    doc.roundedRect(40, 145, pageW - 80, 78, 8, 8, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(130, 140, 160);
    doc.text(isPaid ? 'RECEIPT NUMBER' : 'INVOICE NUMBER', 60, 163);
    doc.text('DATE ISSUED', pageW / 2 + 10, 163);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 40, 60);

    const pDateObj = new Date(row.paidDate || row.dueDate || Date.now());
    const y = pDateObj.getFullYear();
    const m = String(pDateObj.getMonth() + 1).padStart(2, '0');
    const day = String(pDateObj.getDate()).padStart(2, '0');
    const h = String(pDateObj.getHours()).padStart(2, '0');
    const min = String(pDateObj.getMinutes()).padStart(2, '0');
    const sec = String(pDateObj.getSeconds()).padStart(2, '0');
    const t = `${h}${min}${sec}`;
    const customInvoiceNum = `INV-KGF-${y}-${m}-${day}-${t}`;

    const dateIssuedObj = new Date(studentProfile?.admissionDate || studentProfile?.createdAt || row.dueDate || Date.now());

    doc.text(customInvoiceNum, 60, 181);
    doc.text(dateIssuedObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }), pageW / 2 + 10, 181);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(130, 140, 160);
    doc.text(isPaid ? 'PAYMENT DATE' : 'DUE DATE', 60, 205);
    if (isPaid) doc.text('PAYMENT METHOD', pageW / 2 + 10, 205);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 40, 60);
    
    if (isPaid) {
      doc.text(pDateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }), 60, 218);
      doc.text('Online Payment', pageW / 2 + 10, 218);
    } else {
      const dDate = new Date(row.dueDate || Date.now());
      doc.text(dDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }), 60, 218);
    }

    // ── Payment Details Box ──────────────────────────────────────────
    const isSecurityDeposit = row.invoiceType === 'security_deposit' || row.feeType?.toLowerCase().includes('security') || row.type?.toLowerCase().includes('security');
    const totalAmount = row.amount || 0;
    const monthlyBase = Math.round(totalAmount / 3);

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(40, 240, pageW - 80, 200, 8, 8, 'F');
    doc.setDrawColor(170, 180, 145);
    doc.roundedRect(40, 240, pageW - 80, 200, 8, 8, 'S');

    doc.setFillColor(245, 247, 242);
    doc.roundedRect(41, 241, pageW - 82, 30, 8, 8, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(100, 110, 130);
    doc.text('DESCRIPTION', 60, 260);
    doc.text('AMOUNT', pageW - 60, 260, { align: 'right' });

    doc.setDrawColor(230, 235, 240);
    doc.line(40, 271, pageW - 40, 271);

    let startY = 300;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 40, 60);
    doc.text(row.feeType || row.type || 'Hostel Fee', 60, startY);
    doc.text(`Rs. ${totalAmount.toLocaleString('en-IN')}`, pageW - 60, startY, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 110, 130);

    if (isSecurityDeposit) {
      doc.text(`One-Time Refundable Payment`, 60, startY + 15);
      doc.text(`Formula: Rs. ${monthlyBase.toLocaleString('en-IN')} (monthly base) × 3 months`, 60, startY + 30);
    } else {
      const baseDate = new Date(studentProfile?.admissionDate || studentProfile?.createdAt || row.paidDate || row.dueDate || Date.now());
      const m1Start = new Date(baseDate);
      const m1End = new Date(baseDate); m1End.setMonth(m1End.getMonth() + 1); m1End.setDate(m1End.getDate() - 1);
      const m2Start = new Date(baseDate); m2Start.setMonth(m2Start.getMonth() + 1);
      const m2End = new Date(baseDate); m2End.setMonth(m2End.getMonth() + 2); m2End.setDate(m2End.getDate() - 1);
      const m3Start = new Date(baseDate); m3Start.setMonth(m3Start.getMonth() + 2);
      const m3End = new Date(baseDate); m3End.setMonth(m3End.getMonth() + 3); m3End.setDate(m3End.getDate() - 1);

      const f = (d) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

      doc.text(`Quarterly Cycle (3 Months) Breakdown:`, 60, startY + 15);
      doc.text(`• Month 1 (${f(m1Start)} - ${f(m1End)}): Rs. ${monthlyBase.toLocaleString('en-IN')}`, 60, startY + 30);
      doc.text(`• Month 2 (${f(m2Start)} - ${f(m2End)}): Rs. ${monthlyBase.toLocaleString('en-IN')}`, 60, startY + 45);
      doc.text(`• Month 3 (${f(m3Start)} - ${f(m3End)}): Rs. ${monthlyBase.toLocaleString('en-IN')}`, 60, startY + 60);
    }

    startY += 85;

    // Removed parent notes from description
    doc.text(`UTR / Ref: ${row.transactionId || row.utr || row.razorpayPaymentId || (row._id ? 'TRX-' + row._id.substring(0,8).toUpperCase() : '-')}`, 60, startY);

    startY += 20;

    doc.setDrawColor(220, 225, 235);
    doc.line(40, startY, pageW - 40, startY);

    startY += 25;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(30, 40, 60);
    doc.text(isPaid ? 'TOTAL PAID' : 'TOTAL PAYABLE', 60, startY);

    doc.setTextColor(110, 120, 90); // darker green from #AAB491
    doc.text(`Rs. ${totalAmount.toLocaleString('en-IN')}`, pageW - 60, startY, { align: 'right' });

    // ── Footer ───────────────────────────────────────────────────────
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(150, 160, 175);
    doc.text('This is a computer generated receipt and does not require a physical signature.', pageW / 2, startY + 60, { align: 'center' });
    doc.text('Thank you for choosing KGF Hostel.', pageW / 2, startY + 75, { align: 'center' });

    // Save PDF
    if (action === 'view') {
      const pdfBlob = doc.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      setViewPdfUrl(blobUrl);
    } else {
      doc.save(`Receipt_${row.feeType || row.type || 'Payment'}_${row._id?.slice(-6).toUpperCase() || 'XXX'}.pdf`);
    }
  };

  return (
    <div className="bg-[#ffffff] px-6 sm:px-8 lg:px-2.5 py-2 min-h-screen font-sans pb-10">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto space-y-6 mt-4">
        <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-black border-l-4 border-[#4F8CCF] pl-2">
          Make Payments
        </h2>

        <div className="bg-white rounded-lg shadow-[0_4px_15px_rgba(0,0,0,0.2)] focus:outline-none w-full">
          <div className="bg-[#AAB491] px-6 py-3 rounded-t-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-lg font-semibold text-black">Pending Payments</h2>
          </div>
          <div className="p-5 sm:p-8">
            <div className="overflow-x-auto">
              {fees.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500 font-semibold text-lg">No pending payments found. You are all caught up!</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left p-4 font-bold text-gray-600">Fee Type</th>
                      <th className="text-left p-4 font-bold text-gray-600">Due Date</th>
                      <th className="text-left p-4 font-bold text-gray-600">Amount (₹)</th>
                      <th className="text-left p-4 font-bold text-gray-600">Status</th>
                      <th className="text-left p-4 font-bold text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fees.map((fee, idx) => (
                      <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 text-gray-700">{fee.type}</td>
                        <td className="p-4 text-gray-700 font-medium">{fee.dueDate}</td>
                        <td className="p-4 text-gray-900 font-bold">₹{fee.amount?.toLocaleString('en-IN')}</td>
                        <td className="p-4">
                          <span className={`${fee.status === 'Overdue' ? 'bg-red-100 text-red-700' : fee.status === 'Pending Verification' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'} px-3 py-1 rounded-full text-xs font-bold uppercase`}>
                            {fee.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => downloadReceipt(fee, 'view')}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-3 py-1.5 rounded-md text-sm shadow transition-colors flex items-center"
                              title="View Details"
                            >
                              <Eye size={16} className="mr-1" /> View
                            </button>
                            <button 
                              onClick={() => {
                                if (onPayNowClick) onPayNowClick(fee);
                                else handlePayNow(fee);
                              }}
                              disabled={payingId === fee.id || fee.status === 'Pending Verification'}
                              className="bg-[#4F8DCF] hover:bg-[#3e72a8] text-white font-semibold px-4 py-1.5 rounded-md text-sm shadow disabled:opacity-50"
                            >
                              {payingId === fee.id ? 'Processing...' : fee.status === 'Pending Verification' ? 'Verifying...' : 'Pay Now'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

      {/* Payment History Table */}
      <div className="bg-white rounded-lg shadow-[0_4px_15px_rgba(0,0,0,0.2)] focus:outline-none w-full overflow-hidden mt-6">
        <div className="bg-[#AAB491] px-6 py-3 rounded-t-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 className="text-lg font-semibold text-black">Payment History</h2>
          <div className="flex gap-3 w-full sm:w-auto">
            <input 
              type="text" 
              placeholder="Search history..." 
              className="px-3 py-1.5 rounded-md border border-gray-300 text-sm w-full sm:w-48 focus:outline-none focus:border-[#8b9674] text-black"
              value={historySearch}
              onChange={(e) => { setHistorySearch(e.target.value); setHistoryPage(1); }}
            />
            <select 
              className="px-3 py-1.5 rounded-md border border-gray-300 text-sm focus:outline-none focus:border-[#8b9674] text-black"
              value={historyFilter}
              onChange={(e) => { setHistoryFilter(e.target.value); setHistoryPage(1); }}
            >
              {uniqueHistoryFeeTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'All' ? 'All Fee Types' : type}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="p-5 sm:p-8">
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left p-4 font-bold text-gray-600">Date</th>
                  <th className="text-left p-4 font-bold text-gray-600">Fee Type</th>
                  <th className="text-left p-4 font-bold text-gray-600">Amount (₹)</th>
                  <th className="text-left p-4 font-bold text-gray-600">Reference</th>
                  <th className="text-left p-4 font-bold text-gray-600">Status</th>
                  <th className="text-left p-4 font-bold text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center p-10 text-gray-400">No payment records found</td>
                  </tr>
                ) : paginatedHistoryFees.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center p-10 text-gray-500">No matching history found</td>
                  </tr>
                ) : (
                  paginatedHistoryFees.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 text-gray-700 font-medium">
                        {new Date(item.updatedAt || item.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </td>
                      <td className="p-4 text-gray-700">{item.type || item.invoiceType || 'Hostel Fee'}</td>
                      <td className="p-4 text-gray-900 font-bold">₹{item.amount?.toLocaleString('en-IN')}</td>
                      <td className="p-4 text-gray-500 text-sm">{item.transactionId || item.utr || item.razorpayPaymentId || (item._id ? `TRX-${item._id.substring(0, 8).toUpperCase()}` : '-')}</td>
                      <td className="p-4">
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                          Paid
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => downloadReceipt(item, 'view')}
                            className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md px-3 py-1.5 transition-colors text-sm"
                            title="View Invoice"
                          >
                            <Eye size={16} className="mr-1" /> View
                          </button>
                          <button
                            onClick={() => downloadReceipt(item)}
                            className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md px-3 py-1.5 transition-colors text-sm"
                            title="Download Receipt"
                          >
                            <Download size={16} className="mr-1" /> Receipt
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="sm:hidden space-y-4">
            {paymentHistory.length === 0 ? (
              <div className="text-center p-8 text-gray-400 bg-gray-50 rounded-lg">No payment records found</div>
            ) : paginatedHistoryFees.length === 0 ? (
              <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-lg">No matching history found</div>
            ) : (
              paginatedHistoryFees.map((item, idx) => (
                <div key={idx} className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-gray-800">{item.type || item.invoiceType || 'Hostel Fee'}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(item.updatedAt || item.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </p>
                    </div>
                    <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">
                      Paid
                    </span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-50 space-y-3">
                    <div className="text-xs text-gray-500 flex justify-between items-center">
                      <span>Ref: {item.transactionId || item.utr || item.razorpayPaymentId || (item._id ? `TRX-${item._id.substring(0, 8).toUpperCase()}` : '-')}</span>
                      <span className="text-lg font-bold text-gray-900">₹{item.amount?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => downloadReceipt(item, 'view')}
                        className="flex-1 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md py-2 transition-colors text-sm font-medium"
                      >
                        <Eye size={16} className="mr-1" /> View
                      </button>
                      <button
                        onClick={() => downloadReceipt(item)}
                        className="flex-1 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md py-2 transition-colors text-sm font-medium"
                      >
                        <Download size={16} className="mr-1" /> Receipt
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {historyTotalPages > 1 && (
            <div className="flex justify-end items-center space-x-2 mt-6 pt-6 border-t border-gray-100">
              <button 
                onClick={() => setHistoryPage(p => Math.max(1, p - 1))} 
                disabled={historyPage === 1}
                className="px-3 py-1 rounded bg-gray-100 text-gray-600 disabled:opacity-50 hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Prev
              </button>
              <span className="text-sm text-gray-600 font-medium">
                Page {historyPage} of {historyTotalPages}
              </span>
              <button 
                onClick={() => setHistoryPage(p => Math.min(historyTotalPages, p + 1))} 
                disabled={historyPage === historyTotalPages}
                className="px-3 py-1 rounded bg-gray-100 text-gray-600 disabled:opacity-50 hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
      {viewPdfUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col relative">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-bold">Document Viewer</h2>
              <button onClick={() => { URL.revokeObjectURL(viewPdfUrl); setViewPdfUrl(null); }} className="text-gray-500 hover:text-red-500">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 w-full bg-gray-100 relative">
               <iframe src={viewPdfUrl} className="w-full h-full border-none" title="PDF Viewer" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}