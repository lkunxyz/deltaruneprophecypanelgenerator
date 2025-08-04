import FAQ from "@/components/blocks/faq";
import Feature1 from "@/components/blocks/feature1";
import Feature3 from "@/components/blocks/feature3";
import MonochromeConverter from "@/components/blocks/monochrome-converter";
import { getMonochromePage } from "@/services/page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  let canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/monochrome`;

  if (locale !== "en") {
    canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/${locale}/monochrome`;
  }

  return {
    title: "Monochrome Converter | UltraThink Edge Detection Tool",
    description: "Convert images to black & white with UltraThink algorithm. Perfect for Deltarune prophecy panels. Free online tool with real-time preview.",
    keywords: "monochrome converter, black and white image converter, Deltarune prophecy panel, image threshold, edge detection, UltraThink algorithm, prophecy mask creator, high contrast image tool",
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function MonochromePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const page = await getMonochromePage(locale);

  return (
    <>
      {page.monochromeConverter && <MonochromeConverter section={page.monochromeConverter} />}
      {page.introduce && <Feature1 section={page.introduce} />}
      {page.usage && <Feature3 section={page.usage} />}
      {page.faq && <FAQ section={page.faq} />}
    </>
  );
}