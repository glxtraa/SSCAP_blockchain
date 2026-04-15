import './globals.css'

export const metadata = {
  title: 'SSCAP Admin Dashboard',
  description: 'Control center for VWB blockchain integration',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
