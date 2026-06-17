import { NextResponse } from "next/server";
import { getPublicAvailability } from "@/lib/scheduling";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const days = await getPublicAvailability();
    return NextResponse.json({ days });
  } catch (e) {
    console.error("[availability]", e);
    return NextResponse.json({ error: "Erreur de chargement" }, { status: 500 });
  }
}
