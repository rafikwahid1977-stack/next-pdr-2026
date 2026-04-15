import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key",
);

// Fonction pour décoder et vérifier le JWT
async function verifyAuth(token: string) {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as { username?: string; [key: string]: any };
  } catch (err) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Routes publiques qui ne nécessitent pas d'authentification
  const publicRoutes = ["/", "/api/auth/login", "/api/auth/logout"];

  // Vérifier si c'est une route publique
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Vérifier la présence du token dans les cookies
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    // Pas de token, rediriger vers la page publique
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Vérifier la validité du token
  const payload = await verifyAuth(token);
  if (!payload) {
    // Token invalide ou expiré, rediriger vers la page publique
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Protéger les routes /admin - seul Ryad peut y accéder
  if (pathname.startsWith("/admin")) {
    if (payload.username !== "Ryad") {
      // L'utilisateur n'est pas Ryad, rediriger vers la page publique
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Routes privées - vérification d'accès
  const isPrivateRoute =
    pathname.includes("(private)") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/machines") ||
    pathname.startsWith("/electro") ||
    pathname.startsWith("/mecano");

  if (isPrivateRoute) {
    // Token valide, laisser passer et ajouter les infos utilisateur dans le header
    const response = NextResponse.next();
    response.headers.set("X-Auth-Status", "authenticated");
    response.headers.set("X-User-Username", payload.username || "");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
