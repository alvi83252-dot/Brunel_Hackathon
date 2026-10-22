import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const path = req.nextUrl.pathname;
  const role = req.auth?.user?.role;
  const signedIn = Boolean(req.auth?.user);
  const isApi = path.startsWith("/api");
  const judgeArea =
    path.startsWith("/judge") ||
    path.startsWith("/api/scores") ||
    path.startsWith("/api/leaderboard") ||
    path.startsWith("/api/awards") ||
    path.startsWith("/api/settings");
  const participantArea =
    path.startsWith("/participant") ||
    path.startsWith("/api/teams") ||
    path.startsWith("/api/projects") ||
    path.startsWith("/api/submissions");
  const signedInArea = judgeArea || participantArea || path.startsWith("/api/notifications") || path === "/api/me";

  if (signedInArea && !signedIn) {
    if (isApi) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }

  if (judgeArea && role !== "JUDGE") {
    if (isApi) return NextResponse.json({ error: "Judges only." }, { status: 403 });
    return NextResponse.redirect(new URL("/participant", req.nextUrl.origin));
  }

  if (participantArea && role !== "PARTICIPANT") {
    if (isApi) return NextResponse.json({ error: "Participants only." }, { status: 403 });
    return NextResponse.redirect(new URL("/judge", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/participant/:path*",
    "/judge/:path*",
    "/api/teams",
    "/api/teams/:path*",
    "/api/projects",
    "/api/projects/:path*",
    "/api/submissions",
    "/api/submissions/:path*",
    "/api/scores",
    "/api/scores/:path*",
    "/api/leaderboard",
    "/api/leaderboard/:path*",
    "/api/awards",
    "/api/awards/:path*",
    "/api/notifications",
    "/api/notifications/:path*",
    "/api/settings",
    "/api/settings/:path*",
    "/api/me",
  ],
};
