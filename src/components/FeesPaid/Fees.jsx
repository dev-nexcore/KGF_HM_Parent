import React, { useState, useEffect } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";

const statusColors = {
  Paid: "bg-green-500 text-white",
  Pending: "bg-yellow-400 text-white",
  Completed: "bg-green-500 text-white",
  Overdue: "bg-red-500 text-white",
};

export default function FeesSection() {
  const [feesData, setFeesData] = useState([]);
  const [transactionData, setTransactionData] = useState([]);
  const [studentInfo, setStudentInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeesData = async () => {
      try {
        setLoading(true);
        const parentToken = localStorage.getItem('parentToken');
        if (!parentToken) throw new Error('Parent token not found');

        const tokenPayload = JSON.parse(atob(parentToken.split('.')[1]));
        const studentId = tokenPayload.studentId;

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/parentauth/fees?studentId=${studentId}`,
          {
            headers: {
              Authorization: `Bearer ${parentToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const data = response.data.feesOverview;

        // Store student info for receipts
        setStudentInfo({
          name: `${response.data.firstName || ''} ${response.data.lastName || ''}`.trim(),
          studentId: response.data.studentId || studentId,
        });

        // Map invoices to feesData format
        const formattedFees = (data.allInvoices || []).map(inv => ({
          id: inv._id,
          invoiceNumber: inv.invoiceNumber,
          type: inv.type,
          amount: inv.amount,
          amountDisplay: `₹ ${inv.amount.toLocaleString()}`,
          due: inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-GB') : 'N/A',
          paid: inv.paidDate ? new Date(inv.paidDate).toLocaleDateString('en-GB') : 'N/A',
          status: inv.status,
          method: inv.method || 'N/A',
        }));

        // Map payment history to transactionData format
        const formattedTransactions = (data.paymentHistory || []).map(txn => ({
          id: txn.invoiceNumber || txn._id,
          date: txn.date ? new Date(txn.date).toLocaleDateString('en-GB') : 'N/A',
          amount: `₹ ${txn.amount.toLocaleString()}`,
          method: txn.method,
          status: txn.status,
        }));

        setFeesData(formattedFees);
        setTransactionData(formattedTransactions);

      } catch (err) {
        console.error('Error fetching fees:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeesData();
  }, []);

  const downloadReceipt = (row) => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    // ── Background ──────────────────────────────────────────────────
    doc.setFillColor(245, 247, 250);
    doc.rect(0, 0, pageW, pageH, 'F');

    // ── Header Banner ────────────────────────────────────────────────
    doc.setFillColor(79, 141, 207);
    doc.rect(0, 0, pageW, 90, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text('KGF HOSTEL MANAGEMENT', pageW / 2, 36, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('Official Payment Receipt', pageW / 2, 58, { align: 'center' });

    doc.setFontSize(9);
    doc.text('KGF Hostel, Ground Floor, Admin Block | kgfhostel@sbi', pageW / 2, 75, { align: 'center' });

    // ── Receipt Status Badge ─────────────────────────────────────────
    const isPaid = row.status === 'Paid' || row.status === 'paid';
    doc.setFillColor(isPaid ? 34 : 255, isPaid ? 197 : 165, isPaid ? 94 : 0);
    doc.roundedRect(pageW / 2 - 55, 100, 110, 28, 6, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text(isPaid ? '✓  PAID' : '⚠  PENDING', pageW / 2, 119, { align: 'center' });

    // ── Receipt Info Box ─────────────────────────────────────────────
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(40, 145, pageW - 80, 78, 8, 8, 'F');
    doc.setDrawColor(220, 225, 235);
    doc.setLineWidth(0.5);
    doc.roundedRect(40, 145, pageW - 80, 78, 8, 8, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(130, 140, 160);
    doc.text('RECEIPT NUMBER', 60, 163);
    doc.text('DATE ISSUED', pageW / 2 + 10, 163);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 40, 60);
    doc.text(row.invoiceNumber || `RCP-${row.id?.slice(-6).toUpperCase()}`, 60, 181);
    doc.text(new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }), pageW / 2 + 10, 181);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(130, 140, 160);
    doc.text('PAYMENT DATE', 60, 205);
    doc.text('PAYMENT METHOD', pageW / 2 + 10, 205);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 40, 60);
    doc.text(row.paid !== 'N/A' ? row.paid : '—', 60, 221);
    doc.text(row.method || 'Online / QR Code', pageW / 2 + 10, 221);

    // ── Student Info ─────────────────────────────────────────────────
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(40, 240, pageW - 80, 70, 8, 8, 'F');
    doc.setDrawColor(220, 225, 235);
    doc.roundedRect(40, 240, pageW - 80, 70, 8, 8, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(79, 141, 207);
    doc.text('STUDENT INFORMATION', 60, 258);

    doc.setFontSize(10);
    doc.setTextColor(30, 40, 60);
    doc.text(`Name: ${studentInfo.name || 'N/A'}`, 60, 275);
    doc.text(`Student ID: ${studentInfo.studentId || 'N/A'}`, 60, 292);
    doc.text(`Fee Type: ${row.type}`, pageW / 2 + 10, 275);
    doc.text(`Due Date: ${row.due}`, pageW / 2 + 10, 292);

    // ── Amount Section ───────────────────────────────────────────────
    doc.setFillColor(79, 141, 207, 0.1);
    doc.setFillColor(237, 244, 252);
    doc.roundedRect(40, 328, pageW - 80, 80, 8, 8, 'F');
    doc.setDrawColor(79, 141, 207);
    doc.setLineWidth(1);
    doc.roundedRect(40, 328, pageW - 80, 80, 8, 8, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(79, 141, 207);
    doc.text('AMOUNT PAID', pageW / 2, 350, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(32);
    doc.setTextColor(30, 40, 60);
    doc.text(`Rs. ${row.amount?.toLocaleString() || '0'}`, pageW / 2, 390, { align: 'center' });

    // ── Divider line ─────────────────────────────────────────────────
    doc.setDrawColor(200, 210, 225);
    doc.setLineWidth(0.5);
    doc.line(40, 430, pageW - 40, 430);

    // ── Note ─────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(130, 140, 160);
    doc.text('This is a computer-generated receipt and does not require a signature.', pageW / 2, 450, { align: 'center' });
    doc.text('For any queries, contact the KGF Hostel Administration Office.', pageW / 2, 465, { align: 'center' });

    // ── Footer ───────────────────────────────────────────────────────
    doc.setFillColor(79, 141, 207);
    doc.rect(0, pageH - 40, pageW, 40, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text('KGF Hostel Management System', pageW / 2, pageH - 22, { align: 'center' });
    doc.text(`Generated on ${new Date().toLocaleString('en-GB')}`, pageW / 2, pageH - 10, { align: 'center' });

    // ── Save ─────────────────────────────────────────────────────────
    const filename = `Receipt_${row.invoiceNumber || row.id?.slice(-6)}_${row.type?.replace(/\s/g, '_')}.pdf`;
    doc.save(filename);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-10">
        <p className="text-red-500 font-bold">Error: {error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2 sm:p-4 lg:p-6">
      
      {/* Fees Paid Section */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center ml-2 mb-4 sm:mb-6">
          <div className="w-1 h-6 sm:h-7 bg-[#4F8DCF] mr-2 sm:mr-3"></div>
          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">Fees History</h2>
        </div>

        <div className="w-full bg-white rounded-2xl shadow-inner border border-gray-100 overflow-hidden" style={{ boxShadow: 'inset 0 4px 10px rgba(0, 0, 0, 0.1)' }}>
          <div className="w-full flex flex-col items-center p-4 md:p-5 pb-4">

            {/* Mobile View */}
            <div className="md:hidden w-full max-w-xs sm:max-w-sm">
              <div className="p-3 sm:p-5 mb-3 rounded" style={{ backgroundColor: '#D9D9D9' }}>
                <div className="grid grid-cols-4 gap-2 sm:gap-3 text-sm sm:text-base font-bold text-gray-800">
                  <div className="text-center">Type</div>
                  <div className="text-center">Amount</div>
                  <div className="text-center">Due Date</div>
                  <div className="text-center">Status</div>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3 mb-0">
                {feesData.length === 0 ? (
                  <p className="text-center py-4 text-gray-500">No records found</p>
                ) : (
                  feesData.map((row, i) => (
                    <div
                      key={i}
                      className={`bg-white border border-gray-200 p-3 sm:p-5 rounded ${i === feesData.length - 1 ? 'mb-0' : ''}`}
                    >
                      <div className="grid grid-cols-4 gap-2 sm:gap-3 text-xs sm:text-sm items-center">
                        <div className="text-center font-bold text-gray-800 py-1">{row.type}</div>
                        <div className="text-center font-bold text-gray-600 py-1">{row.amountDisplay}</div>
                        <div className="text-center font-bold text-gray-600 py-1">{row.due}</div>
                        <div className="flex justify-center items-center py-1">
                          <span
                            className={`flex items-center justify-center w-[60px] sm:w-[70px] h-[28px] sm:h-[32px] text-xs font-semibold rounded-sm ${statusColors[row.status] || 'bg-gray-400 text-white'}`}
                          >
                            {row.status}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200 space-y-2">
                        <div className="text-center">
                          <span className="text-xs font-bold text-gray-500">Payment Date: </span>
                          <span className="text-xs sm:text-sm font-bold text-gray-700">{row.paid}</span>
                        </div>
                        {(row.status === 'Paid' || row.status === 'Completed') && (
                          <div className="flex justify-center">
                            <button
                              onClick={() => downloadReceipt(row)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4F8DCF] hover:bg-blue-700 text-white text-[10px] sm:text-xs font-bold rounded-lg shadow transition"
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                              </svg>
                              Download Receipt
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block w-full max-w-none lg:max-w-6xl xl:max-w-7xl">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr style={{ backgroundColor: '#D9D9D9' }}>
                      <th className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-800 text-center text-base md:text-lg">Fee Type</th>
                      <th className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-800 text-center text-base md:text-lg">Amount</th>
                      <th className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-800 text-center text-base md:text-lg">Due Date</th>
                      <th className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-800 text-center text-base md:text-lg">Payment Date</th>
                      <th className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-800 text-center text-base md:text-lg">Status</th>
                      <th className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-800 text-center text-base md:text-lg">Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feesData.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-8 text-gray-500">No records found</td>
                      </tr>
                    ) : (
                      feesData.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                          <td className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-700 text-center text-sm md:text-base">{row.type}</td>
                          <td className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-700 text-center text-sm md:text-base">{row.amountDisplay}</td>
                          <td className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-700 text-center text-sm md:text-base">{row.due}</td>
                          <td className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-700 text-center text-sm md:text-base">{row.paid}</td>
                          <td className="py-3 md:py-4 px-4 md:px-6">
                            <div className="flex justify-center items-center">
                              <span className={`flex items-center justify-center w-[90px] md:w-[100px] h-[36px] md:h-[40px] font-semibold text-xs md:text-sm rounded-sm ${statusColors[row.status] || 'bg-gray-400 text-white'}`}>
                                {row.status}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 md:py-4 px-4 md:px-6 text-center">
                            {(row.status === 'Paid' || row.status === 'Completed') ? (
                              <button
                                onClick={() => downloadReceipt(row)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#4F8DCF] hover:bg-blue-700 text-white text-xs md:text-sm font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                                </svg>
                                Download
                              </button>
                            ) : (
                              <span className="text-xs text-gray-400 font-semibold">—</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History Section */}
      <div>
        <div className="flex items-center ml-2 mb-4 sm:mb-6">
          <div className="w-1 h-6 sm:h-7 bg-[#4F8DCF] mr-2 sm:mr-3"></div>
          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">Transaction History</h2>
        </div>

        <div className="w-full bg-white rounded-2xl shadow-inner border border-gray-100 overflow-hidden" style={{ boxShadow: 'inset 0 4px 10px rgba(0, 0, 0, 0.1)' }}>
          <div className="w-full flex flex-col items-center p-4 md:p-5 pb-4">
            
            <div className="md:hidden w-full max-w-xs sm:max-w-sm">
              <div className="p-3 sm:p-5 mb-3 rounded" style={{ backgroundColor: '#D9D9D9' }}>
                <div className="grid grid-cols-4 gap-2 sm:gap-3 text-sm sm:text-base font-bold text-gray-800">
                  <div className="text-center">ID</div>
                  <div className="text-center">Date</div>
                  <div className="text-center">Amount</div>
                  <div className="text-center">Status</div>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3 mb-0">
                {transactionData.length === 0 ? (
                  <p className="text-center py-4 text-gray-500">No transactions found</p>
                ) : (
                  transactionData.map((row, i) => (
                    <div key={i} className={`bg-white border border-gray-200 p-3 sm:p-5 rounded ${i === transactionData.length - 1 ? 'mb-0' : ''}`}>
                      <div className="grid grid-cols-4 gap-2 sm:gap-3 text-xs sm:text-sm items-center">
                        <div className="text-center font-bold text-gray-800 py-1 break-all">{row.id}</div>
                        <div className="text-center font-bold text-gray-600 py-1">{row.date}</div>
                        <div className="text-center font-bold text-gray-600 py-1">{row.amount}</div>
                        <div className="flex justify-center items-center py-1">
                          <span className={`flex items-center justify-center w-[80px] sm:w-[85px] h-[30px] sm:h-[34px] text-xs font-semibold rounded-sm ${statusColors[row.status] || 'bg-gray-400 text-white'}`}>{row.status}</span>
                        </div>
                      </div>
                      <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200">
                        <div className="text-center">
                          <span className="text-xs font-bold text-gray-500">Method: </span>
                          <span className="text-xs sm:text-sm font-bold text-gray-700">{row.method}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="hidden md:block w-full max-w-none lg:max-w-6xl xl:max-w-7xl">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr style={{ backgroundColor: '#D9D9D9' }}>
                      <th className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-800 text-center text-base md:text-lg">Transaction ID</th>
                      <th className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-800 text-center text-base md:text-lg">Date</th>
                      <th className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-800 text-center text-base md:text-lg">Amount</th>
                      <th className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-800 text-center text-base md:text-lg">Method</th>
                      <th className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-800 text-center text-base md:text-lg">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactionData.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-8 text-gray-500">No transactions found</td>
                      </tr>
                    ) : (
                      transactionData.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                          <td className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-700 text-center text-sm md:text-base">{row.id}</td>
                          <td className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-700 text-center text-sm md:text-base">{row.date}</td>
                          <td className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-700 text-center text-sm md:text-base">{row.amount}</td>
                          <td className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-700 text-center text-sm md:text-base">{row.method}</td>
                          <td className="py-3 md:py-4 px-4 md:px-6">
                            <div className="flex justify-center items-center">
                              <span className={`flex items-center justify-center w-[95px] md:w-[105px] h-[38px] md:h-[42px] font-semibold text-xs md:text-sm rounded-sm ${statusColors[row.status] || 'bg-gray-400 text-white'}`}>{row.status}</span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

