import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { loginUser } from "@/actions/users";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Username et mot de passe requis" },
        { status: 400 },
      );
    }

    // Login user
    const loginResult = await loginUser(username, password);

    if (!loginResult.success) {
      return NextResponse.json(
        { success: false, message: loginResult.message },
        { status: 401 },
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: loginResult.data?.id,
        username: loginResult.data?.username,
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    // Create response with cookies
    const response = NextResponse.json(
      {
        success: true,
        message: "Connexion réussie",
        data: {
          user: {
            id: loginResult.data?.id,
            username: loginResult.data?.username,
            role: loginResult.data?.role,
          },
        },
      },
      { status: 200 },
    );

    // Set token cookie
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    });

    // Set role cookie
    response.cookies.set("user_role", loginResult.data?.role || "user", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 },
    );
  }
}
