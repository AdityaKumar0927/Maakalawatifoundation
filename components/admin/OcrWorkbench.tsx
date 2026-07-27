"use client";

import { useRef, useState } from "react";
import { saveVisitorRecords } from "@/app/admin/(panel)/visitors/actions";
import { inputCls } from "@/components/admin/ui";
import { toDateInputValue } from "@/lib/utils";

interface Row {
  visitDate: string;
  name: string;
  phone: string;
  address: string;
  purpose: string;
  notes: string;
}

function emptyRow(): Row {
  return {
    visitDate: toDateInputValue(new Date()),
    name: "",
    phone: "",
    address: "",
    purpose: "",
    notes: "",
  };
}

/**
 * Digitises a photographed page of the physical visitor record book.
 * OCR runs entirely in the browser (self-hosted Tesseract, English+Hindi) —
 * the photo never has to leave the admin's device unless they choose to
 * attach it to the saved records.
 */
export function OcrWorkbench() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([emptyRow()]);
  const [attach, setAttach] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  function onPickFile(f: File | null) {
    setFile(f);
    setOcrText("");
    setOcrError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(f ? URL.createObjectURL(f) : null);
  }

  async function runOcr() {
    if (!file) return;
    setProgress(0);
    setOcrError(null);
    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker(["eng", "hin"], 1, {
        workerPath: "/ocr/worker.min.js",
        corePath: "/ocr/core",
        langPath: "/ocr/lang",
        logger: (m) => {
          if (m.status === "recognizing text") setProgress(m.progress);
        },
      });
      const result = await worker.recognize(file);
      setOcrText(result.data.text.trim());
      await worker.terminate();
    } catch {
      setOcrError(
        "Could not read the image. Try a sharper, well-lit photo taken straight above the page."
      );
    } finally {
      setProgress(null);
    }
  }

  function setCell(index: number, key: keyof Row, value: string) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  }

  async function save() {
    const filled = rows.filter((r) => r.name.trim());
    if (filled.length === 0) {
      setSaveError("Add at least one row with a visitor name.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const formData = new FormData();
      formData.set("rows", JSON.stringify(filled));
      if (attach && file) formData.set("sourceImage", file);
      await saveVisitorRecords(formData); // redirects on success
    } catch (e) {
      // Next navigations surface as errors with a NEXT_* digest — rethrow
      // only those; every real failure must reach the user as feedback.
      if (
        e &&
        typeof e === "object" &&
        "digest" in e &&
        typeof (e as { digest: unknown }).digest === "string" &&
        (e as { digest: string }).digest.startsWith("NEXT_")
      ) {
        throw e;
      }
      setSaveError("Saving failed. Please try again.");
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Step 1 — photo */}
      <section className="rounded-2xl border border-line bg-white p-6 shadow-soft">
        <h2 className="font-display text-lg text-ink">1 · Photograph the page</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Take the photo from straight above, in good light. The text is read on this device —
          nothing is uploaded unless you choose to attach the photo below.
        </p>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
          className="mt-4 w-full text-sm text-ink-soft file:mr-3 file:rounded-full file:border-0 file:bg-saffron-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-saffron-800"
        />
        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Visitor book page preview"
            className="mt-4 max-h-96 rounded-xl border border-line object-contain"
          />
        )}
        {file && (
          <button
            type="button"
            onClick={runOcr}
            disabled={progress !== null}
            className="mt-4 rounded-full bg-forest-600 px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-forest-700 disabled:opacity-60"
          >
            {progress !== null
              ? `Reading… ${Math.round(progress * 100)}%`
              : "Read text from photo (English + हिन्दी)"}
          </button>
        )}
        {ocrError && (
          <p role="alert" className="mt-3 rounded-xl bg-cat-health-soft p-3 text-sm font-medium text-cat-health">
            {ocrError}
          </p>
        )}
        {ocrText && (
          <div className="mt-4">
            <p className="text-sm font-semibold text-ink">Recognised text (copy into the rows below)</p>
            <textarea
              value={ocrText}
              onChange={(e) => setOcrText(e.target.value)}
              rows={8}
              className={inputCls}
            />
          </div>
        )}
      </section>

      {/* Step 2 — structured rows */}
      <section className="rounded-2xl border border-line bg-white p-6 shadow-soft">
        <h2 className="font-display text-lg text-ink">2 · Enter the entries</h2>
        <div className="mt-4 space-y-4">
          {rows.map((row, i) => (
            <div key={i} className="rounded-xl border border-line bg-cream-50 p-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <label className="block text-xs font-semibold text-ink-soft">
                  Visit date
                  <input
                    type="date"
                    value={row.visitDate}
                    onChange={(e) => setCell(i, "visitDate", e.target.value)}
                    className={inputCls}
                  />
                </label>
                <label className="block text-xs font-semibold text-ink-soft">
                  Name *
                  <input
                    value={row.name}
                    maxLength={100}
                    onChange={(e) => setCell(i, "name", e.target.value)}
                    className={inputCls}
                  />
                </label>
                <label className="block text-xs font-semibold text-ink-soft">
                  Phone
                  <input
                    value={row.phone}
                    maxLength={20}
                    onChange={(e) => setCell(i, "phone", e.target.value)}
                    className={inputCls}
                  />
                </label>
                <label className="block text-xs font-semibold text-ink-soft">
                  Address
                  <input
                    value={row.address}
                    maxLength={300}
                    onChange={(e) => setCell(i, "address", e.target.value)}
                    className={inputCls}
                  />
                </label>
                <label className="block text-xs font-semibold text-ink-soft">
                  Purpose of visit
                  <input
                    value={row.purpose}
                    maxLength={300}
                    onChange={(e) => setCell(i, "purpose", e.target.value)}
                    className={inputCls}
                  />
                </label>
                <label className="block text-xs font-semibold text-ink-soft">
                  Notes
                  <input
                    value={row.notes}
                    maxLength={500}
                    onChange={(e) => setCell(i, "notes", e.target.value)}
                    className={inputCls}
                  />
                </label>
              </div>
              {rows.length > 1 && (
                <button
                  type="button"
                  onClick={() => setRows((prev) => prev.filter((_, j) => j !== i))}
                  className="mt-3 text-xs font-semibold text-cat-health hover:underline"
                >
                  Remove this row
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setRows((prev) => [...prev, emptyRow()])}
          className="mt-4 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-ink-soft transition hover:text-ink"
        >
          + Add another row
        </button>
      </section>

      {/* Step 3 — save */}
      <section className="rounded-2xl border border-line bg-white p-6 shadow-soft">
        <h2 className="font-display text-lg text-ink">3 · Save</h2>
        {file && (
          <label className="mt-3 flex items-center gap-2 text-sm font-medium text-ink">
            <input
              type="checkbox"
              checked={attach}
              onChange={(e) => setAttach(e.target.checked)}
              className="h-4 w-4 accent-saffron-600"
            />
            Also store the page photo with these records
          </label>
        )}
        {saveError && (
          <p role="alert" className="mt-3 rounded-xl bg-cat-health-soft p-3 text-sm font-medium text-cat-health">
            {saveError}
          </p>
        )}
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="mt-4 rounded-full bg-saffron-600 px-7 py-3 font-semibold text-white shadow-soft transition hover:bg-saffron-700 disabled:opacity-60"
        >
          {saving ? "Saving…" : `Save ${rows.filter((r) => r.name.trim()).length || ""} record(s)`}
        </button>
      </section>
    </div>
  );
}