"use client";

import { useState, useRef } from "react";

interface PhotoUploadProps {
  onUpload: (url: string) => void;
  currentUrl: string;
}

export function PhotoUpload({ onUpload, currentUrl }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Valider le type et la taille
    if (!file.type.startsWith("image/")) {
      setError("Le fichier doit etre une image");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("La photo ne doit pas depasser 5 Mo");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de l'upload");
      }

      const data = await res.json();
      onUpload(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        {currentUrl ? (
          <img
            src={currentUrl}
            alt="Photo eleve"
            className="h-16 w-16 rounded-full object-cover border border-neutral-200"
          />
        ) : (
          <div className="h-16 w-16 rounded-full bg-neutral-50 border border-neutral-200 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          </div>
        )}
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="h-9 px-4 bg-white text-neutral-900 text-sm rounded-lg font-medium border border-neutral-200 hover:bg-neutral-50 transition-colors disabled:opacity-50"
          >
            {uploading ? "Upload en cours..." : currentUrl ? "Changer la photo" : "Ajouter une photo"}
          </button>
          <p className="text-xs text-neutral-400 mt-1">JPG, PNG. Max 5 Mo.</p>
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
