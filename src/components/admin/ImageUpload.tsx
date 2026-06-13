'use client';

import { useRef, useState } from 'react';

// Click/drop to upload images; submits the resulting public path(s) via a
// hidden input named `name`. multiple=true keeps a list (for product galleries).
export default function ImageUpload({
  name,
  multiple = false,
  defaultValue = '',
}: {
  name: string;
  multiple?: boolean;
  defaultValue?: string;
}) {
  const [paths, setPaths] = useState<string[]>(
    defaultValue ? defaultValue.split(/[\n,]/).map((s) => s.trim()).filter(Boolean) : [],
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setBusy(true);
    const next = [...paths];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append('file', file);
      try {
        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (res.ok && data.path) {
          if (multiple) next.push(data.path);
          else next.splice(0, next.length, data.path);
        } else {
          setError(data.error ?? 'upload_failed');
        }
      } catch {
        setError('upload_failed');
      }
      if (!multiple) break;
    }
    setPaths(next);
    setBusy(false);
  }

  function removeAt(i: number) {
    setPaths((p) => p.filter((_, idx) => idx !== i));
  }

  return (
    <div>
      <input type="hidden" name={name} value={paths.join(', ')} />

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        className="cursor-pointer border border-dashed border-ink/20 hover:border-accent/50 bg-ink/[0.03] px-4 py-6 text-center transition-colors"
      >
        <div className="font-mono text-[11px] text-ink/50">
          {busy ? 'Uploading…' : 'Click or drop image' + (multiple ? 's' : '') + ' here'}
        </div>
        <div className="font-mono text-[9px] text-ink/30 mt-1">JPG · PNG · WebP · max 8MB</div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && <div className="font-mono text-[10px] text-red-400/80 mt-2">{error}</div>}

      {paths.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {paths.map((p, i) => (
            <div key={p + i} className="relative w-16 h-16 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p} alt="" className="w-full h-full object-cover border border-ink/15" />
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label="Remove"
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-bg border border-ink/30 text-ink/70 text-[11px] flex items-center justify-center hover:text-red-400 hover:border-red-400/50"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
