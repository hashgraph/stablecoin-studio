export function extractAmount(body: string): string | null {
  if (!body || body.length === 0) {
    return null;
  }

  try {
    // First pattern: "de [montant] ar" (e.g., "de 35500 Ar", "de 37 760 AR")
    const patternWithDe = /(?:\d\/\d\s*)?de\s+([\d\s,.]+)\s*ar/i;
    const matchWithDe = body.match(patternWithDe);
    
    if (matchWithDe) {
      // Clean the amount: remove spaces and convert to standard format
      return cleanAmount(matchWithDe[1]);
    }

    // Second pattern: just "[montant] ar" (e.g., "35500 Ar", "37 760 AR")
    const patternSimple = /(?:\d\/\d\s*)?([\d\s,.]+)\s*ar/i;
    const matchSimple = body.match(patternSimple);
    
    if (matchSimple) {
      return cleanAmount(matchSimple[1]);
    }

    return null;
  } catch (error) {
    return null;
  }
}

function cleanAmount(amount: string): string {
  // Remove all spaces from the amount
  // Convert comma to dot if needed (for decimal separator)
  return amount.replace(/\s+/g, '').trim();
}
