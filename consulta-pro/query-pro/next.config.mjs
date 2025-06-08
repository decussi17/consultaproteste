/** @type {import('next').NextConfig} */
const nextConfig = {
  redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: true,
      },



    ];
  }
};

export default nextConfig;
