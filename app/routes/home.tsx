import { redirect } from "react-router";
import ContentSection from "~/components/homepage/content";
import Footer from "~/components/homepage/footer";
import Integrations from "~/components/homepage/integrations";
import Pricing from "~/components/homepage/pricing";
import Team from "~/components/homepage/team";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  const title = "AI Accounting Assistant - 24/7 Financial Intelligence";
  const description =
    "Transform your accounting workflow with AI-powered financial analysis, document processing, and automated reporting. Get instant answers to financial queries anytime.";
  const keywords = "AI Accounting, Financial Assistant, Document Processing, Automated Reports, Financial Analysis";
  const siteUrl = "https://www.reactstarter.xyz/";
  const imageUrl =
    "https://jdj14ctwppwprnqu.public.blob.vercel-storage.com/rsk-image-FcUcfBMBgsjNLo99j3NhKV64GT2bQl.png";

  return [
    { title },
    {
      name: "description",
      content: description,
    },

    // Open Graph / Facebook
    { property: "og:type", content: "website" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: imageUrl },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:url", content: siteUrl },
    { property: "og:site_name", content: "AI Accounting Assistant" },
    { property: "og:image", content: imageUrl },

    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    {
      name: "twitter:description",
      content: description,
    },
    { name: "twitter:image", content: imageUrl },
    {
      name: "keywords",
      content: keywords,
    },
    { name: "author", content: "Ras Mic" },
    { name: "favicon", content: imageUrl },
  ];
}

export async function loader(args: Route.LoaderArgs) {
  // For testing: redirect to dashboard
  // TODO: Later, add auth check - if signed in redirect to dashboard, else show landing page
  return redirect('/dashboard');

  // Uncomment below to show landing page
  // return {
  //   isSignedIn: false,
  //   hasActiveSubscription: false,
  //   plans: [],
  // };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <Integrations loaderData={loaderData} />
      <ContentSection />
      <Team />
      <Pricing loaderData={loaderData} />
      <Footer />
    </>
  );
}
