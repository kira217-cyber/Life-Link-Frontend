import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /**
     * Avatars are the only remote images here, and they arrive from two
     * places: Google, for anyone who signed in with it, and whatever URL a
     * person typed into their own profile.
     *
     * The list is explicit rather than a `**` wildcard on purpose — a
     * wildcard would turn the image optimiser into an open proxy that anyone
     * could point at any host on the internet and have this deployment fetch
     * and re-serve. An avatar from a host not listed falls back to the
     * person's initials, which is what happens when they have no avatar at
     * all, so nothing breaks.
     */
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
      { protocol: "https", hostname: "www.gravatar.com" },
      { protocol: "https", hostname: "secure.gravatar.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "ui-avatars.com" },
    ],
  },
};

export default nextConfig;
