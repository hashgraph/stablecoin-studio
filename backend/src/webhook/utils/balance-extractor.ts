export function extractBalance(body: string): string | null {
  if (!body || body.length === 0) {
    return null;
  }

  try {
    // Normalize the text: replace non-breaking spaces with regular spaces
    let normalizedBody = body
      .replace(/\u00A0/g, ' ')  // Non-breaking space (CHAR 160)
      .replace(/\u202F/g, ' ')  // Narrow no-break space (CHAR 8239)
      .replace(/\s+/g, ' ');    // Collapse multiple spaces

    // Pattern to match balance: "solde" followed by amount
    // Examples: 
    // - "Nouveau solde: 22541 Ar"
    // - "solde de 58 241 AR"
    // - "Votre solde est de 49,981 Ar"
    // - "Votre nouveau solde est : 49981 AR"
    const balancePattern = /(?:votre\s+)?(?:nouveau\s+)?solde\s*(?:(?:de|:)|\s+(?:est|restant|actuel)\s*(?:de|:)?)\s*((?:\d{1,3}(?:[\s.,]\d{3})+|\d+)(?:[.,]\d{1,2})?)\s*(?:ar|ariary|mga)?\b/i;
    
    const match = normalizedBody.match(balancePattern);
    
    if (match && match[1]) {
      // Clean the balance: remove spaces and dots used as thousand separators
      // Keep comma/dot only if it's a decimal separator
      let balance = match[1];
      
      // Remove all spaces
      balance = balance.replace(/\s+/g, '');
      
      // Remove dots if they're thousand separators (check if comma exists after)
      // Convert comma to dot if it's the decimal separator
      if (balance.includes(',')) {
        balance = balance.replace(/\./g, ''); // Remove dots (thousand separators)
        balance = balance.replace(',', '.'); // Convert comma to dot (decimal)
      } else {
        // No comma, so dots might be thousand separators - remove them
        balance = balance.replace(/\./g, '');
      }
      
      return balance;
    }

    return null;
  } catch (error) {
    return null;
  }
}
