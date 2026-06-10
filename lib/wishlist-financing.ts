export function hasMaterialFinancingShortfall(
  cashPrice: number,
  totalInstallments: number,
  installmentAmount: number,
) {
  const cashPriceInCents = Math.round(cashPrice * 100);
  const financedTotalInCents =
    Math.round(installmentAmount * 100) * totalInstallments;
  const installmentRoundingUnitInCents = Number.isInteger(installmentAmount)
    ? 100
    : 1;
  const maximumRoundingShortfallInCents =
    totalInstallments * installmentRoundingUnitInCents - 1;

  return (
    financedTotalInCents + maximumRoundingShortfallInCents <
    cashPriceInCents
  );
}
