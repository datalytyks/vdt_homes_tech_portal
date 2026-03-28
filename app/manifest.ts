import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name:             'VDT Tech Dashboard',
    short_name:       'VDT Tech',
    description:      'Ecosystem map, error management, and system controls',
    start_url:        '/',
    display:          'standalone',
    background_color: '#0a0a0a',
    theme_color:      '#0a0a0a',
    orientation:      'portrait-primary',
    icons: [
      {
        src:   '/icons/icon-192.png',
        sizes: '192x192',
        type:  'image/png',
      },
      {
        src:   '/icons/icon-512.png',
        sizes: '512x512',
        type:  'image/png',
      },
      {
        src:     '/icons/icon-512.png',
        sizes:   '512x512',
        type:    'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
