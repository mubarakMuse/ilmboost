import LandingPage from "./landing-page";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

export const metadata = getSEOTags({
  title: "Ilm Boost - Make Authentic Islamic Knowledge More Accessible",
  description: "Make authentic Islamic knowledge more accessible. Ilm Boost offers comprehensive online Islamic studies courses including Tafsir, Hadith, and Islamic scholarship for every Muslim learner.",
  keywords: ["Islamic studies", "Quran", "Tafsir", "Hadith", "Islamic education", "online Islamic courses", "Muslim learning", "Islamic scholarship", "Ilm Boost"],
  canonicalUrlRelative: "/",
  openGraph: {
    title: "Ilm Boost - Make Authentic Islamic Knowledge More Accessible",
    description: "Make authentic Islamic knowledge more accessible. Ilm Boost offers comprehensive online Islamic studies courses for every Muslim learner.",
    url: `https://${config.domainName}`,
    siteName: "Ilm Boost",
  },
});

export default function Page() {
  return <LandingPage />;
}
