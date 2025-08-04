// src/app/layout.jsx
import './globals.css';
import { ProfileProvider } from "../components/ProfileContext";

export const metadata = {
  title: {
    default: "Parent Portal",
    template: "%s | Parent Portal",
  },
  description: "Parent portal dashboard",
  icons: {
    icon: "/favicon.ico"
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="bg-white">
      <body className="bg-white min-h-screen antialiased">
        <div className="bg-white min-h-screen">
          <ProfileProvider>
            {children}
          </ProfileProvider>
        </div>
      </body>
    </html>
  );
}