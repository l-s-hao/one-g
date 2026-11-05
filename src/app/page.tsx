import { LDiv } from "@/i18n/Elements";
import { solutions } from "@/data/solutions";
import HomeLanding from "@/components/HomeLanding";
import LegacyOfferingHash from "@/components/LegacyOfferingHash";
import { getConfigurableOfferings } from "@/lib/configurable-offerings";
import { getOfferingNavigation } from "@/lib/offering-navigation";

export default function HomePage() {
  const offerings = getConfigurableOfferings();
  const teleoperation = solutions.find(item => item.id === "teleoperation")!;
  const legacyTargets = Object.fromEntries(offerings.map(({ product, anchor }) => [anchor, getOfferingNavigation(product).overviewHref]));
  legacyTargets["sonic-link"] = teleoperation.detailHref!;
  return <LDiv className="w-full"><LegacyOfferingHash targets={legacyTargets}/><HomeLanding/></LDiv>;
}
