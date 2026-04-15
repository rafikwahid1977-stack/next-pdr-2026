import { NextRequest, NextResponse } from "next/server";
import { verifyAuth, getAuthRole } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth();
    const role = await getAuthRole();

    if (!auth) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: auth.id,
        username: auth.username,
      },
      role: role,
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
