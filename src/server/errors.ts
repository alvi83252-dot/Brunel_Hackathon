import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { fieldErrorsFromZod } from "@/lib/validators";

const PRIVATE = { "Cache-Control": "private, no-store" };

export class AppError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;
  retryAfter?: number;

  constructor(message: string, status = 400, fieldErrors?: Record<string, string>, retryAfter?: number) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.retryAfter = retryAfter;
  }
}

export function jsonError(error: unknown) {
  if (error instanceof AppError) {
    const headers: Record<string, string> = { ...PRIVATE };
    if (error.status === 429 && error.retryAfter) headers["Retry-After"] = String(error.retryAfter);
    return NextResponse.json({ error: error.message, fieldErrors: error.fieldErrors ?? null }, { status: error.status, headers });
  }
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Check the highlighted fields.", fieldErrors: fieldErrorsFromZod(error) },
      { status: 400, headers: PRIVATE },
    );
  }
  console.error(error);
  return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500, headers: PRIVATE });
}
