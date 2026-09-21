import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/invitat", "/reserva"];
// Un usuari autenticat NO s'ha de fer fora d'aquests camins públics: "/invitat" el
// visita algú que acaba d'acceptar una invitació i ja té sessió, però encara no ha
// establert la contrasenya. "/reserva" és la pàgina pública de reserva d'un tenant,
// que el mateix personal del coworking també ha de poder veure estant connectat.
const NO_REDIRECT_IF_AUTHED = ["/invitat", "/reserva"];

export async function updateSession(request: NextRequest) {
  // El reproductor de música ("/musica" i el seu service worker
  // "/musica-sw.js") no té res a veure amb els comptes: surt d'aquí abans de
  // crear el client de Supabase. Així funciona igual amb la sessió oberta o
  // sense, no paga una crida d'autenticació a cada petició, i sobretot
  // s'obre en local encara que no hi hagi cap variable d'entorn configurada.
  if (request.nextUrl.pathname.startsWith("/musica")) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublicPath = PUBLIC_PATHS.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  if (!user && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const evitaRedireccio = NO_REDIRECT_IF_AUTHED.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  if (user && isPublicPath && !evitaRedireccio) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}
