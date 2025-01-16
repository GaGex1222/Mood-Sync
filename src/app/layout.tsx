import { Poppins } from 'next/font/google'
import "./globals.css";
const poppins = Poppins({
  weight: '400',
  subsets: ['latin'],
})
export default function RootLayout({children}: Readonly<{children: React.ReactNode;}>) {
  return (
    <html lang="en" className={poppins.className}>
      <body className="h-screen bg-gradient-to-r from-[#A7C7E7] via-[#F4B5B1] to-[#6E8BB8]">
        {children}
      </body>
    </html>
  );
}
