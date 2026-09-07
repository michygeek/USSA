'use client';

import dynamic from 'next/dynamic';

// PdfViewer renders to a <canvas> via browser-only APIs (Worker, Canvas 2D) — ssr:false keeps
// it out of the server render entirely.
export const PdfViewer = dynamic(() => import('./pdf-viewer').then((viewerModule) => viewerModule.PdfViewer), {
  ssr: false,
  loading: () => <p className="py-12 text-center text-sm text-slate-500">Loading document...</p>,
});
