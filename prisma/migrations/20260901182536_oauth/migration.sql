-- CreateTable
CREATE TABLE "OAuthConsentRequest" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "redirectUri" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "state" TEXT,
    "codeChallenge" TEXT NOT NULL,
    "codeChallengeMethod" TEXT NOT NULL DEFAULT 'S256',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OAuthConsentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OAuthConsentRequest_tokenHash_key" ON "OAuthConsentRequest"("tokenHash");

-- CreateIndex
CREATE INDEX "OAuthConsentRequest_userId_used_expiresAt_idx" ON "OAuthConsentRequest"("userId", "used", "expiresAt");

-- AddForeignKey
ALTER TABLE "OAuthConsentRequest" ADD CONSTRAINT "OAuthConsentRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OAuthConsentRequest" ADD CONSTRAINT "OAuthConsentRequest_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE CASCADE ON UPDATE CASCADE;
