"use client";

import { siteConfig } from "@/lib/config";
import { motion } from "framer-motion";
import Link from "next/link";

export default function SocialsBottomBar() {
  if (!siteConfig.socialBar?.length) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="mx-auto w-fit rounded-full border bg-background/90 px-3 py-2 shadow-lg backdrop-blur"
      >
        <div className="flex items-center gap-1 sm:gap-2">
          {siteConfig.socialBar.map((item) => (
            <motion.div key={item.label} whileHover={{ y: -2, scale: 1.06 }} whileTap={{ scale: 0.96 }}>
              <Link
                href={item.href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={item.label}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border text-base text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.icon}
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
