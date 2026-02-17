import { isAdminAuthenticated } from "@/lib/auth";
import crypto from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

export const runtime = "nodejs";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

function sanitizeFileName(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(request: Request) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const files = formData.getAll("files").filter((item): item is File => item instanceof File);

  if (!files.length) {
    return NextResponse.json({ error: "No files uploaded." }, { status: 400 });
  }

  await mkdir(path.join(process.cwd(), "public", "uploads"), { recursive: true });

  const uploadedUrls: string[] = [];

  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image uploads are allowed." }, { status: 400 });
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: `File ${file.name} exceeds the 8MB size limit.` },
        { status: 400 }
      );
    }

    const extension = path.extname(file.name) || ".png";
    const baseName = path.basename(file.name, extension);
    const safeBaseName = sanitizeFileName(baseName) || "image";
    const finalName = `${Date.now()}-${safeBaseName}-${crypto.randomBytes(4).toString("hex")}${extension}`;
    const outputPath = path.join(process.cwd(), "public", "uploads", finalName);
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(outputPath, bytes);
    uploadedUrls.push(`/uploads/${finalName}`);
  }

  return NextResponse.json({ urls: uploadedUrls });
}
