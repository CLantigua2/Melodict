import type { Metadata } from 'next';
import StyledComponentsRegistry from '@/lib/registry';
import { AppThemeProvider } from '@/context/ThemeContext/';
import { ScoreProvider } from '@/context/ScoreContext/';

export const metadata: Metadata = {
  title: 'Melodict | Interactive Sheet Music & Virtual Instrument Studio',
  description: 'Author custom sheet music on an interactive staff and instantly play back notes using virtual instruments and Web Audio API.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <StyledComponentsRegistry>
          <AppThemeProvider>
            <ScoreProvider>
              {children}
            </ScoreProvider>
          </AppThemeProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
