import type { TransactionRow } from './mobileMoneyUtils';

export interface WebhookMessage {
  dbId: number;
  id: string;
  body: string;
  sender: string;
  timestamp: string;
  sent: boolean;
  receivedAt: string;
  type: string;
  amount: number | null;
  balance: number | null;
}

export function convertWebhooksToTransactions(webhooks: WebhookMessage[]): TransactionRow[] {
  return webhooks
    .filter(webhook => {
      if (!webhook.timestamp) return false;
      
      const excludedTypes = ['OTP', 'FAIL', 'AUTRE'];
      if (excludedTypes.includes(webhook.type)) return false;
      
      return true;
    })
    .map(webhook => {
      const transaction: TransactionRow = {
        timestamp: new Date(webhook.timestamp),
        type: webhook.type as any,
        amount: webhook.amount !== null ? webhook.amount : undefined,
        solde: webhook.balance !== null ? webhook.balance : undefined,
        description: webhook.body,
      };
      
      return transaction;
    })
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

export async function fetchWebhookTransactions(): Promise<TransactionRow[]> {
  const apiUrl = process.env.REACT_APP_BACKEND_URL || '';
  const response = await fetch(`${apiUrl}/webhook/messages`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch webhook messages: ${response.statusText}`);
  }
  
  const data = await response.json();
  const webhooks: WebhookMessage[] = data.messages || [];
  
  return convertWebhooksToTransactions(webhooks);
}
