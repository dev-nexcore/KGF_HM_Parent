'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/navbar';
import Sidebar from '@/components/layout/sidebar';
import MakePaymentsPage from '@/components/Makepayments/Makepayments';
import Payments from '@/components/Makepayments/Makepayment2';

export default function Home() {
  const [selectedFee, setSelectedFee] = useState(null);

  const handlePayNowClick = (fee) => {
    setSelectedFee(fee);
  };

  const handleBack = () => {
    setSelectedFee(null);
  };

  return (
    <div className='flex'>
      <Sidebar />
      <div className='flex-1 min-h-screen'>
        <Navbar/>
        {!selectedFee ? (
          <MakePaymentsPage onPayNowClick={handlePayNowClick} />
        ) : (
          <Payments fee={selectedFee} onBack={handleBack} />
        )}
      </div>
    </div>
  );
}
