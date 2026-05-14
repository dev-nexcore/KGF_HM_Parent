import React, { useState, useEffect } from "react";
import axios from "axios";

const statusColors = {
  Paid: "bg-green-500 text-white",
  Pending: "bg-yellow-400 text-white",
  Completed: "bg-green-500 text-white",
  Overdue: "bg-red-500 text-white",
};

export default function FeesSection() {
  const [feesData, setFeesData] = useState([]);
  const [transactionData, setTransactionData] = useState([]);
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
        
        // Map invoices to feesData format
        const formattedFees = (data.allInvoices || []).map(inv => ({
          type: inv.type,
          amount: `₹ ${inv.amount.toLocaleString()}`,
          due: inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-GB') : 'N/A',
          paid: inv.paidDate ? new Date(inv.paidDate).toLocaleDateString('en-GB') : 'N/A',
          status: inv.status,
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
                        <div className="text-center font-bold text-gray-600 py-1">{row.amount}</div>
                        <div className="text-center font-bold text-gray-600 py-1">{row.due}</div>
                        <div className="flex justify-center items-center py-1">
                          <span
                            className={`flex items-center justify-center w-[60px] sm:w-[70px] h-[28px] sm:h-[32px] text-xs font-semibold rounded-sm ${statusColors[row.status] || 'bg-gray-400 text-white'}`}
                          >
                            {row.status}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200">
                        <div className="text-center">
                          <span className="text-xs font-bold text-gray-500">Payment Date: </span>
                          <span className="text-xs sm:text-sm font-bold text-gray-700">{row.paid}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block w-full max-w-none lg:max-w-6xl xl:max-w-7xl">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr style={{ backgroundColor: '#D9D9D9' }}>
                      <th className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-800 text-center text-base md:text-lg">
                        Fee Type
                      </th>
                      <th className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-800 text-center text-base md:text-lg">
                        Amount
                      </th>
                      <th className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-800 text-center text-base md:text-lg">
                        Due Date
                      </th>
                      <th className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-800 text-center text-base md:text-lg">
                        Payment Date
                      </th>
                      <th className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-800 text-center text-base md:text-lg">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {feesData.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-8 text-gray-500">No records found</td>
                      </tr>
                    ) : (
                      feesData.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-700 text-center text-sm md:text-base">{row.type}</td>
                          <td className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-700 text-center text-sm md:text-base">{row.amount}</td>
                          <td className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-700 text-center text-sm md:text-base">{row.due}</td>
                          <td className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-700 text-center text-sm md:text-base">{row.paid}</td>
                          <td className="py-3 md:py-4 px-4 md:px-6">
                            <div className="flex justify-center items-center">
                              <span className={`flex items-center justify-center w-[90px] md:w-[100px] h-[36px] md:h-[40px] font-semibold text-xs md:text-sm rounded-sm ${statusColors[row.status] || 'bg-gray-400 text-white'}`}>
                                {row.status}
                              </span>
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
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
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