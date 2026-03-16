// Fixed Payments Confirmation Page
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import card1 from '../../../public/icons/card1.jpg'
import card2 from '../../../public/icons/card2.jpg'
import card3 from '../../../public/icons/card3.jpg'
import card4 from '../../../public/icons/card4.jpg'
import card5 from '../../../public/icons/card5.jpg'
import card6 from '../../../public/icons/card6.avif'
import card7 from '../../../public/icons/card7.jpg'


export default function Payments() {
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  const cardImages = [
    card1,
    card2,
    card3,
    card4,
    card5,
    card6,
    card7
  ];

  return (
    <div className="space-y-6 p-2 sm:p-4 lg:p-6">
      {/* Fixed header to match Dashboard styling */}
      <div className="flex items-center ml-2 mb-4 sm:mb-6">
        <div className="w-1 h-6 sm:h-7 bg-[#4F8DCF] mr-2 sm:mr-3"></div>
        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">Payments Confirmation</h2>
      </div>

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
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-gray-400 font-medium tracking-widest uppercase">
                    Accepted Payments
                  </p>
                  {/* Secured badge */}
                  <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    100% Secure
                  </span>
                </div>
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
                    < div className="text-sm sm:text-base" /> UPI
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
                    <div className="text-sm sm:text-base" /> Net Banking
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
                      <div className="text-sm sm:text-base" /> Credit or Debit Card
                    </span>
                  </span>

                  {/* Card Images - Single Row for Mobile, Original for Desktop */}


                  {/* <div className="flex flex-wrap justify-center gap-1 sm:gap-2 md:gap-3 mt-3">
                    {cardImages.map((src, index) => (
                      <Image
                        key={index}
                        src={src}
                        alt={`Card ${index + 1}`}
                        className="w-[40px] sm:w-[70px] md:w-[90px] rounded object-contain"
                      />
                    ))}
                  </div> */}


                  <div className="mt-4">

                    {/* Label */}

                    {/* Cards Container */}
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3">
                      <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3">
                        {cardImages.map((src, index) => (
                          <div
                            key={index}
                            className="group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5 transition-all duration-200 p-2 cursor-default"
                          >
                            <Image
                              src={src}
                              alt={`Payment method ${index + 1}`}
                              className="w-[44px] sm:w-[56px] md:w-[64px] h-[28px] sm:h-[34px] md:h-[40px] object-contain"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </label>
              </div>

              {/* <div className="mt-6 sm:mt-8 md:mt-10 flex justify-center">
                <div className="bg-[#A4B494] hover:bg-[#8DA087] px-2 py-3 w-[180px] transition-all duration-300 rounded-md shadow-lg shadow-black/40 flex items-center justify-center">
                  <a
                    href="/payment-success"
                    className="text-sm font-semibold w-full sm:w-auto text-center"
                  >
                    Proceed To Pay
                  </a>
                </div>
              </div> */}


              {/* Proceed to Payment Button */}
              <div className="mt-6">

                {/* Button */}
                <button
                  onClick={() => {/* your handler */ }}
                  className="group relative w-full overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-sm sm:text-base rounded-2xl px-6 py-4 shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-md transition-all duration-200"
                >
                  {/* Shine sweep effect on hover */}
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />

                  <span className="relative flex items-center justify-center gap-2">

                    {/* Lock icon */}
                    <svg className="w-4 h-4 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>

                    Proceed to Payment

                    {/* Arrow icon */}
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>

                  </span>
                </button>

                {/* Below button — cancel link + ssl note */}
                <div className="flex items-center justify-end mt-3 px-1">
                  <span className="flex items-center gap-1 text-[11px] text-gray-400">
                    <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    SSL Encrypted
                  </span>
                </div>

                {/* Bottom note */}
                <p className="text-center text-[11px] text-gray-400 mt-2">
                  All transactions are encrypted and secure
                </p>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}