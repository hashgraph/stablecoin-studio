export type TransactionType =
        | 'DEPOT'
        | 'RETRAIT'
        | 'TRANSFERT_IN'
        | 'TRANSFERT_OUT'
        | 'PAIEMENT'
        | 'ACHAT'
        | 'FRAIS'
        | 'OTHER';

export interface TransactionRow {
        timestamp: Date;
        type: TransactionType;
        amount?: number;
        solde?: number;
        description?: string;
        [key: string]: any;
}

export const IN_TYPES = new Set<TransactionType>(['DEPOT', 'TRANSFERT_IN']);
export const OUT_TYPES = new Set<TransactionType>(['RETRAIT', 'TRANSFERT_OUT', 'PAIEMENT', 'ACHAT', 'FRAIS']);

export function parseCSV(csvText: string): TransactionRow[] {
        const lines = csvText.trim().split('\n');
        if (lines.length < 2) {
                throw new Error('CSV file is empty or invalid');
        }

        const headers = lines[0].split(',').map((h) => h.trim());
        const transactions: TransactionRow[] = [];

        for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map((v) => v.trim());
                const row: any = {};

                headers.forEach((header, index) => {
                        const value = values[index];

                        if (header.toLowerCase().includes('date') || header.toLowerCase().includes('timestamp')) {
                                if (value) {
                                        row.timestamp = new Date(value);
                                }
                        } else if (header.toLowerCase().includes('type')) {
                                if (value) {
                                        row.type = value.toUpperCase() as TransactionType;
                                }
                        } else if (header.toLowerCase().includes('amount') || header.toLowerCase().includes('montant')) {
                                row.amount = parseFloat(value) || 0;
                        } else if (header.toLowerCase().includes('solde') || header.toLowerCase().includes('balance')) {
                                row.solde = parseFloat(value) || 0;
                        } else {
                                row[header] = value;
                        }
                });

                if (row.timestamp && row.type) {
                        transactions.push(row as TransactionRow);
                }
        }

        return transactions;
}
