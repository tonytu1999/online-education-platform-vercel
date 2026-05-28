ALTER TABLE "MentalHealth" ADD COLUMN "sourceSessionId" TEXT;
ALTER TABLE "MentalHealth" ADD COLUMN "statusScore" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "MentalHealth" ADD COLUMN "scoreDelta" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "MentalHealth" ADD COLUMN "statusLabel" TEXT NOT NULL DEFAULT 'NEUTRAL';
ALTER TABLE "MentalHealth" ADD COLUMN "reasonSummary" TEXT NOT NULL DEFAULT '';
ALTER TABLE "MentalHealth" ADD COLUMN "signals" TEXT NOT NULL DEFAULT '';
ALTER TABLE "MentalHealth" ADD COLUMN "analysisModel" TEXT;

CREATE INDEX "MentalHealth_studentId_createdAt_idx" ON "MentalHealth"("studentId", "createdAt");