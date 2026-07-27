"use client";

import { useActionState, useEffect, useState } from "react";
import type { Dictionary, Locale } from "@/lib/i18n";
import {
  submitPatientRegistration,
  type PatientFormState,
} from "@/app/[locale]/register-patient/actions";

const inputCls =
  "mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-3 text-ink placeholder:text-ink-faint focus:border-saffron-400 focus:outline-none focus:ring-2 focus:ring-saffron-200";
const labelCls = "block text-sm font-semibold text-ink";

function Field({
  name,
  label,
  error,
  children,
  help,
}: {
  name: string;
  label: string;
  error: boolean;
  children: React.ReactNode;
  help?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className={labelCls}>
        {label}
      </label>
      {children}
      {help && <p className="mt-1 text-xs text-ink-faint">{help}</p>}
      {error && (
        <p className="mt-1 text-xs font-semibold text-cat-health" role="alert">
          ⚠ {label}
        </p>
      )}
    </div>
  );
}

export function PatientForm({
  locale,
  dict,
  responseDays,
}: {
  locale: Locale;
  dict: Dictionary;
  responseDays: string;
}) {
  const p = dict.patient;
  const [state, formAction, pending] = useActionState<PatientFormState, FormData>(
    submitPatientRegistration,
    { status: "idle" }
  );
  const [age, setAge] = useState<string>("");
  const [startedAt, setStartedAt] = useState<number>(0);
  useEffect(() => setStartedAt(Date.now()), []);

  const isMinor = age !== "" && Number(age) < 18;
  const bad = (f: string) =>
    state.status === "error" && state.code === "validation" && !!state.fields?.includes(f);

  if (state.status === "success") {
    return (
      <div className="rounded-3xl border border-forest-200 bg-forest-50 p-10 text-center">
        <p aria-hidden className="text-5xl">
          🙏
        </p>
        <h2 className="font-display mt-4 text-3xl text-forest-800">{p.successTitle}</h2>
        <p className="mx-auto mt-3 max-w-md text-lg leading-relaxed text-forest-900">
          {p.successText}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-8" noValidate>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="startedAt" value={startedAt} />
      {/* Honeypot — humans never see or fill this. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {state.status === "error" && (
        <div
          role="alert"
          className="rounded-2xl border border-cat-health/30 bg-cat-health-soft p-5 font-medium text-cat-health"
        >
          {state.code === "rate"
            ? p.errorRateLimited
            : state.code === "validation"
              ? p.errorValidation
              : p.errorGeneric}
        </div>
      )}

      <fieldset className="space-y-5">
        <legend className="font-display text-2xl text-ink">{p.formHeading}</legend>
        <p className="text-sm text-ink-faint">{p.requiredNote}</p>

        <Field name="fullName" label={p.fullName} error={bad("fullName")}>
          <input id="fullName" name="fullName" required maxLength={100} autoComplete="name" className={inputCls} />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field name="age" label={p.age} error={bad("age")}>
            <input
              id="age"
              name="age"
              type="number"
              required
              min={0}
              max={120}
              inputMode="numeric"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field name="gender" label={p.gender} error={bad("gender")}>
            <select id="gender" name="gender" required defaultValue="" className={inputCls}>
              <option value="" disabled />
              <option value="female">{p.genderF}</option>
              <option value="male">{p.genderM}</option>
              <option value="other">{p.genderO}</option>
              <option value="prefer_not">{p.genderNA}</option>
            </select>
          </Field>
        </div>

        <Field name="phone" label={p.phone} error={bad("phone")} help={p.phoneHelp}>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            maxLength={20}
            autoComplete="tel"
            inputMode="tel"
            className={inputCls}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field name="city" label={p.city} error={bad("city")}>
            <input id="city" name="city" maxLength={100} autoComplete="address-level2" className={inputCls} />
          </Field>
          <Field name="address" label={p.address} error={bad("address")}>
            <input id="address" name="address" maxLength={300} autoComplete="street-address" className={inputCls} />
          </Field>
        </div>

        <Field name="need" label={p.need} error={bad("need")} help={p.needHelp}>
          <textarea id="need" name="need" required rows={5} maxLength={1500} className={inputCls} />
        </Field>

        <Field name="preferredLanguage" label={p.preferredLanguage} error={bad("preferredLanguage")}>
          <select id="preferredLanguage" name="preferredLanguage" defaultValue={locale} className={inputCls}>
            <option value="hi">{p.langHi}</option>
            <option value="en">{p.langEn}</option>
          </select>
        </Field>
      </fieldset>

      {isMinor && (
        <fieldset className="space-y-5 rounded-3xl border border-saffron-200 bg-saffron-50 p-6">
          <legend className="font-display px-2 text-xl text-saffron-900">
            {p.guardianHeading}
          </legend>
          <p className="text-sm leading-relaxed text-saffron-900">{p.guardianIntro}</p>

          <Field name="guardianName" label={p.guardianName} error={bad("guardianName")}>
            <input id="guardianName" name="guardianName" maxLength={100} className={inputCls} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field name="guardianRelation" label={p.guardianRelation} error={bad("guardianRelation")}>
              <input id="guardianRelation" name="guardianRelation" maxLength={50} className={inputCls} />
            </Field>
            <Field name="guardianPhone" label={p.guardianPhone} error={bad("guardianPhone")}>
              <input
                id="guardianPhone"
                name="guardianPhone"
                type="tel"
                maxLength={20}
                inputMode="tel"
                className={inputCls}
              />
            </Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field name="guardianIdType" label={p.guardianIdType} error={bad("guardianIdType")}>
              <input id="guardianIdType" name="guardianIdType" maxLength={40} className={inputCls} />
            </Field>
            <Field
              name="guardianIdRef"
              label={p.guardianIdRef}
              error={bad("guardianIdRef")}
              help={p.guardianIdHelp}
            >
              <input id="guardianIdRef" name="guardianIdRef" maxLength={40} className={inputCls} />
            </Field>
          </div>

          <label className="flex items-start gap-3 text-sm leading-relaxed font-medium text-saffron-950">
            <input
              type="checkbox"
              name="guardianConsent"
              className="mt-1 h-5 w-5 shrink-0 accent-saffron-600"
            />
            <span>{p.guardianConsentLabel}</span>
          </label>
        </fieldset>
      )}

      {/* DPDP standalone notice + consent */}
      <div className="rounded-3xl border border-forest-200 bg-forest-50 p-6">
        <h2 className="font-display text-xl text-forest-800">{p.noticeTitle}</h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-forest-900">
          <p>{p.noticeIntro}</p>
          <p>{p.noticeData}</p>
          <p>{p.noticePurpose}</p>
          <p>{p.noticeRetention}</p>
          <p>{p.noticeRights.replace("{days}", responseDays)}</p>
        </div>
        <label className="mt-5 flex items-start gap-3 leading-relaxed font-medium text-forest-950">
          <input
            type="checkbox"
            name="consent"
            required
            className="mt-1 h-5 w-5 shrink-0 accent-forest-600"
          />
          <span>{p.consentLabel}</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-forest-600 px-8 py-4 text-lg font-semibold text-white shadow-soft transition hover:bg-forest-700 disabled:opacity-60 sm:w-auto"
      >
        {pending ? p.submitting : p.submit}
      </button>
    </form>
  );
}