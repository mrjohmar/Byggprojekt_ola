import './globals.css'
import FeedbackButton from '@/components/FeedbackButton'

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
      <body>
        {children}
        <FeedbackButton />
      </body>
    </html>
  )
}
