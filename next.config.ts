import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Headers de sécurité HTTP appliqués à toutes les routes.
   * Ces headers réduisent la surface d'attaque XSS, clickjacking et MIME sniffing.
   */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Empêche le MIME sniffing (ex: servir un JS déguisé en image)
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Bloque l'intégration dans des iframes → prévient le clickjacking
          { key: "X-Frame-Options", value: "DENY" },
          // Protection XSS des navigateurs anciens (redondant avec CSP mais sans risque)
          { key: "X-XSS-Protection", value: "1; mode=block" },
          // Contrôle les informations envoyées dans l'en-tête Referer
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Empêche la mise en cache des pages protégées par les proxies intermédiaires
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
