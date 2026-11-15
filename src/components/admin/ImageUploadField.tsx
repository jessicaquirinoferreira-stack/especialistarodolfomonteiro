import { FolderOpen, Image as ImageIcon, Loader2, Trash2, Upload } from 'lucide-react';
import { useId, useState, type ChangeEvent } from 'react';
import { uploadMediaFile } from '../../lib/firestoreService';
import type { MediaAsset } from '../../types/realestate';
import { SafeImage } from '../common/SafeImage';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (nextUrl: string) => void;
  category: MediaAsset['category'];
  media: MediaAsset[];
  onMediaUpdated?: () => Promise<void> | void;
  previewContain?: boolean;
  helperText?: string;
}

export function ImageUploadField({
  label,
  value,
  onChange,
  category,
  media,
  onMediaUpdated,
  previewContain = false,
  helperText,
}: ImageUploadFieldProps) {
  const inputId = useId();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      const asset = await uploadMediaFile(file, category);
      onChange(asset.url);
      if (onMediaUpdated) {
        await onMediaUpdated();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar foto do dispositivo.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput((v) => !v)}
          className="text-[11px] font-medium text-slate-500 hover:text-[#0B1F3A] underline"
        >
          {showUrlInput ? 'Ocultar URL' : 'Informar URL manualmente'}
        </button>
      </div>

      {helperText && <p className="text-[11px] text-slate-500">{helperText}</p>}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Preview Thumbnail */}
        <div
          className={`relative h-24 w-36 shrink-0 overflow-hidden rounded-lg border border-slate-200 ${
            previewContain ? 'bg-slate-900/5 p-1.5 flex items-center justify-center' : 'bg-white'
          }`}
        >
          {value ? (
            <SafeImage
              src={value}
              alt={label}
              className={
                previewContain ? 'max-h-full max-w-full object-contain' : 'h-full w-full object-cover'
              }
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center text-slate-400">
              <ImageIcon className="h-5 w-5 mb-1" />
              <span className="text-[10px]">Sem foto</span>
            </div>
          )}
        </div>

        {/* Device Upload & Library Controls */}
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <label
              htmlFor={inputId}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#0B1F3A] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#132C4E] ${
                uploading ? 'opacity-60 pointer-events-none' : ''
              }`}
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              <span>
                {uploading ? 'Enviando...' : value ? 'Trocar pelo dispositivo' : 'Enviar do dispositivo'}
              </span>
              <input
                id={inputId}
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>

            {media.length > 0 && (
              <div className="relative inline-flex items-center">
                <FolderOpen className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-slate-500" />
                <select
                  value=""
                  aria-label="Escolher da biblioteca"
                  onChange={(e) => {
                    if (e.target.value) onChange(e.target.value);
                  }}
                  className="rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-3 text-xs font-medium text-slate-700 max-w-[180px]"
                >
                  <option value="">Da biblioteca...</option>
                  {media.map((m) => (
                    <option key={m.id} value={m.url}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {value && (
              <button
                type="button"
                onClick={handleRemove}
                className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Remover</span>
              </button>
            )}
          </div>

          {showUrlInput && (
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://... ou /uploads/..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono text-slate-700"
            />
          )}

          {error && <p className="text-[11px] font-medium text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}
