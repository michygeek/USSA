'use client';

import { Button } from '@/components/ui/button';

export function PrintCertificateButton() {
  return (
    <Button variant="gold" onClick={() => window.print()} className="print:hidden">
      Print / Save as PDF
    </Button>
  );
}
