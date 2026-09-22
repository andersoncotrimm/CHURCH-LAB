/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Padrão genérico (não é segredo): permite carregar thumbnails/previews
    // do Storage público de qualquer projeto Supabase via next/image.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        // Só para os PSDs de teste (seed 20260922210000/20260923000000):
        // fotos aleatórias de um serviço público, sem chave. Remover quando
        // os dados de teste forem substituídos por uploads reais.
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
};

export default nextConfig;
