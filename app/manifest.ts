import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Hatiso',
    short_name: 'Hatiso',
    description: 'Pay bills, buy airtime, data, and more – instantly and securely.',
    start_url: '/',
    display: 'standalone',
    background_color: '#12151A',
    theme_color: '#12151A',
    icons: [
      { src: '/brand/icons/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/brand/icons/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
