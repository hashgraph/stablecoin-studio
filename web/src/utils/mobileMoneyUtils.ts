export type TransactionType =
        | 'P2P_IN'
        | 'P2P_IN_INTL'
        | 'CASHIN'
        | 'B2W'
        | 'P2P_OUT'
        | 'MERCHANT'
        | 'AIRTIME'
        | 'OTP'
        | 'FAIL'
        | 'OTHER';

export interface TransactionRow {
        timestamp: Date;
        type: TransactionType;
        amount?: number;
        solde?: number;
        description?: string;
        [key: string]: any;
}

export const IN_TYPES = new Set<TransactionType>(['P2P_IN', 'P2P_IN_INTL', 'CASHIN', 'B2W']);
export const OUT_TYPES = new Set<TransactionType>(['P2P_OUT', 'MERCHANT', 'AIRTIME']);

function normalizeType(val: string): TransactionType {
        if (!val) return 'OTHER';
        const v = val.trim().toUpperCase();
        
        const aliases: Record<string, TransactionType> = {
                'P2P_INTERNATIONAL': 'P2P_IN_INTL',
                'P2P_INTERNAT': 'P2P_IN_INTL',
                'AIR TIME': 'AIRTIME',
                'CASH IN': 'CASHIN',
                'B2W ': 'B2W',
                'B2 WALLET': 'B2W',
        };
        
        const normalized = aliases[v] || v;
        
        const validTypes: TransactionType[] = [
                'P2P_IN', 'P2P_IN_INTL', 'CASHIN', 'B2W',
                'P2P_OUT', 'MERCHANT', 'AIRTIME', 'OTP', 'FAIL', 'OTHER'
        ];
        
        return validTypes.includes(normalized as TransactionType) ? (normalized as TransactionType) : 'OTHER';
}

function detectSeparator(content: string): string {
        const candidates = [',', ';', '\t', '|'];
        const counts = candidates.map(sep => ({
                sep,
                count: content.split('\n')[0].split(sep).length
        }));
        
        const best = counts.reduce((max, curr) => curr.count > max.count ? curr : max);
        return best.count > 1 ? best.sep : ',';
}

export function parseCSV(csvText: string): TransactionRow[] {
        const content = csvText.trim();
        const lines = content.split('\n');
        
        if (lines.length < 2) {
                throw new Error('CSV file is empty or invalid');
        }

        const separator = detectSeparator(content);
        const headers = lines[0].split(separator).map((h) => h.trim().toLowerCase());
        const transactions: TransactionRow[] = [];

        const timestampIdx = headers.findIndex(h => h.includes('timestamp') || h === 'date');
        const timeIdx = headers.findIndex(h => h === 'time');
        const typeIdx = headers.findIndex(h => h === 'type');
        const amountIdx = headers.findIndex(h => h.includes('amount') || h.includes('montant'));
        const soldeIdx = headers.findIndex(h => h.includes('solde') || h.includes('balance'));

        for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                
                const values = line.split(separator).map((v) => v.trim());
                
                let timestamp: Date | null = null;
                
                if (timestampIdx >= 0 && values[timestampIdx]) {
                        if (timeIdx >= 0 && values[timeIdx]) {
                                const dateTimeStr = `${values[timestampIdx]} ${values[timeIdx]}`;
                                timestamp = new Date(dateTimeStr);
                        } else {
                                timestamp = new Date(values[timestampIdx]);
                        }
                }
                
                if (!timestamp || isNaN(timestamp.getTime())) {
                        continue;
                }
                
                const type = typeIdx >= 0 && values[typeIdx] 
                        ? normalizeType(values[typeIdx])
                        : 'OTHER';
                
                const amount = amountIdx >= 0 && values[amountIdx]
                        ? parseFloat(values[amountIdx].replace(/[^\d.-]/g, ''))
                        : undefined;
                
                const solde = soldeIdx >= 0 && values[soldeIdx]
                        ? parseFloat(values[soldeIdx].replace(/[^\d.-]/g, ''))
                        : undefined;
                
                const row: TransactionRow = {
                        timestamp,
                        type,
                        amount: !isNaN(amount!) ? amount : undefined,
                        solde: !isNaN(solde!) ? solde : undefined,
                };
                
                headers.forEach((header, idx) => {
                        if (idx !== timestampIdx && idx !== timeIdx && idx !== typeIdx && 
                            idx !== amountIdx && idx !== soldeIdx) {
                                row[header] = values[idx];
                        }
                });
                
                transactions.push(row);
        }

        if (transactions.length === 0) {
                throw new Error('No valid transactions found in CSV');
        }

        return transactions;
}
