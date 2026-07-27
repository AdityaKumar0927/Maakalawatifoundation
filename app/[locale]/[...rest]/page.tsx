import { notFound } from "next/navigation";

/** Catch-all: any unknown public path renders the localized 404. */
export default function CatchAll() {
  notFound();
}