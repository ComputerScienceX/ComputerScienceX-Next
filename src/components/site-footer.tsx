import SocialsBottomBar from "@/components/socials-bottom-bar";
import { siteConfig } from "@/lib/config";

export default function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-8 pb-24 text-sm text-muted-foreground sm:px-6">
        <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
        <p>{siteConfig.description}</p>
      </div>
      <SocialsBottomBar />
    </footer>
  );
}
