import { solutions } from "@/data/solutions";
import HomeProductShowcase from "@/components/HomeProductShowcase";
import LegacyOfferingHash from "@/components/LegacyOfferingHash";
import { getConfigurableOfferings } from "@/lib/configurable-offerings";
import { getOfferingNavigation } from "@/lib/offering-navigation";

export default function HomePage() {
  const offerings = getConfigurableOfferings();
  const teleoperation = solutions.find(item => item.id === "teleoperation")!;
  const legacyTargets = Object.fromEntries(offerings.map(({ product, anchor }) => [anchor, getOfferingNavigation(product).overviewHref]));
  legacyTargets["sonic-link"] = teleoperation.detailHref!;
  return <div className="w-full"><LegacyOfferingHash targets={legacyTargets}/>{offerings.map(({product,heroImageIndex}, index) => <HomeProductShowcase key={product.id} product={product} heroImageIndex={heroImageIndex} eager={index === 0}/>)}<HomeProductShowcase product={teleoperation.content!} heroImageIndex={0} solutionHref={teleoperation.detailHref}/></div>;
}
