import { LDiv } from "@/i18n/Elements";
import { solutions } from "@/data/solutions";
import HomeCollageHero from "@/components/HomeCollageHero";
import HomePreviewProvider from "@/components/HomePreviewProvider";
import HomeProductsPreview from "@/components/HomeProductsPreview";
import HomeSolutionsPreview from "@/components/HomeSolutionsPreview";
import LegacyOfferingHash from "@/components/LegacyOfferingHash";
import { getConfigurableOfferings } from "@/lib/configurable-offerings";
import { getOfferingNavigation } from "@/lib/offering-navigation";

export default function HomePage() {
  const offerings = getConfigurableOfferings();
  const teleoperation = solutions.find(item => item.id === "teleoperation")!;
  const legacyTargets = Object.fromEntries(offerings.map(({ product, anchor }) => [anchor, getOfferingNavigation(product).overviewHref]));
  legacyTargets["sonic-link"] = teleoperation.detailHref!;
  return <LDiv className="w-full"><LegacyOfferingHash targets={legacyTargets}/><HomeCollageHero/><HomePreviewProvider><HomeProductsPreview/><HomeSolutionsPreview/></HomePreviewProvider></LDiv>;
}
