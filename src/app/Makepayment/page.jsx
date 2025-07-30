'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/navbar';
import Sidebar from '@/components/layout/sidebar';
import MakePaymentsPage from '@/components/Makepayments/Makepayments';
import Payments from '@/components/Makepayments/Makepayment2';

export default function Home() {
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  return (
    <div className='flex'>
      <Sidebar />
      <div className='flex-1 min-h-screen'>
        <Navbar/>
        {!showPaymentForm ? (
          <MakePaymentsPage onPayNowClick={() => setShowPaymentForm(true)} />
        ) : (
          <Payments />
        )}
      </div>
    </div>
  );
}
