import React from 'react';

export const metadata = {
  title: 'révise.',
  description: 'Application de révision scolaire',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, backgroundColor: '#ffffff' }}>
        {children}
      </body>
    </html>
  );
}
