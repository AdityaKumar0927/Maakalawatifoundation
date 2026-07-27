"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";
import { dangerBtnCls, primaryBtnCls } from "@/components/admin/ui";

export function SubmitButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={cn(className ?? primaryBtnCls)}>
      {pending ? "Saving…" : children}
    </button>
  );
}

/** Submit button that asks for confirmation (deletes, deactivations). */
export function ConfirmSubmit({
  children,
  message,
  className,
}: {
  children: React.ReactNode;
  message: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
      className={cn(className ?? dangerBtnCls)}
    >
      {pending ? "Working…" : children}
    </button>
  );
}