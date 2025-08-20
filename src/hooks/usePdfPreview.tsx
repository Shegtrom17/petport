import React from 'react';

type ClientPDFGenerationResult = {
  blob?: Blob;
  pdfBlob?: Blob;
};

type GetPdfFn = () => Promise<ClientPDFGenerationResult>;

export function usePdfPreview(getPdf: GetPdfFn, filename = 'document.pdf') {
  const [open, setOpen] = React.useState(false);
  const [blob, setBlob] = React.useState<Blob | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch/normalize the PDF blob (handles result.blob vs result.pdfBlob)
  const ensureBlob = React.useCallback(async () => {
    if (blob) return blob;
    setLoading(true);
    setError(null);
    try {
      const res = await getPdf();
      const b = res.blob ?? res.pdfBlob;
      if (!b) throw new Error('PDF blob missing from generator result');
      setBlob(b);
      return b;
    } catch (e: any) {
      setError(e?.message || 'Failed to generate PDF');
      throw e;
    } finally {
      setLoading(false);
    }
  }, [blob, getPdf]);

  const view = React.useCallback(async () => {
    try {
      const b = await ensureBlob();
      setOpen(true);
    } catch {
      // As a fallback, try download if preview fails
      await download();
    }
  }, [ensureBlob]);

  const download = React.useCallback(async () => {
    try {
      const b = await ensureBlob();
      const url = URL.createObjectURL(b);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      // no-op
    }
  }, [ensureBlob, filename]);

  const share = React.useCallback(async () => {
    try {
      const b = await ensureBlob();
      const file = new File([b], filename, { type: 'application/pdf' });

      if (navigator.share && (navigator as any).canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: filename });
        return;
      }

      // Fallback: open in a new tab-like flow without window.open (uses anchor click)
      const url = URL.createObjectURL(b);
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      // As a fallback, trigger download
      await download();
    }
  }, [ensureBlob, filename, download]);

  function PreviewDialog() {
    const [url, setUrl] = React.useState<string | null>(null);

    React.useEffect(() => {
      let u: string | null = null;
      if (open && blob) {
        u = URL.createObjectURL(blob);
        setUrl(u);
      }
      return () => {
        if (u) URL.revokeObjectURL(u);
        setUrl(null);
      };
    }, [open, blob]);

    if (!open) return null;

    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}
        onClick={() => setOpen(false)}
      >
        <div
          style={{ width: '90vw', maxWidth: 900, background: '#fff', borderRadius: 8, overflow: 'hidden' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ padding: 12, borderBottom: '1px solid #eee', display: 'flex', gap: 8 }}>
            <button onClick={download}>Download</button>
            <button onClick={share}>Share</button>
            <div style={{ marginLeft: 'auto' }}>
              <button onClick={() => setOpen(false)}>Close</button>
            </div>
          </div>
          <div style={{ height: '80vh', background: '#f6f7f8' }}>
            {loading && (
              <div style={{ padding: 16 }}>Generating…</div>
            )}
            {!loading && error && (
              <div style={{ padding: 16 }}>
                Preview failed: {error}. We'll trigger a download instead.
                <div style={{ marginTop: 8 }}>
                  <button onClick={download}>Download now</button>
                </div>
              </div>
            )}
            {!loading && !error && url && (
              // Try iframe; some iOS versions prefer <object>
              <iframe
                src={url}
                title="PDF Preview"
                style={{ width: '100%', height: '100%', border: 0 }}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  return { view, download, share, PreviewDialog, setOpen, setBlob };
}