type VerificationStrength =
  | "HIGH"
  | "MEDIUM"
  | "LOW"
  | "UNVERIFIED";

type Evidence = {
  score: number | null;
  verified: boolean;
  verificationStrength: VerificationStrength;
};

type TrustedProficiencyInput = {
  claimedProficiency: number;
  evidence: Evidence[];
};

type TrustedProficiencyResult = {
  claimedProficiency: number;
  evidenceScore: number | null;
  confidence: VerificationStrength;
  trustedProficiency: number;
};

const verificationWeights: Record<
  VerificationStrength,
  number
> = {
  HIGH: 1,
  MEDIUM: 0.75,
  LOW: 0.5,
  UNVERIFIED: 0,
};

export function calculateTrustedProficiency({
  claimedProficiency,
  evidence,
}: TrustedProficiencyInput): TrustedProficiencyResult {
  const safeClaim = Math.max(
    0,
    Math.min(100, claimedProficiency)
  );

  const verifiedEvidence = evidence.filter(
    (item) =>
      item.verified &&
      item.score !== null &&
      item.verificationStrength !== "UNVERIFIED"
  );

  // No verified evidence:
  // keep the student's claim, but mark it unverified.
  if (verifiedEvidence.length === 0) {
    return {
      claimedProficiency: safeClaim,
      evidenceScore: null,
      confidence: "UNVERIFIED",
      trustedProficiency: safeClaim,
    };
  }

  // Calculate evidence-supported proficiency.
  let weightedScore = 0;
  let totalWeight = 0;

  for (const item of verifiedEvidence) {
    const score = Math.max(
      0,
      Math.min(100, item.score!)
    );

    const weight =
      verificationWeights[
        item.verificationStrength
      ];

    weightedScore += score * weight;
    totalWeight += weight;
  }

  const evidenceScore =
    totalWeight > 0
      ? weightedScore / totalWeight
      : null;

  /*
   * Combine the student's claim with
   * verified evidence.
   *
   * 40% = student's claim
   * 60% = verified evidence
   */
  const trustedProficiency =
    evidenceScore !== null
      ? Math.round(
          safeClaim * 0.4 +
            evidenceScore * 0.6
        )
      : safeClaim;

  /*
   * Overall confidence is determined by
   * the strongest verified evidence.
   */
  const hasHigh = verifiedEvidence.some(
    (item) =>
      item.verificationStrength === "HIGH"
  );

  const hasMedium = verifiedEvidence.some(
    (item) =>
      item.verificationStrength === "MEDIUM"
  );

  const confidence: VerificationStrength =
    hasHigh
      ? "HIGH"
      : hasMedium
      ? "MEDIUM"
      : "LOW";

  return {
    claimedProficiency: safeClaim,
    evidenceScore:
      evidenceScore !== null
        ? Math.round(evidenceScore)
        : null,
    confidence,
    trustedProficiency,
  };
}