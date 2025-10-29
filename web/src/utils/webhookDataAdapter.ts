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
  let allWebhooks: WebhookMessage[] = [];
  let page = 1;
  let hasMore = true;
  const limit = 500;
  
  console.log('Fetching ALL webhook transactions from database...');
  
  while (hasMore) {
    const response = await fetch(`/webhook/messages?page=${page}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch webhook messages: ${response.statusText}`);
    }
    
    const data = await response.json();
    const webhooks: WebhookMessage[] = data.messages || [];
    
    console.log(`Page ${page}: Loaded ${webhooks.length} webhooks`);
    
    allWebhooks = allWebhooks.concat(webhooks);
    
    hasMore = webhooks.length === limit;
    page++;
  }
  
  console.log(`✅ Total webhooks loaded: ${allWebhooks.length}`);
  const transactions = convertWebhooksToTransactions(allWebhooks);
  console.log(`✅ Converted to ${transactions.length} financial transactions`);
  
  return transactions;
}
