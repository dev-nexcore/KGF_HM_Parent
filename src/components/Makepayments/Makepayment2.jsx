"use client";

import React, { useState } from 'react';
import { CreditCard, ShieldCheck, Lock, ArrowRight, CheckCircle, IndianRupee, Smartphone, Globe } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

export default function Payments() {
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);
      const parentToken = localStorage.getItem('parentToken');
      if (!parentToken) throw new Error('Authentication required');

      const tokenPayload = JSON.parse(atob(parentToken.split('.')[1]));
      const studentId = tokenPayload.studentId;

      // 1. Create Order
      const { data: order } = await axios.post(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/parentauth/create-razorpay-order`,
        { amount: 50000, studentId }, // Example amount
        { headers: { Authorization: `Bearer ${parentToken}` } }
      );

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_your_id",
        amount: order.amount,
        currency: "INR",
        name: "KGF Hostel Management",
        description: "Fees Payment",
        order_id: order.id,
        handler: async (response) => {
          try {
            await axios.post(
              `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/parentauth/verify-razorpay-payment`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              },
              { headers: { Authorization: `Bearer ${parentToken}` } }
            );
            toast.success("Payment Successful!");
            window.location.href = "/dashboard";
          } catch (err) {
            toast.error("Payment Verification Failed");
          }
        },
        theme: { color: "#7A8B5E" }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      toast.error(err.message || "Failed to initiate payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF5] p-4 sm:p-6 lg:p-8 space-y-8 font-sans">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-8 bg-[#7A8B5E] rounded-full"></div>
          <h2 className="text-2xl font-black text-[#1A1F16]">Finalize Payment</h2>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-widest">
          <ShieldCheck size={14} /> Encrypted Session
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* ── Order Summary ── */}
        <div className="bg-white rounded-[40px] p-8 sm:p-10 shadow-sm border border-[#7A8B5E]/10 space-y-8">
          <div className="space-y-2">
            <h3 className="text-xl font-black text-[#1A1F16] uppercase tracking-tight">Payment Summary</h3>
            <p className="text-[#6B7280] text-sm font-medium">Review your outstanding dues before proceeding.</p>
          </div>

          <div className="space-y-4">
            <SummaryItem label="Tuition Fee" amount="30,000" />
            <SummaryItem label="Library Fee" amount="15,000" />
            <SummaryItem label="Annual Sports Fee" amount="5,000" />
            <div className="pt-6 border-t border-[#7A8B5E]/10 flex justify-between items-center">
              <span className="text-lg font-black text-[#1A1F16]">Total Payable</span>
              <span className="text-2xl font-black text-[#7A8B5E]">₹50,000</span>
            </div>
          </div>

          <div className="bg-[#7A8B5E]/5 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-[#7A8B5E]">
              <CheckCircle size={18} />
              <span className="text-xs font-black uppercase tracking-widest">Instant Confirmation</span>
            </div>
            <p className="text-xs text-[#6B7280] font-bold leading-relaxed">
              Your payment will be instantly updated in the student records. A digital receipt will be sent to your registered email.
            </p>
          </div>
        </div>

        {/* ── Payment Method ── */}
        <div className="bg-white rounded-[40px] p-8 sm:p-10 shadow-sm border border-[#7A8B5E]/10 space-y-8">
          <div className="space-y-2">
            <h3 className="text-xl font-black text-[#1A1F16] uppercase tracking-tight">Select Method</h3>
            <p className="text-[#6B7280] text-sm font-medium">Choose your preferred secure payment gateway.</p>
          </div>

          <div className="space-y-4">
            <PaymentOption 
              id="razorpay" 
              label="Razorpay (UPI/Card/NetBanking)" 
              selected={paymentMethod === 'razorpay'} 
              onClick={() => setPaymentMethod('razorpay')}
              icon={<Smartphone className="text-blue-600" />}
            />
            <PaymentOption 
              id="bank" 
              label="Direct Bank Transfer" 
              selected={paymentMethod === 'bank'} 
              onClick={() => setPaymentMethod('bank')}
              icon={<Globe className="text-[#7A8B5E]" />}
            />
          </div>

          <div className="pt-8 space-y-4">
            <button 
              onClick={handlePayment}
              disabled={loading}
              className="w-full py-5 rounded-[24px] bg-[#7A8B5E] text-white font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-[#7A8B5E]/20 hover:bg-[#5A6E3A] hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
            >
              {loading ? "Processing..." : <>Pay Securely Now <ArrowRight size={18} /></>}
            </button>
            <p className="text-center text-[10px] font-bold text-[#6B7280] uppercase tracking-widest flex items-center justify-center gap-2">
              <Lock size={12} /> PCI-DSS Compliant Gateway
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryItem({ label, amount }) {
  return (
    <div className="flex justify-between items-center group">
      <span className="text-sm font-bold text-[#6B7280] uppercase tracking-wider group-hover:text-[#1A1F16] transition-colors">{label}</span>
      <span className="text-sm font-black text-[#1A1F16]">₹{amount}</span>
    </div>
  );
}

function PaymentOption({ id, label, selected, onClick, icon }) {
  return (
    <div 
      onClick={onClick}
      className={`p-6 rounded-3xl border-2 cursor-pointer transition-all flex items-center justify-between ${selected ? 'border-[#7A8B5E] bg-[#7A8B5E]/5 shadow-lg' : 'border-gray-100 hover:border-[#7A8B5E]/30'}`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selected ? 'bg-white shadow-sm' : 'bg-gray-50'}`}>
          {icon}
        </div>
        <span className={`text-sm font-black uppercase tracking-wider ${selected ? 'text-[#1A1F16]' : 'text-[#6B7280]'}`}>{label}</span>
      </div>
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selected ? 'border-[#7A8B5E] bg-[#7A8B5E]' : 'border-gray-200'}`}>
        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>
    </div>
  );
}