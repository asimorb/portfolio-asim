import { Noto_Nastaliq_Urdu, Karla } from 'next/font/google'
import './globals.css'

const nastaliq = Noto_Nastaliq_Urdu({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-nastaliq',
  display: 'swap',
})

const karla = Karla({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700'],
  variable: '--font-karla',
  display: 'swap',
})

export const metadata = {
  title: 'Asim Portfolio',
  description: 'Interactive portfolio with Arabic typography navigation',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${nastaliq.variable} ${karla.variable}`}>
      <body style={{ margin: 0, padding: 0, overflow: 'hidden' }}>
        {children}
      </body>
    </html>
  )
}