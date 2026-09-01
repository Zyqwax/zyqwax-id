import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/server/prisma";
import { hashPassword } from "@/lib/server/password";
import { errorResponse, requirePermission, requireSameOrigin } from "@/lib/server/route-utils";
import { PERMISSION } from "@/lib/server/roles";

export const runtime = "nodejs";

const clientSchema = z.object({
  name: z.string().trim().min(1).max(120),
  redirectUris: z.array(z.string().url().max(2048)).min(1).max(20),
  allowedOrigins: z.array(z.string().url().max(512)).max(20),
});

function publicClient(client: {
  id: string;
  clientId: string;
  name: string;
  redirectUris: string[];
  allowedOrigins: string[];
  createdAt: Date;
}) {
  return client;
}

export async function GET(request: NextRequest) {
  try {
    await requirePermission(request, PERMISSION.oauthClientsRead);
    const clients = await prisma.app.findMany({
      select: { id: true, clientId: true, name: true, redirectUris: true, allowedOrigins: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ clients: clients.map(publicClient) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request);
    await requirePermission(request, PERMISSION.oauthClientsCreate);
    const parsed = clientSchema.safeParse(await request.json());
    if (!parsed.success) return errorResponse(parsed.error);
    const clientSecret = randomBytes(32).toString("base64url");
    const client = await prisma.app.create({
      data: {
        name: parsed.data.name,
        redirectUris: parsed.data.redirectUris,
        allowedOrigins: parsed.data.allowedOrigins,
        secretKeyHash: await hashPassword(clientSecret),
      },
      select: { id: true, clientId: true, name: true, redirectUris: true, allowedOrigins: true, createdAt: true },
    });
    return NextResponse.json({ client: publicClient(client), clientSecret }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
