import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');
const cmsUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;

const remotePatterns = [];

if (cmsUrl) {
    try {
        const parsedCmsUrl = new URL(cmsUrl);
        remotePatterns.push({
            protocol: parsedCmsUrl.protocol.replace(':', ''),
            hostname: parsedCmsUrl.hostname,
            port: parsedCmsUrl.port || '',
            pathname: '/assets/**',
        });
    } catch {
        // Ungueltige CMS-URL ignorieren, lokale Assets bleiben weiterhin nutzbar.
    }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },
    images: {
        remotePatterns,
    },
};

export default withNextIntl(nextConfig);
