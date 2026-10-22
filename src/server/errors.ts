import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { fieldErrorsFromZod } from "@/lib/validators";

export class AppError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(message: string, status = 400, fieldErrors?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export function jsonError(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json({ error: error.message, fieldErrors: error.fieldErrors ?? null }, { status: error.status });
  }
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Check the highlighted fields.", fieldErrors: fieldErrorsFromZod(error) },
      { status: 400 },
    );
  }
  console.error(error);
  return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
}
