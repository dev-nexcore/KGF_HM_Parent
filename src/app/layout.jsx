import './globals.css';
import { ProfileProvider } from "../components/ProfileContext";
import Script from 'next/script';

export const metadata = {
  title: {
    default: "KGF_HM | Parent Portal",
    template: "%s | Parent Portal",
  },
  description: "Parent portal dashboard",
  icons: {
    icon: "/favicon.ico"
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="bg-[#F8FAF5]">
      <body className="min-h-screen antialiased">
        <ProfileProvider>
          {children}
        </ProfileProvider>
        <Script
          id="razorpay-checkout-js"
          src="https://checkout.razorpay.com/v1/checkout.js"
        />
      </body>
    </html>
  );
}