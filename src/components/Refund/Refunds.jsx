'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function Refunds() {
  const [refundType, setRefundType] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [refunds, setRefunds] = useState([]);
  const [otherRefundType, setOtherRefundType] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter()

  // Get student ID from localStorage (if available)
  // const studentId = typeof window !== 'undefined' ? localStorage.getItem('studentId') : null;
  const parentInfo = typeof window !== 'undefined' ? localStorage.getItem('parentInfo') : null;

  // ✅ Fetch Refunds (Hybrid: Dummy + Real API)
  const fetchRefunds = async () => {
    try {
      // if (!studentId) {
      //   console.warn("No studentId found — loading dummy refunds for demo mode.");

      //   const dummyRefunds = [
      //     {
      //       refundType: "Security Deposit",
      //       requestedAt: "2025-07-15",
      //       amount: "5000",
      //       reason: "Room change - excess security deposit refund",
      //       status: "approved"
      //     },
      //     {
      //       refundType: "Mess fee Overpayment",
      //       requestedAt: "2025-06-28",
      //       amount: "1200",
      //       reason: "Overpaid mess fee for June month",
      //       status: "pending"
      //     },
      //     {
      //       refundType: "Others",
      //       otherRefundType: "Laundry Fee",
      //       requestedAt: "2025-06-10",
      //       amount: "300",
      //       reason: "Duplicate payment for laundry services",
      //       status: "rejected"
      //     }
      //   ];

      //   await new Promise(resolve => setTimeout(resolve, 500)); // simulate delay
      //   setRefunds(dummyRefunds);
      //   return;
      // }

      console.log("this is parent infor:", parentInfo)
      // ✅ Actual backend call when studentId is available
      const res = await api.get(`/refunds`);
      setRefunds(res.data?.refunds || []);
    } catch (error) {
      console.error('Error fetching refund history:', error);
      toast.error('Failed to load refund history');
    }
  };

  // ✅ Handle Refund Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!refundType || !amount || !reason) return toast.error('All fields are required');

    setLoading(true);
    try {
      const res = await api.post('/refund', {
        refundType,
        amount,
        reason,
        otherRefundType: refundType === 'Others' ? otherRefundType : '',
      });
      console.log("refund post:", res.data)
      if (res.data.success === true) {
        toast.success(res.data.message)
        setRefundType('');
        setAmount('');
        setReason('');
        setOtherRefundType('');
        fetchRefunds();
      }

    } catch (err) {
      console.error('Error submitting refund:', err);
      toast.error('Failed to submit refund request');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Date Formatter
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString();
  };

  // ✅ Run on Mount or when studentId changes
  useEffect(() => {
    fetchRefunds();
  }, [parentInfo]);

  return (
    <div className="w-full min-h-screen bg-white text-black pt-8 pb-6 sm:pb-10 sm:px-6 dark:bg-white overflow-hidden">
      <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-black border-l-4 border-[#4F8CCF] pl-2 mb-4 sm:mb-9">
        Refunds
      </h2>

      {/* Refund Application Form */}
      <div className="mt-[-10px] ml-0.5">
        <Toaster position='top-right' />
        <div className="bg-white rounded-lg sm:rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.25)] mb-6 sm:mb-8 lg:mb-10 w-full">
          <div className="bg-[#A4B494] text-white rounded-t-lg sm:rounded-t-xl px-4 sm:px-6 md:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 font-semibold text-sm sm:text-base md:text-lg lg:text-xl">
            Refund Application Form
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-3 sm:space-y-4 md:space-y-6 lg:space-y-8 px-4 sm:px-6 md:px-8 lg:px-10 py-4 sm:py-6 md:py-8 lg:py-10"
          >
            <div>
              <label className="block mb-2 text-sm sm:text-base font-semibold text-gray-800">
                Refund Type
              </label>
              <select
                value={refundType}
                onChange={(e) => setRefundType(e.target.value)}
                className="w-full px-4 py-3 rounded-md shadow-md border border-gray-300 text-sm sm:text-base"
              >
                <option value="">Choose Refund Type</option>
                <option value="Mess fee Overpayment">Mess fee Overpayment</option>
                <option value="Security Deposit">Security Deposit</option>
                <option value="Damages Fee">Damages Fee</option>
                <option value="Others">Others</option>
              </select>

              {refundType === 'Others' && (
                <div className="mt-3">
                  <label className="block mt-8 text-sm sm:text-base font-semibold text-gray-800">
                    Specify:
                  </label>
                  <input
                    type="text"
                    value={otherRefundType}
                    onChange={(e) => setOtherRefundType(e.target.value)}
                    className="w-full px-4 py-3 rounded-md shadow-md border border-gray-300 text-sm sm:text-base placeholder:text-gray-400"
                    required
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm sm:text-base font-semibold text-gray-800">
                Amount
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter the Amount"
                className="w-full px-4 py-3 rounded-md shadow-md border border-gray-300 text-sm sm:text-base placeholder:text-gray-400"
                min="1"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
              <label className="text-sm sm:text-base font-semibold sm:pt-2 whitespace-nowrap">
                Reason For Refund:
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={8}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg shadow-md h-full resize-none border border-gray-300 text-sm sm:text-base md:text-lg"
                placeholder="Enter the reason for refund"
                required
              />
            </div>

            <div className="flex justify-center pt-4">
              <button
                type="submit"
                className="bg-[#BEC5AD] text-black px-6 sm:px-8 py-2.5 sm:py-3 rounded-md shadow hover:opacity-90 text-sm sm:text-base font-medium w-full sm:w-auto"
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Refund History */}
      <div className="bg-white min-h-[300px] rounded-lg sm:rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.25)] px-4 sm:px-6 md:px-8 lg:px-10 py-4 sm:py-6 md:py-8 lg:py-10 w-full">
        <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold mb-4 sm:mb-6 lg:mb-8 text-gray-800">
          Refund History
        </h3>

        {/* Debug Display */}
        {/* <pre className="text-xs">{JSON.stringify(refunds, null, 2)}</pre> */}

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm md:text-base lg:text-lg text-gray-800 min-w-full">
            <thead className="bg-gray-200 text-left">
              <tr>
                <th className="p-3 md:p-4 lg:p-5 font-semibold">Refund Type</th>
                <th className="p-3 md:p-4 lg:p-5 font-semibold">Requested Date</th>
                <th className="p-3 md:p-4 lg:p-5 font-semibold">Amount</th>
                <th className="p-3 md:p-4 lg:p-5 font-semibold">Reason</th>
                <th className="p-3 md:p-4 lg:p-5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {refunds.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500">
                    No refund requests found.
                  </td>
                </tr>
              ) : (
                refunds.map((refund, index) => (
                  <tr key={index} className="bg-white border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3 font-medium">
                      {refund.refundType === 'Others' && refund.otherRefundType
                        ? `Other (${refund.otherRefundType})`
                        : refund.refundType}
                    </td>
                    <td className="p-3">{formatDate(refund.requestedAt)}</td>
                    <td className="p-3 font-medium">₹{refund.amount}</td>
                    <td className="p-3 max-w-xs truncate">{refund.reason}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium ${refund.status === 'approved'
                          ? 'bg-green-500 text-white'
                          : refund.status === 'rejected'
                            ? 'bg-red-500 text-white'
                            : 'bg-[#4F8DCF] text-white'
                          }`}
                      >
                        {refund.status
                          ? refund.status.charAt(0).toUpperCase() + refund.status.slice(1)
                          : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden space-y-3 sm:space-y-4">
          {refunds.length === 0 ? (
            <div className="text-center py-6 text-gray-500">No refund requests found.</div>
          ) : (
            refunds.map((refund, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs font-semibold text-gray-600">Refund Type:</span>
                    <span className="text-sm font-medium text-gray-800">
                      {refund.refundType === 'Others' && refund.otherRefundType
                        ? `Other (${refund.otherRefundType})`
                        : refund.refundType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-semibold text-gray-600">Date:</span>
                    <span className="text-sm text-gray-800">{formatDate(refund.requestedAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-semibold text-gray-600">Amount:</span>
                    <span className="text-sm font-medium text-gray-800">₹{refund.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-semibold text-gray-600">Reason:</span>
                    <span className="text-sm text-gray-800 text-right max-w-[60%]">{refund.reason}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-600">Status:</span>
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium ${refund.status === 'approved'
                        ? 'bg-green-500 text-white'
                        : refund.status === 'rejected'
                          ? 'bg-red-500 text-white'
                          : 'bg-[#4F8DCF] text-white'
                        }`}
                    >
                      {refund.status
                        ? refund.status.charAt(0).toUpperCase() + refund.status.slice(1)
                        : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
