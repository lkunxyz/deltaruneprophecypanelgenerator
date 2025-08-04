import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    "/",
    "/(en|zh|es-AR|es-CL|es-MX|es-ES|pl-PL|pt-BR|fr-FR|tr-TR|en-PH|it-IT|de-DE)/:path*",
    "/((?!privacy-policy|terms-of-service|api/|_next|_vercel|.*\\..*).*)",
  ],
};
