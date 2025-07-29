'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { FaMobileAlt, FaUniversity, FaCreditCard } from 'react-icons/fa';

export default function Payments() {
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  const cardImages = [
    '/icons/card1.jpg',
    '/icons/card2.jpg',
    '/icons/card3.jpg',
    '/icons/card4.jpg',
    '/icons/card5.jpg',
    '/icons/card6.avif',
    '/icons/card7.jpg',
  ];

  return (
    <div className="min-h-screen bg-white text-sm font-medium px-3 sm:px-4 md:px-12 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto w-full">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6 border-l-4 border-red-600 pl-3 text-black">
          Payments Confirmation
        </h2>

        <div className="space-y-6 sm:space-y-8 md:space-y-10">
          {/* Payment Summary */}
          <div className="bg-white rounded-xl px-4 sm:px-6 py-4 sm:py-6 shadow-[0px_10px_15px_rgba(0,0,0,0.15)]">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-5 text-black">Payment Summary</h3>
            <div className="flex justify-between items-center mb-3 sm:mb-5 gap-1 sm:gap-2">
              <p className="text-base sm:text-lg md:text-xl font-semibold text-black">Total amount:</p>
              <p className="text-lg sm:text-lg md:text-xl font-bold text-black md:pr-24">₹ 50,000</p>
            </div>
            <div className="text-sm text-gray-800 space-y-2 sm:space-y-3 pl-4 sm:pl-8">
              <p className="font-bold text-black">Tuition Fee</p>
              <p className="font-bold text-black">Library Fee</p>
              <p className="font-bold text-black">Annual Sports Fee</p>
            </div>
          </div>

          {/* Payment Method with responsive spacing */}
          <div className="px-2 sm:px-4 md:px-14">
            <div
              className="bg-white rounded-xl px-4 sm:px-8 md:px-16 py-4 sm:py-6 md:py-8"
              style={{
                boxShadow:
                  '0px 6px 12px rgba(0,0,0,0.1), 0px -2px 6px rgba(0,0,0,0.06), 6px 0px 8px rgba(0,0,0,0.05), -6px 0px 8px rgba(0,0,0,0.05)',
              }}
            >
              <h3 className="text-sm sm:text-md md:text-lg font-bold text-black mb-3 sm:mb-4">Select Payment Method:</h3>

              <div
                className="p-4 sm:p-6 md:p-10 rounded-lg bg-white"
                style={{
                  boxShadow:
                    'inset 5px 0 8px rgba(0,0,0,0.1), inset -5px 0 8px rgba(0,0,0,0.1), inset 0 5px 8px rgba(0,0,0,0.1)',
                }}
              >
                <div className="space-y-4 sm:space-y-6">
                  {/* UPI */}
                  <label className="flex items-center space-x-3 text-black cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="UPI"
                      checked={paymentMethod === 'UPI'}
                      onChange={() => setPaymentMethod('UPI')}
                      className="w-4 h-4 sm:w-5 sm:h-5 accent-[#1109FF]"
                    />
                    <span className="flex items-center gap-2 text-sm sm:text-[15px] font-semibold">
                      <FaMobileAlt className="text-sm sm:text-base" /> UPI
                    </span>
                  </label>

                  {/* Net Banking */}
                  <label className="flex items-center space-x-3 text-black cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="Net Banking"
                      checked={paymentMethod === 'Net Banking'}
                      onChange={() => setPaymentMethod('Net Banking')}
                      className="w-4 h-4 sm:w-5 sm:h-5 accent-[#1109FF]"
                    />
                    <span className="flex items-center gap-2 text-sm sm:text-[15px] font-semibold">
                      <FaUniversity className="text-sm sm:text-base" /> Net Banking
                    </span>
                  </label>

                  {/* Card */}
                  <label className="flex flex-col text-black space-y-2 cursor-pointer">
                    <span className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="payment"
                        value="Card"
                        checked={paymentMethod === 'Card'}
                        onChange={() => setPaymentMethod('Card')}
                        className="w-4 h-4 sm:w-5 sm:h-5 accent-[#1109FF]"
                      />
                      <span className="flex items-center gap-2 text-sm sm:text-[15px] font-semibold">
                        <FaCreditCard className="text-sm sm:text-base" /> Credit or Debit Card
                      </span>
                    </span>

                    {/* Card Images - Single Row for Mobile, Original for Desktop */}
                    <div className="flex flex-wrap justify-center gap-1 sm:gap-2 md:gap-3 mt-3">
                      {cardImages.map((src, index) => (
                        <div key={index} className="w-[40px] h-auto sm:max-w-[80px] md:w-22">
                          <Image
                            src={src}
                            alt={`Card ${index + 1}`}
                            width={112}
                            height={60}
                            className="h-[65%] w-full rounded object-contain"
                          />
                        </div>
                      ))}
                    </div>
                  </label>
                </div>

                <div className="mt-6 sm:mt-8 md:mt-10 flex justify-center">
                  <div className="bg-[#A4B494] hover:bg-[#8DA087] px-2 py-3 w-[180px] transition-all duration-300 rounded-md shadow-lg shadow-black/40 flex items-center justify-center">                  
                    <a
                      href="/payment-success"
                      className="text-sm font-semibold w-full sm:w-auto text-center"
                    >
                      Proceed To Pay
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
