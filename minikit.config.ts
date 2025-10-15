const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {
  accountAssociation: {
    header: "eyJmaWQiOjg1ODkzNiwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDRDMWQ1Y0ZmOTg1MjM2NjRkMjI4ZjEyYmEwQWVEQjIxQTA0Qzc5MDYifQ",
    payload: "eyJkb21haW4iOiJuZXctbWluaS1hcHAtcXVpY2tzdGFydC1zaWxrLXRocmVlLnZlcmNlbC5hcHAifQ",
    signature: "dujx0Q+RGag0lr4Vp0MCW8HApn5aaPDldersl8lngCpUp5OBHyamyKC0JriMBQwO2c0PhL/HXSVTrFIZYOCUqBs="
  },
  miniapp: {
    version: "1",
    name: "your price buddy", 
    subtitle: "check your fav crypto price", 
    description: "utility",
    screenshotUrls: [`${ROOT_URL}/screenshot-portrait.png`],
    iconUrl: `${ROOT_URL}/blue-icon.png`,
    splashImageUrl: `${ROOT_URL}/blue-hero.png`,
    splashBackgroundColor: "#000000",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "social",
    tags: ["marketing", "ads", "quickstart", "waitlist"],
    heroImageUrl: `${ROOT_URL}/blue-hero.png`, 
    tagline: "",
    ogTitle: "",
    ogDescription: "",
    ogImageUrl: `${ROOT_URL}/blue-hero.png`,
  },
  "baseBuilder": {
    "ownerAddress": "0x713c16f062Bbd1f4B365B18CD98642c6c95C5B7b"
  }
} as const;

