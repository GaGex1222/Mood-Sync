import { Poppins } from 'next/font/google'
import { SessionProvider } from "next-auth/react";
import "./globals.css";
const poppins = Poppins({
  weight: '400',
  subsets: ['latin'],
})
export default function RootLayout({children}: Readonly<{children: React.ReactNode;}>) {
  return (
    <SessionProvider>
      <html lang="en" className={poppins.className}>
        <body className="h-screen bg-[#1A1A1A]">
          {children}
        </body>
      </html>
    </SessionProvider>
  );
}
