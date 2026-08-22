import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createOAuthState } from "@/lib/oauth-state";

function settingsUrl(request: NextRequest, message?: string) {
  const url = new URL("/settings/google", process.env.APP_BASE_URL || request.nextUrl.origin);
  if (message) url.searchParams.set("error", message);
  return url;
}

export async function GET(request: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.redirect(new URL("/login", process.env.APP_BASE_URL || request.nextUrl.origin));

  const base = process.env.APP_BASE_URL;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!base || !clientId || !clientSecret) {
    return NextResponse.redirect(settingsUrl(request, "Google Drive needs your public HTTPS domain, client ID, and client secret."));
  }

  if (!base.startsWith("https://")) {
    return NextResponse.redirect(settingsUrl(request, "Google only accepts a secure HTTPS domain. A CasaOS IP address cannot be used for Drive sign-in."));
  }

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", `${base}/api/integrations/google/callback`);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "https://www.googleapis.com/auth/drive.metadata.readonly");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("state", await createOAuthState(user.id));

  return NextResponse.redirect(url);
}

