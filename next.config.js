/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  images: {
    domains: ["yt3.ggpht.com"],
  },
  async redirects() {
    return [
      {
        source: "/discord",
        destination: "https://discord.com/invite/WdppARHgcy",
        permanent: true,
      },
      {
        source: "/github",
        destination: "https://github.com/holodata",
        permanent: true,
      },
      {
        source: "/vtuber-1b",
        destination: "https://github.com/holodata/vtuber-livechat",
        permanent: false,
      },
    ];
  },
};
