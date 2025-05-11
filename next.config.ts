
import type {NextConfig} from 'next';

let supabaseHostname: string | null = null;
if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
    if (url.hostname && url.hostname.trim() !== '') { // Ensure hostname is not empty or whitespace
      supabaseHostname = url.hostname;
    } else {
      console.warn(`NEXT_PUBLIC_SUPABASE_URL ('${process.env.NEXT_PUBLIC_SUPABASE_URL}') resulted in an empty hostname. Supabase images may not work correctly.`);
    }
  } catch (e) {
    console.warn(`Invalid NEXT_PUBLIC_SUPABASE_URL: '${process.env.NEXT_PUBLIC_SUPABASE_URL}'. Error: ${(e as Error).message}`);
  }
}

const remotePatternsList = [
  {
    protocol: 'https',
    hostname: 'picsum.photos',
    port: '',
    pathname: '/**',
  },
];

if (supabaseHostname) {
  remotePatternsList.push({
    protocol: 'https',
    hostname: supabaseHostname,
    port: '',
    pathname: '/storage/v1/object/public/**',
  });
} else {
  console.warn("Supabase hostname for next/image remotePatterns could not be determined. Ensure NEXT_PUBLIC_SUPABASE_URL is correctly set.");
}

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: remotePatternsList,
  },
};

export default nextConfig;
