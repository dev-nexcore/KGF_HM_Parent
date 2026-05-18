import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

export default function MakePaymentsPage({ onPayNowClick }) {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);

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

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/parentauth/fees?studentId=${studentId}`,
        {
          headers: { Authorization: `Bearer ${parentToken}` }
        }
      );

      const allInvoices = response.data.feesOverview.allInvoices || [];
      const pendingInvoices = allInvoices.filter(inv => {
        if (!inv.status) return false;
        const s = inv.status.toLowerCase();
        return s === 'pending' || s === 'overdue';
      });

      setFees(pendingInvoices.map(inv => ({
        id: inv._id,
        type: inv.type,
        invoiceType: inv.invoiceType, // raw enum: 'security_deposit' | 'hostel_fee' etc.
        dueDate: inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-GB') : 'N/A',
        amount: inv.amount,
        status: inv.status,
      })));

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

      // 1. Create Razorpay Order
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

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_your_id', // Should be in env
        amount: order.amount,
        currency: order.currency,
        name: "KGF Hostel Management",
        description: `Payment for ${fee.type}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            // 3. Verify Payment
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
              fetchPendingInvoices(); // Refresh list
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2 sm:p-4 lg:p-6">
      <Toaster position="top-right" />
      <div className="flex items-center ml-2 mb-4 sm:mb-6">
        <div className="w-1 h-6 sm:h-7 bg-[#4F8DCF] mr-2 sm:mr-3"></div>
        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">Make Payments</h2>
      </div>

      <div className="bg-white rounded-2xl border border-gray-300 px-3 sm:px-6 py-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-black/10 to-transparent z-10 rounded-t-2xl" />
        <div className="absolute top-0 left-0 bottom-0 w-4 bg-gradient-to-r from-black/5 to-transparent z-10 rounded-l-2xl" />
        <div className="absolute top-0 right-0 bottom-0 w-4 bg-gradient-to-l from-black/5 to-transparent z-10 rounded-r-2xl" />

        <div className="relative z-20">
          {fees.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 font-semibold text-lg">No pending payments found. You are all caught up!</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse table-fixed">
              <colgroup>
                <col className="w-[25%] md:w-1/4" />
                <col className="w-[20%] md:w-1/5" />
                <col className="w-[20%] md:w-1/5" />
                <col className="w-[15%] md:w-1/6" />
                <col className="w-[20%] md:w-1/5" />
              </colgroup>
              <thead className="bg-[#D9D9D9] text-gray-800">
                <tr>
                  <th className="py-2 px-1 sm:py-3 sm:px-2 lg:py-4 lg:px-6 font-semibold text-left text-xs sm:text-sm">Fee Type</th>
                  <th className="py-2 px-1 sm:py-3 sm:px-2 lg:py-4 lg:px-6 font-semibold text-center text-xs sm:text-sm">Due Date</th>
                  <th className="py-2 px-1 sm:py-3 sm:px-2 lg:py-4 lg:px-6 font-semibold text-center text-xs sm:text-sm">Amount</th>
                  <th className="py-2 px-1 sm:py-3 sm:px-2 lg:py-4 lg:px-6 font-semibold text-center text-xs sm:text-sm">Status</th>
                  <th className="py-2 px-1 sm:py-3 sm:px-2 lg:py-4 lg:px-6 font-semibold text-center text-xs sm:text-sm">Action</th>
                </tr>
              </thead>
              <tbody className="text-black font-semibold">
                {fees.map((fee, idx) => (
                  <tr key={idx} className="bg-white hover:bg-gray-50 transition border-b border-gray-100">
                    <td className="py-2 px-1 sm:py-3 sm:px-2 lg:py-4 lg:px-6 text-left text-xs sm:text-sm">
                      <div className="break-words">{fee.type}</div>
                    </td>
                    <td className="py-2 px-1 sm:py-3 sm:px-2 lg:py-4 lg:px-6 text-center text-xs sm:text-sm">
                      <div className="break-words">{fee.dueDate}</div>
                    </td>
                    <td className="py-2 px-1 sm:py-3 sm:px-2 lg:py-4 lg:px-6 text-center text-xs sm:text-sm">
                      <div className="break-words">₹ {fee.amount.toLocaleString()}</div>
                    </td>
                    <td className="py-2 px-1 sm:py-3 sm:px-2 lg:py-4 lg:px-6 text-center">
                      <span className={`${fee.status === 'Overdue' ? 'bg-red-500' : 'bg-[#ffa726]'} text-white px-2 py-1 sm:px-3 sm:py-1 rounded-md text-[10px] sm:text-xs lg:text-sm font-semibold`}>
                        {fee.status}
                      </span>
                    </td>
                    <td className="py-2 px-1 sm:py-3 sm:px-2 lg:py-4 lg:px-6 text-center">
                      <button 
                        onClick={() => {
                          if (onPayNowClick) {
                            onPayNowClick(fee);
                          } else {
                            handlePayNow(fee);
                          }
                        }}
                        disabled={payingId === fee.id}
                        className="bg-[#33cc33] hover:bg-[#28a428] text-white font-semibold px-2 py-1 sm:px-3 sm:py-1 rounded-md text-[10px] sm:text-xs lg:text-sm shadow disabled:opacity-50"
                      >
                        {payingId === fee.id ? 'Processing...' : 'Pay Now'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}