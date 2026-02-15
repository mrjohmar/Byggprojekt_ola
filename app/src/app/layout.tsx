import './globals.css'
import Script from 'next/script'

export const metadata = {
  title: 'Byggplanerare',
  description: 'Planera ditt byggprojekt enkelt',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sv">
      <head>
        <Script src="https://js.puter.com/v2/" strategy="beforeInteractive" />
      </head>
      <body>{children}</body>
    </html>
  )
}
