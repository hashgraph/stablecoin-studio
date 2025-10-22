export function classifyMessage(body: string): string {
  if (!body || body.length === 0) {
    return 'AUTRE';
  }

  // B2W: Bank to Wallet transfers
  if (/^You have transfere?d\s+[\d\s.,]+\s*AR\s+on your Orange Money account from your account/i.test(body)) {
    return 'B2W';
  }

  // P2P_OUT: Outgoing peer-to-peer transfers
  if (/^\s*Votre\s+transfert\s+de\s+[\d\s.,]+\s*A?R?\s+vers\s+(?:[^()]+\(0[2-9]\d{8}\)|0[2-9]\d{8})/i.test(body)) {
    return 'P2P_OUT';
  }
  if (/^[\d\s,.]+\s*Ar\s+envoye\s+a\s+.+$/i.test(body)) {
    return 'P2P_OUT';
  }

  // P2P_IN_INTL: International incoming transfers
  if (/^\s*Vous\s+avez\s+recu\s+un\s+transfert\s+international\s+de\s+[\d\s.,]+\s*A?R?/i.test(body)) {
    return 'P2P_IN_INTL';
  }

  // P2P_IN: Incoming peer-to-peer transfers
  if (/^\s*Vous\s+avez\s+r[eçc]u\s+un\s+transfert\s+[\d\s.,]+\s*A?R?\s+venant\s+du\s+0[2-9]\d{8}/i.test(body)) {
    return 'P2P_IN';
  }
  if (/^Vous\s+avez\s+recu\s+[\d\s,.]+\s*Ar\s+de\s+la\s+part\s+.+$/i.test(body)) {
    return 'P2P_IN';
  }
  if (/^Vous\s+avez\s+recu\s+un\s+transfert\s+de\s+[\d\s,.]+\s*Ar\s+venant\s+du\s+[\d+]+/i.test(body)) {
    return 'P2P_IN';
  }
  if (/^(?:\d+\/\d+\s+)?([\d\s]+) ?Ar recu de ([\w\s]+) \((\d+)\) le (\d{2}\/\d{2}\/\d{2}) a (\d{2}:\d{2})\. Raison: (.+?)\. Solde ?: ([\d\s]+) ?Ar\. Ref: (\d+)$/i.test(body)) {
    return 'P2P_IN';
  }
  if (/^Vous\s+avez\s+reçu\s+un\s+transfert\s+de\s+[\d\s,.]+\s*AR\s+venant\s+du\s+0[2-9]\d{8}/i.test(body)) {
    return 'P2P_IN';
  }

  // MERCHANT: Merchant payments
  if (/^\s*Votre\s+paiement\s+de\s+[\d\s.,]+\s*A?R?\s+aupr[eè]s\s+de\s+/i.test(body)) {
    return 'MERCHANT';
  }
  if (/^Votre\s+paiement\s+aupres\s+de\s+[^,]+,\s+facture\s+numero\s+\d+\s+de\s+[\d\s,.]+Ar\s+est\s+reussi/i.test(body)) {
    return 'MERCHANT';
  }
  if (/^Paiement\s+facture\s+ORANGE\s+\d+\s+réussi;.*[\d\s,.]+Ar/i.test(body)) {
    return 'MERCHANT';
  }

  // CASHIN: Cash deposits
  if (/^\s*Votre\s+d[ée]pot\s+de\s+[\d\s.,]+\s*Ar\s+par\s+le\s+0[2-9]\d{8}\s+est\s+r[ée]ussi/i.test(body)) {
    return 'CASHIN';
  }

  // AIRTIME: Airtime purchases
  if (/(achat\s+de\s+credit|Be\s+connect|t[ée]l[ée]phone\s+a\s+[ée]t[ée]\s+recharg[ée]|Piement via MVola)/i.test(body)) {
    return 'AIRTIME';
  }

  // FAIL: Failed transactions
  if (/La\s+transaction\s+a\s+echou[eé].*(annuler|code\s+secret\s+saisi\s+est\s+incorrect)/i.test(body)) {
    return 'FAIL';
  }

  // OTP: One-time passwords and verification codes
  if (/(Connexion\s+application\s+Orange\s+Money\s+r[ée]ussie|<#>Orange\s+Money:\s+(Verification\s+automatique|Automatic\s+verification)|You\s+are\s+now\s+connected\s+to\s+the\s+Orange\s+Money\s+App)/i.test(body)) {
    return 'OTP';
  }

  // Default: Other types
  return 'AUTRE';
}
