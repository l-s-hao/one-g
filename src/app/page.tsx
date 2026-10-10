import { LDiv } from "@/i18n/Elements";
import { solutions } from "@/data/solutions";
import HomeTechTextHero from "@/components/HomeTechTextHero";
import HomeProductShowcase from "@/components/HomeProductShowcase";
import LegacyOfferingHash from "@/components/LegacyOfferingHash";
import { getConfigurableOfferings } from "@/lib/configurable-offerings";
import { getOfferingNavigation } from "@/lib/offering-navigation";

export default function HomePage() {
  const offerings = getConfigurableOfferings();
  const teleoperation = solutions.find(item => item.id === "teleoperation")!;
  const legacyTargets = Object.fromEntries(offerings.map(({ product, anchor }) => [anchor, getOfferingNavigation(product).overviewHref]));
  legacyTargets["sonic-link"] = teleoperation.detailHref!;
  return <LDiv className="w-full"><LegacyOfferingHash targets={legacyTargets}/><HomeTechTextHero/>{offerings.map(({product,heroImageIndex}, index) => <HomeProductShowcase key={product.id} product={product} heroImageIndex={heroImageIndex} eager={index === 0}/>)}<HomeProductShowcase product={teleoperation.content!} heroImageIndex={0} solutionHref={teleoperation.detailHref}/></LDiv>;
}
