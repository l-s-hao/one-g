import HomeProductShowcase from "@/components/HomeProductShowcase";
import LegacyOfferingHash from "@/components/LegacyOfferingHash";
import { getConfigurableOfferings } from "@/lib/configurable-offerings";
import { getOfferingNavigation } from "@/lib/offering-navigation";

export default function HomePage() {
  const offerings = getConfigurableOfferings();
  const legacyTargets = Object.fromEntries(offerings.map(({ product, anchor }) => [anchor, getOfferingNavigation(product).overviewHref]));
  return <div className="w-full"><LegacyOfferingHash targets={legacyTargets}/>{offerings.map(({product,heroImageIndex}, index) => <HomeProductShowcase key={product.id} product={product} heroImageIndex={heroImageIndex} eager={index === 0}/>)}</div>;
}
