import { HomePage } from "@/components/home/HomePage";
import { getPublicData } from "@/lib/public-data";

export const dynamic = "force-dynamic";

export default async function Page() {
  const data = await getPublicData();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "FASLA",
    description: "Professional English learning platform in Egypt.",
    telephone: "+201201847164",
    address: { "@type": "PostalAddress", addressCountry: "EG", addressLocality: "Cairo" },
    areaServed: "EG",
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HomePage courses={data.courses} testimonials={data.testimonials} settings={data.settings} />
    </>
  );
}
