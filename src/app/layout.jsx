// app/layout.js
import './globals.css';

export const metadata = {
  title: "Attendance Dashboard",
  description: "Parent portal attendance dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="bg-white">
      <body className="bg-white min-h-screen antialiased">
        <div className="bg-white min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
