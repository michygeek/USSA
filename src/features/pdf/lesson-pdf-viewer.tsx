'use client';

import { useEffect, useRef, useState } from 'react';
import type * as PdfjsLib from 'pdfjs-dist';

const MAX_PAGE_RENDER_WIDTH = 720;
const MIN_PAGE_RENDER_WIDTH = 280;

type LoadState = 'loading' | 'ready' | 'error';

export function PdfViewer({ fileUrl }: { fileUrl: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');

  useEffect(() => {
    let isCancelled = false;

    async function renderPdf() {
      setLoadState('loading');

      // pdfjs-dist's own build is itself a webpack bundle with internal variable names that
      // collide with our webpack's runtime under Next's dev-mode module wrapping
      // (webpack/webpack#20095, unfixed in Next's bundled webpack). Loading it as a real
      // browser ES module from /public — never handed to webpack — sidesteps the bug entirely.
      // @ts-expect-error -- runtime-only path into /public, not a resolvable TS module specifier
      const pdfjsLib: typeof PdfjsLib = await import(/* webpackIgnore: true */ '/pdfjs/pdf.min.mjs');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs';

      try {
        const pdfDocument = await pdfjsLib.getDocument(fileUrl).promise;
        if (isCancelled) return;

        const container = containerRef.current;
        const wrapper = wrapperRef.current;
        if (!container || !wrapper) return;
        container.innerHTML = '';

        // Render at the wrapper's actual available width (minus its padding) so pages never
        // overflow on narrow phone screens, capped at a comfortable reading width on desktop.
        const availableWidth = wrapper.clientWidth - 32;
        const pageRenderWidth = Math.max(MIN_PAGE_RENDER_WIDTH, Math.min(MAX_PAGE_RENDER_WIDTH, availableWidth));

        for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++) {
          const page = await pdfDocument.getPage(pageNumber);
          if (isCancelled) return;

          const unscaledViewport = page.getViewport({ scale: 1 });
          const scale = pageRenderWidth / unscaledViewport.width;
          const viewport = page.getViewport({ scale });

          // Render at the display's actual pixel density, not just CSS pixels — otherwise the
          // canvas backing store is lower-resolution than the screen and gets blurrily upscaled
          // on any HiDPI display (Retina, or Windows display scaling above 100%).
          const outputScale = window.devicePixelRatio || 1;

          const canvas = document.createElement('canvas');
          canvas.className = 'mb-4 max-w-full shadow-md';
          canvas.width = Math.floor(viewport.width * outputScale);
          canvas.height = Math.floor(viewport.height * outputScale);
          canvas.style.width = `${Math.floor(viewport.width)}px`;
          canvas.style.height = `${Math.floor(viewport.height)}px`;
          container.appendChild(canvas);

          const canvasContext = canvas.getContext('2d');
          if (!canvasContext) continue;
          const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;
          await page.render({ canvas, canvasContext, viewport, transform }).promise;
        }

        if (!isCancelled) setLoadState('ready');
      } catch (error) {
        console.error('Failed to render PDF:', error);
        if (!isCancelled) setLoadState('error');
      }
    }

    renderPdf();
    return () => {
      isCancelled = true;
    };
  }, [fileUrl]);

  return (
    <div ref={wrapperRef} className="flex w-full flex-col items-center gap-4 rounded-lg bg-slate-100 p-4">
      {loadState === 'loading' && <p className="py-12 text-sm text-slate-500">Loading document...</p>}
      {loadState === 'error' && <p className="py-12 text-sm text-red-600">Failed to load the PDF.</p>}
      <div ref={containerRef} className={loadState === 'ready' ? 'flex w-full flex-col items-center' : 'hidden'} />
    </div>
  );
}
