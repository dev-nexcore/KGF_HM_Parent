'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/navbar';
import Sidebar from '@/components/layout/sidebar';
import MakePaymentsPage from '@/components/Makepayments/Makepayments';
import Payments from '@/components/Makepayments/Makepayment2';

export default function Home() {
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  return (
    <div className='min-h-screen flex flex-col md:flex-row '>
      <Sidebar />
      <div className='flex-1 flex flex-col'>
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
