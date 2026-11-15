import {
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Loader2,
  Plus,
  RefreshCw,
  Star,
  Trash2,
  Upload,
} from 'lucide-react';
import { useId, useState, type ChangeEvent } from 'react';
import { uploadMediaFile } from '../../lib/firestoreService';
import type { MediaAsset } from '../../types/realestate';
import { SafeImage } from '../common/SafeImage';

interface GalleryUploadFieldProps {
  label: string;
  images: string[];
  onChange: (nextImages: string[]) => void;
  category: MediaAsset['category'];
  media: MediaAsset[];
  onMediaUpdated?: () => Promise<void> | void;
  coverUrl?: string;
  onSetAsCover?: (url: string) => void;
}

export function GalleryUploadField({
  label,
  images,
  onChange,
  category,
  media,
  onMediaUpdated,
  coverUrl,
  onSetAsCover,
}: GalleryUploadFieldProps) {
  const multiInputId = useId();
  const [uploadingProgress, setUploadingProgress] = useState('');
  const [replacingIdx, setReplacingIdx] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [manualUrl, setManualUrl] = useState('');

  const handleMultiUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;

    setError('');
    const uploadedUrls: string[] = [];
    try {
      for (let i = 0; i < files.length; i += 1) {
        setUploadingProgress(`Enviando ${i + 1} de ${files.length}...`);
        const asset = await uploadMediaFile(files[i], category);
        uploadedUrls.push(asset.url);
      }
      const next = Array.from(new Set([...images, ...uploadedUrls]));
      onChange(next);
      if (onMediaUpdated) {
        await onMediaUpdated();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar fotos.');
    } finally {
      setUploadingProgress('');
    }
  };

  const handleReplacePhoto = async (idx: number, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setReplacingIdx(idx);
    setError('');
    try {
      const asset = await uploadMediaFile(file, category);
      const next = [...images];
      next[idx] = asset.url;
      onChange(next);
      if (onMediaUpdated) {
        await onMediaUpdated();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao substituir foto.');
    } finally {
      setReplacingIdx(null);
    }
  };

  const handleRemove = (idx: number) => {
    const next = images.filter((_, i) => i !== idx);
    onChange(next);
  };

  const handleMove = (idx: number, direction: -1 | 1) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= images.length) return;
    const next = [...images];
    const [moved] = next.splice(idx, 1);
    next.splice(targetIdx, 0, moved);
    onChange(next);
  };

  const handleAddManualUrl = () => {
    const trimmed = manualUrl.trim();
    if (!trimmed) return;
    if (!images.includes(trimmed)) {
      onChange([...images, trimmed]);
    }
    setManualUrl('');
  };

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-700">
            {label} ({images.length})
          </p>
          <p className="text-[11px] text-slate-500">
            Envie uma ou várias fotos direto do celular/computador (Vercel Blob), reordene ou remova.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label
            htmlFor={multiInputId}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#0B1F3A] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#132C4E] ${
              uploadingProgress ? 'opacity-60 pointer-events-none' : ''
            }`}
          >
            {uploadingProgress ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="h-3.5 w-3.5" />
            )}
            <span>{uploadingProgress || 'Adicionar fotos do dispositivo'}</span>
            <input
              id={multiInputId}
              type="file"
              accept="image/*"
              multiple
              disabled={Boolean(uploadingProgress)}
              onChange={handleMultiUpload}
              className="sr-only"
            />
          </label>

          {media.length > 0 && (
            <div className="relative inline-flex items-center">
              <FolderOpen className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-slate-500" />
              <select
                value=""
                aria-label="Adicionar foto da biblioteca"
                onChange={(e) => {
                  const url = e.target.value;
                  if (url && !images.includes(url)) {
                    onChange([...images, url]);
                  }
                }}
                className="rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-3 text-xs font-medium text-slate-700 max-w-[170px]"
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
        </div>
      </div>

      {error && <p className="text-xs font-medium text-red-600">{error}</p>}

      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((url, idx) => {
            const isCover = coverUrl && coverUrl === url;
            const replaceId = `${multiInputId}-replace-${idx}`;
            return (
              <div
                key={`${url}-${idx}`}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white flex flex-col"
              >
                <div className="relative aspect-[16/10] bg-slate-100">
                  <SafeImage
                    src={url}
                    alt={`Foto ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                  {isCover && (
                    <span className="absolute top-1.5 left-1.5 rounded bg-[#C8102E] px-1.5 py-0.5 text-[10px] font-bold text-white">
                      Capa
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-1 border-t border-slate-100 p-1.5">
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, -1)}
                      title="Mover para esquerda"
                      className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === images.length - 1}
                      onClick={() => handleMove(idx, 1)}
                      title="Mover para direita"
                      className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {onSetAsCover && !isCover && (
                      <button
                        type="button"
                        onClick={() => onSetAsCover(url)}
                        title="Definir como capa"
                        className="rounded p-1 text-amber-600 hover:bg-amber-50"
                      >
                        <Star className="h-3.5 w-3.5" />
                      </button>
                    )}

                    <label
                      htmlFor={replaceId}
                      title="Trocar foto pelo dispositivo"
                      className="cursor-pointer rounded p-1 text-slate-600 hover:bg-slate-100"
                    >
                      {replacingIdx === idx ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3.5 w-3.5" />
                      )}
                      <input
                        id={replaceId}
                        type="file"
                        accept="image/*"
                        disabled={replacingIdx === idx}
                        onChange={(e) => handleReplacePhoto(idx, e)}
                        className="sr-only"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => handleRemove(idx)}
                      title="Remover foto"
                      className="rounded p-1 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-slate-200 bg-white py-5 text-center text-xs text-slate-500">
          Nenhuma foto na galeria ainda. Clique em "Adicionar fotos do dispositivo" para enviar.
        </p>
      )}

      {/* Optional manual URL addition */}
      <div className="flex gap-2 pt-1">
        <input
          type="text"
          value={manualUrl}
          onChange={(e) => setManualUrl(e.target.value)}
          placeholder="Opcional: colar URL externa..."
          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs"
        />
        <button
          type="button"
          onClick={handleAddManualUrl}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Adicionar URL</span>
        </button>
      </div>
    </div>
  );
}
