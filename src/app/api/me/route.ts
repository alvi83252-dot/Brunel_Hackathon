import { NextResponse } from "next/server";
import { jsonError } from "@/server/errors";
import { requireUser } from "@/server/guards";

export async function GET() {
  try {
    const user = await requireUser();
    return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    return jsonError(error);
  }
}
