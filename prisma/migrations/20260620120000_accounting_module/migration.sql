-- CreateTable
CREATE TABLE "AccountingSettings" (
  "id" TEXT NOT NULL,
  "proAccountId" TEXT,
  "country" TEXT NOT NULL DEFAULT 'FR',
  "currency" TEXT NOT NULL DEFAULT 'EUR',
  "vatEnabled" BOOLEAN NOT NULL DEFAULT true,
  "defaultVatRateBps" INTEGER NOT NULL DEFAULT 2000,
  "incomeTaxRateBps" INTEGER NOT NULL DEFAULT 1500,
  "socialContributionRateBps" INTEGER NOT NULL DEFAULT 2200,
  "employerContributionRateBps" INTEGER NOT NULL DEFAULT 4200,
  "fiscalYearStartMonth" INTEGER NOT NULL DEFAULT 1,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "AccountingSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountingSale" (
  "id" TEXT NOT NULL,
  "proAccountId" TEXT,
  "soldAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "customerName" TEXT,
  "label" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'AUTRE',
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "unitPriceCents" INTEGER NOT NULL,
  "unitCostCents" INTEGER NOT NULL DEFAULT 0,
  "vatRateBps" INTEGER NOT NULL DEFAULT 2000,
  "paymentMethod" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "AccountingSale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountingExpense" (
  "id" TEXT NOT NULL,
  "proAccountId" TEXT,
  "spentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "label" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'AUTRE',
  "amountCents" INTEGER NOT NULL,
  "deductibleVatCents" INTEGER NOT NULL DEFAULT 0,
  "supplier" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "AccountingExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountingEmployee" (
  "id" TEXT NOT NULL,
  "proAccountId" TEXT,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "role" TEXT,
  "contractType" TEXT,
  "grossMonthlySalaryCents" INTEGER NOT NULL DEFAULT 0,
  "employerContributionRateBps" INTEGER,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "AccountingEmployee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountingPayrollEntry" (
  "id" TEXT NOT NULL,
  "proAccountId" TEXT,
  "employeeId" TEXT NOT NULL,
  "periodStart" TIMESTAMP(3) NOT NULL,
  "periodEnd" TIMESTAMP(3) NOT NULL,
  "grossSalaryCents" INTEGER NOT NULL,
  "employerContributionsCents" INTEGER NOT NULL,
  "netPaidCents" INTEGER NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "AccountingPayrollEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountingSettings_proAccountId_key" ON "AccountingSettings"("proAccountId");

-- CreateIndex
CREATE INDEX "AccountingSettings_proAccountId_idx" ON "AccountingSettings"("proAccountId");

-- CreateIndex
CREATE INDEX "AccountingSale_proAccountId_idx" ON "AccountingSale"("proAccountId");

-- CreateIndex
CREATE INDEX "AccountingSale_soldAt_idx" ON "AccountingSale"("soldAt");

-- CreateIndex
CREATE INDEX "AccountingSale_category_idx" ON "AccountingSale"("category");

-- CreateIndex
CREATE INDEX "AccountingExpense_proAccountId_idx" ON "AccountingExpense"("proAccountId");

-- CreateIndex
CREATE INDEX "AccountingExpense_spentAt_idx" ON "AccountingExpense"("spentAt");

-- CreateIndex
CREATE INDEX "AccountingExpense_category_idx" ON "AccountingExpense"("category");

-- CreateIndex
CREATE INDEX "AccountingEmployee_proAccountId_idx" ON "AccountingEmployee"("proAccountId");

-- CreateIndex
CREATE INDEX "AccountingEmployee_active_idx" ON "AccountingEmployee"("active");

-- CreateIndex
CREATE INDEX "AccountingEmployee_lastName_idx" ON "AccountingEmployee"("lastName");

-- CreateIndex
CREATE INDEX "AccountingPayrollEntry_proAccountId_idx" ON "AccountingPayrollEntry"("proAccountId");

-- CreateIndex
CREATE INDEX "AccountingPayrollEntry_employeeId_idx" ON "AccountingPayrollEntry"("employeeId");

-- CreateIndex
CREATE INDEX "AccountingPayrollEntry_periodStart_idx" ON "AccountingPayrollEntry"("periodStart");

-- AddForeignKey
ALTER TABLE "AccountingSettings" ADD CONSTRAINT "AccountingSettings_proAccountId_fkey" FOREIGN KEY ("proAccountId") REFERENCES "ProAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountingSale" ADD CONSTRAINT "AccountingSale_proAccountId_fkey" FOREIGN KEY ("proAccountId") REFERENCES "ProAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountingExpense" ADD CONSTRAINT "AccountingExpense_proAccountId_fkey" FOREIGN KEY ("proAccountId") REFERENCES "ProAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountingEmployee" ADD CONSTRAINT "AccountingEmployee_proAccountId_fkey" FOREIGN KEY ("proAccountId") REFERENCES "ProAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountingPayrollEntry" ADD CONSTRAINT "AccountingPayrollEntry_proAccountId_fkey" FOREIGN KEY ("proAccountId") REFERENCES "ProAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountingPayrollEntry" ADD CONSTRAINT "AccountingPayrollEntry_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "AccountingEmployee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
