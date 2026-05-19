// Fixed Payments Confirmation Page
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import kgfQrCode from '../../../public/KGF_QR_code.jpeg';
import card1 from '../../../public/icons/card1.jpg'
import card2 from '../../../public/icons/card2.jpg'
import card3 from '../../../public/icons/card3.jpg'
import card4 from '../../../public/icons/card4.jpg'
import card5 from '../../../public/icons/card5.jpg'
import card6 from '../../../public/icons/card6.avif'
import card7 from '../../../public/icons/card7.jpg'

export default function Payments({ fee, onBack }) {
  const [paymentMethod, setPaymentMethod] = useState('Hostel QR Code');
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [processing, setProcessing] = useState(false);

  const [isAmountMatched, setIsAmountMatched] = useState(null);
  const [detectedAmount, setDetectedAmount] = useState(null);

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB');
      return;
    }
    setScreenshot(file);
    setScreenshotPreview(URL.createObjectURL(file));
    extractOCR(file);
  };

  const extractOCR = async (file) => {
    try {
      const parentToken = localStorage.getItem('parentToken');
      if (!parentToken) return;

      const ocrToastId = toast.loading('Reading screenshot to extract UTR and verify amount...');

      const formData = new FormData();
      formData.append('screenshot', file);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/parentauth/extract-utr`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${parentToken}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      toast.dismiss(ocrToastId);

      if (response.data.success) {
        // Set transaction ID if UTR is found
        if (response.data.utr) {
          setTransactionId(response.data.utr);
        }

        const expectedAmount = Number(fee?.amount || 0);
        const parsedAmounts = response.data.amounts || [];
        const matched = parsedAmounts.some(val => Math.abs(val - expectedAmount) < 0.1);

        // Find most likely amount
        const potentialAmounts = parsedAmounts.filter(x => x !== 2026 && x !== 2025 && x !== 2027);
        const likelyAmount = potentialAmounts.length > 0 ? Math.max(...potentialAmounts) : null;

        setDetectedAmount(likelyAmount);

        if (matched) {
          setIsAmountMatched(true);
          toast.success(`UTR Detected: ${response.data.utr || 'Manual Input Needed'} & Amount ₹${expectedAmount.toLocaleString('en-IN')} verified!`);
        } else {
          setIsAmountMatched(false);
          const amtStr = likelyAmount ? `₹${likelyAmount.toLocaleString('en-IN')}` : 'unknown amount';
          toast.error(`Amount Mismatch! Screenshot shows ${amtStr}, but you need to pay ₹${expectedAmount.toLocaleString('en-IN')}. Submit disabled.`, {
            duration: 6000
          });
        }
      } else {
        setIsAmountMatched(false);
        toast.error(response.data.message || 'Could not verify payment screenshot. Please upload a clear receipt.');
      }
    } catch (err) {
      console.error('OCR Extraction API error:', err);
      toast.dismiss();
      setIsAmountMatched(false);
      toast.error('Error running payment screenshot verification.');
    }
  };

  const removeScreenshot = () => {
    setScreenshot(null);
    setScreenshotPreview(null);
    setIsAmountMatched(null);
    setDetectedAmount(null);
  };

  const cardImages = [card1, card2, card3, card4, card5, card6, card7];

  // Fee type detection — use raw invoiceType (from DB) for accuracy, fallback to display string
  const isSecurityDeposit = fee?.invoiceType === 'security_deposit' 
    || fee?.type?.toLowerCase().includes('security');
  const totalAmount = fee?.amount || 0;
  // Monthly base: both security deposit and hostel fee = 3 months × monthly rate
  const monthlyBase = Math.round(totalAmount / 3);

  // Date calculation from today
  const today = new Date();
  const formatDate = (d) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const todayStr = formatDate(today);

  const m1Start = new Date(today);
  const m1End = new Date(today);
  m1End.setMonth(m1End.getMonth() + 1);
  m1End.setDate(m1End.getDate() - 1);

  const m2Start = new Date(today);
  m2Start.setMonth(m2Start.getMonth() + 1);
  const m2End = new Date(today);
  m2End.setMonth(m2End.getMonth() + 2);
  m2End.setDate(m2End.getDate() - 1);

  const m3Start = new Date(today);
  m3Start.setMonth(m3Start.getMonth() + 2);
  const m3End = new Date(today);
  m3End.setMonth(m3End.getMonth() + 3);
  m3End.setDate(m3End.getDate() - 1);

  const handleProceedToPay = async () => {
    if (!fee) {
      toast.error('No fee selected');
      return;
    }

    if (paymentMethod === 'Hostel QR Code' && !transactionId.trim()) {
      toast.error('Please enter the 12-digit UPI UTR / Transaction ID');
      return;
    }

    if (screenshot && isAmountMatched === false) {
      toast.error('Cannot submit. The payment screenshot amount does not match the invoice amount.');
      return;
    }

    try {
      setProcessing(true);
      const parentToken = localStorage.getItem('parentToken');
      if (!parentToken) {
        toast.error('Authentication error. Please login again.');
        return;
      }

      const formData = new FormData();
      formData.append('invoiceId', fee.id);
      formData.append('paymentMethod', paymentMethod === 'Cash Payment' ? 'Cash' : 'Hostel QR Code');
      formData.append('transactionId', transactionId.trim());
      formData.append('notes', notes.trim());
      if (screenshot) {
        formData.append('screenshot', screenshot);
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/parentauth/submit-payment-details`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${parentToken}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        toast.success(response.data.message || 'Payment details submitted successfully!');
        setTimeout(() => {
          if (onBack) onBack();
          else window.location.reload();
        }, 1500);
      }
    } catch (err) {
      console.error('Error submitting payment details:', err);
      toast.error(err.response?.data?.message || 'Failed to submit payment details');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6 p-2 sm:p-4 lg:p-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center ml-2">
          <div className="w-1 h-6 sm:h-7 bg-[#4F8DCF] mr-2 sm:mr-3"></div>
          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">Payments Confirmation</h2>
        </div>
        {onBack && (
          <button 
            onClick={onBack}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition shadow-sm"
          >
            ← Back to Invoices
          </button>
        )}
      </div>

      <div className="space-y-6 sm:space-y-8 md:space-y-10">
        {/* Payment Summary */}
        <div className="bg-white rounded-2xl px-4 sm:px-8 py-6 sm:py-8 shadow-[0px_10px_20px_rgba(0,0,0,0.08)] border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-[#4F8DCF]" />
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6 text-gray-900">
            Payment Summary — {isSecurityDeposit ? 'Security Deposit' : 'Hostel Fee (Quarterly)'}
          </h3>

          {isSecurityDeposit ? (
            /* ─── SECURITY DEPOSIT SUMMARY ─── */
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200/80 mb-6 space-y-5">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-4">
                <span className="p-2 bg-purple-100 text-purple-700 rounded-lg text-xs">🔐</span>
                <h4 className="text-sm sm:text-base font-bold text-gray-900">Security Deposit — One-Time Refundable Payment</h4>
              </div>

              <div className="space-y-3">
                {/* Monthly base */}
                <div className="flex justify-between items-center text-xs sm:text-sm px-1">
                  <span className="font-semibold text-gray-600">Monthly Base Fee Rate (Per Student)</span>
                  <span className="font-bold text-gray-900">₹ {monthlyBase.toLocaleString()} / month</span>
                </div>

                {/* Calculation row */}
                <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-sm flex justify-between items-center">
                  <div>
                    <span className="font-bold text-gray-900 block mb-0.5 text-sm">Security Deposit Formula</span>
                    <span className="text-[11px] text-gray-500 font-medium">₹ {monthlyBase.toLocaleString()} (monthly) × 3 months</span>
                  </div>
                  <span className="font-extrabold text-purple-700 text-base sm:text-lg">= ₹ {totalAmount.toLocaleString()}</span>
                </div>

                {/* Info note */}
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 text-xs text-purple-800 font-medium flex gap-3 items-start">
                  <span className="text-base">ℹ️</span>
                  <p>This is a <strong>one-time refundable security deposit</strong> collected at the start of admission. It will be refunded at the time of checkout after deducting any pending dues or damages.</p>
                </div>

                {/* Total Banner */}
                <div className="flex justify-between items-center p-4 sm:p-5 bg-purple-600/10 rounded-2xl border-2 border-purple-300/50 mt-2">
                  <div>
                    <p className="text-xs text-purple-700 font-bold uppercase tracking-wider mb-1">Security Deposit (One-Time)</p>
                    <p className="text-base sm:text-lg font-extrabold text-gray-900">Collected at Admission</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Payable</p>
                    <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-purple-700">₹ {totalAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ─── HOSTEL FEE (3-MONTH) SUMMARY ─── */
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200/80 mb-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-4 gap-2">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-blue-100 text-blue-700 rounded-lg text-xs">📊</span>
                  <h4 className="text-sm sm:text-base font-bold text-gray-900">Hostel Fee — Monthly Calculation Breakdown</h4>
                </div>
                <span className="text-xs bg-blue-50 text-blue-700 font-extrabold px-3 py-1 rounded-full border border-blue-200 self-start sm:self-auto">
                  Quarterly Cycle (3 Months)
                </span>
              </div>

              <div className="space-y-4">
                {/* Monthly Base */}
                <div className="flex justify-between items-center text-xs sm:text-sm px-1">
                  <span className="font-semibold text-gray-600">Monthly Base Fee Rate (Per Student)</span>
                  <span className="font-bold text-gray-900">₹ {monthlyBase.toLocaleString()} / month</span>
                </div>

                {/* 3-month breakdown */}
                <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 shadow-sm overflow-hidden text-xs sm:text-sm font-medium text-gray-600">
                  <div className="flex justify-between items-center p-4 hover:bg-gray-50/60 transition">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">1</span>
                      <div>
                        <span className="font-semibold text-gray-800 block">Month 1</span>
                        <span className="text-[10px] text-gray-400">{formatDate(m1Start)} → {formatDate(m1End)}</span>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900">₹ {monthlyBase.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center p-4 hover:bg-gray-50/60 transition">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">2</span>
                      <div>
                        <span className="font-semibold text-gray-800 block">Month 2</span>
                        <span className="text-[10px] text-gray-400">{formatDate(m2Start)} → {formatDate(m2End)}</span>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900">₹ {monthlyBase.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center p-4 hover:bg-gray-50/60 transition">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">3</span>
                      <div>
                        <span className="font-semibold text-gray-800 block">Month 3</span>
                        <span className="text-[10px] text-gray-400">{formatDate(m3Start)} → {formatDate(m3End)}</span>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900">₹ {monthlyBase.toLocaleString()}</span>
                  </div>

                  {/* Subtotal row */}
                  <div className="flex justify-between items-center p-4 bg-blue-50/40">
                    <span className="font-extrabold text-gray-800 text-sm">Total (3 Months × ₹ {monthlyBase.toLocaleString()})</span>
                    <span className="font-extrabold text-[#4F8DCF] text-base">₹ {totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Total Banner */}
                <div className="flex justify-between items-center p-4 sm:p-5 bg-[#4F8DCF]/10 rounded-2xl border-2 border-[#4F8DCF]/30 mt-2">
                  <div>
                    <p className="text-xs text-[#4F8DCF] font-bold uppercase tracking-wider mb-1">Current Invoice — Hostel Fee</p>
                    <p className="text-base sm:text-lg font-extrabold text-gray-900">Quarterly Billing ({todayStr})</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Payable</p>
                    <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#4F8DCF]">₹ {totalAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {fee && (
            <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 px-2 font-semibold pt-3 border-t border-gray-100">
              <span className="text-gray-400">Invoice ID: <span className="text-gray-700">{fee.id}</span></span>
              <span className="text-amber-600 bg-amber-50 px-3 py-1 rounded-full font-bold border border-amber-200">Due: {fee.dueDate}</span>
            </div>
          )}
        </div>

        {/* Payment Method */}
        <div className="px-2 sm:px-4 md:px-8">
          <div className="bg-white rounded-2xl px-4 sm:px-8 md:px-12 py-6 sm:py-8 md:py-10 shadow-[0px_10px_25px_rgba(0,0,0,0.06)] border border-gray-100">
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
              <span>Payment Method</span>
              <span className="text-xs bg-emerald-50 text-emerald-600 font-bold px-2.5 py-1 rounded-full border border-emerald-200">Official Channel</span>
            </h3>

            <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-gray-50/70 border border-gray-200/80 space-y-6">
              
              {/* QR Code Option Header */}
              <div className="flex items-start p-5 rounded-2xl border-2 border-[#4F8DCF] bg-white shadow-sm">
                <div className="w-5 h-5 flex items-center justify-center rounded-full bg-[#4F8DCF]/10 text-[#4F8DCF] mt-0.5">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-4 space-y-1">
                  <span className="block text-base font-bold text-gray-900">Hostel QR Code (Scan & Pay)</span>
                  <span className="block text-xs text-gray-500 font-medium">Pay instantly via GPay, PhonePe, Paytm, or any UPI App</span>
                </div>
              </div>

              {/* QR Code Details & Form */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mt-6">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="bg-white p-4 rounded-2xl border-2 border-gray-200 shadow-sm flex flex-col items-center justify-center min-w-[200px]">
                    <div className="w-40 h-40 relative flex items-center justify-center bg-gray-50 rounded-xl mb-2 border border-gray-100">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                          `upi://pay?pa=7510012346@ybl&pn=KGF HOSTEL OFFICIAL&am=${fee?.amount || 0}&cu=INR&tn=Hostel Fee Payment`
                        )}`}
                        alt="KGF Hostel Official Dynamic QR Code"
                        className="w-32 h-32 object-contain"
                      />
                    </div>
                    <p className="text-xs font-extrabold text-gray-800 tracking-wide">KGF HOSTEL OFFICIAL</p>
                    <p className="text-[10px] text-gray-500 font-semibold">UPI ID: 7510012346@ybl</p>
                    <div className="mt-2 text-center bg-blue-50 px-3 py-1 rounded-lg border border-blue-100 w-full">
                      <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Amount to Pay</p>
                      <p className="text-sm font-extrabold text-gray-900">₹ {fee?.amount?.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4 w-full">
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-xs sm:text-sm text-blue-900">
                      <p className="font-bold mb-1">Instructions:</p>
                      <ol className="list-decimal list-inside space-y-1 font-medium">
                        <li>Open any UPI app on your mobile device.</li>
                        <li>Scan the QR code shown on the left (the exact amount of <strong>₹ {fee?.amount?.toLocaleString()}</strong> will be pre-filled automatically).</li>
                        <li>Enter the 12-digit UTR / Transaction Reference Number below to confirm.</li>
                      </ol>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs sm:text-sm font-bold text-gray-700">
                        12-Digit UPI UTR / Reference Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 312345678901"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#4F8DCF] focus:border-transparent outline-none font-semibold text-gray-800 text-sm transition"
                      />
                    </div>

                    {/* Screenshot Upload */}
                    <div className="space-y-2">
                      <label className="block text-xs sm:text-sm font-bold text-gray-700">
                        Upload Payment Screenshot
                        <span className="ml-2 text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Optional · Max 5MB</span>
                      </label>

                      {!screenshotPreview ? (
                        <label
                          htmlFor="screenshot-upload"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 hover:bg-blue-50 hover:border-[#4F8DCF] cursor-pointer transition-all group"
                        >
                          <svg className="w-8 h-8 text-gray-400 group-hover:text-[#4F8DCF] mb-2 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                          </svg>
                          <p className="text-xs font-semibold text-gray-500 group-hover:text-[#4F8DCF] transition">Click to upload payment screenshot</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">PNG, JPG, JPEG supported</p>
                          <input
                            id="screenshot-upload"
                            type="file"
                            accept="image/png,image/jpeg,image/jpg"
                            className="hidden"
                            onChange={handleScreenshotChange}
                          />
                        </label>
                      ) : (
                        <div className="relative rounded-2xl overflow-hidden border-2 border-[#4F8DCF]/40 shadow-sm">
                          <img
                            src={screenshotPreview}
                            alt="Payment screenshot"
                            className="w-full max-h-48 object-contain bg-gray-50"
                          />
                          <div className="absolute top-2 right-2 flex gap-2">
                            <label
                                htmlFor="screenshot-upload"
                                className="bg-white text-[#4F8DCF] text-[10px] font-bold px-2 py-1 rounded-lg border border-[#4F8DCF]/30 shadow cursor-pointer hover:bg-blue-50 transition"
                              >
                                Change
                                <input
                                  id="screenshot-upload"
                                  type="file"
                                  accept="image/png,image/jpeg,image/jpg"
                                  className="hidden"
                                  onChange={handleScreenshotChange}
                                />
                              </label>
                            <button
                              type="button"
                              onClick={removeScreenshot}
                              className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded-lg border border-red-200 shadow hover:bg-red-100 transition"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {screenshot && isAmountMatched === false && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-start gap-2 shadow-sm animate-pulse">
                          <span className="text-base mt-0.5">❌</span>
                          <div>
                            <p className="font-bold text-red-800">Payment Amount Mismatch Detected</p>
                            <p className="font-medium text-red-600 mt-0.5">
                              The screenshot appears to show an amount of {detectedAmount ? `₹${detectedAmount.toLocaleString('en-IN')}` : 'unknown'}, but the invoice requires exactly <strong>₹{fee?.amount?.toLocaleString('en-IN')}</strong>. Please upload the correct payment screenshot.
                            </p>
                          </div>
                        </div>
                      )}

                      {screenshot && isAmountMatched === true && (
                        <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-semibold flex items-start gap-2 shadow-sm">
                          <span className="text-base mt-0.5">✅</span>
                          <div>
                            <p className="font-bold text-emerald-800">Screenshot Amount Verified</p>
                            <p className="font-medium text-emerald-600 mt-0.5">
                              The screenshot matches the required payment amount of <strong>₹{fee?.amount?.toLocaleString('en-IN')}</strong>.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs sm:text-sm font-bold text-gray-700">Optional Notes / Depositor Name</label>
                      <input
                        type="text"
                        placeholder="Enter any additional remarks"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#4F8DCF] focus:border-transparent outline-none font-semibold text-gray-800 text-sm transition"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Proceed to Payment Button */}
              <div className="mt-8 pt-4 border-t border-gray-200">
                <button
                  onClick={handleProceedToPay}
                  disabled={processing || (screenshot && isAmountMatched === false)}
                  className="group relative w-full overflow-hidden bg-gradient-to-r from-[#4F8DCF] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold text-base sm:text-lg rounded-2xl px-6 py-4 shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                  <span className="relative flex items-center justify-center gap-2">
                    {processing ? (
                      'Submitting Payment Details...'
                    ) : screenshot && isAmountMatched === false ? (
                      'Submit Disabled — Amount Mismatch'
                    ) : (
                      'Submit UTR & Confirm Payment'
                    )}
                  </span>
                </button>

                <p className="text-center text-xs text-gray-400 mt-3 font-medium">
                  🔒 All payment submissions are securely logged and verified by KGF Hostel Administration
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}