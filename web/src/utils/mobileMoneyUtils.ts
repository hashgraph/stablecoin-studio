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
        | 'AUTRE'
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
                'P2P_OUT', 'MERCHANT', 'AIRTIME', 'OTP', 'FAIL', 'AUTRE', 'OTHER'
        ];
        
        return validTypes.includes(normalized as TransactionType) ? (normalized as TransactionType) : 'OTHER';
}

function parseFrenchDate(dateStr: string, timeStr?: string): Date | null {
        const monthMap: Record<string, number> = {
                'janvier': 0, 'jan': 0, 'février': 1, 'fév': 1, 'fevrier': 1, 'fev': 1,
                'mars': 2, 'mar': 2, 'avril': 3, 'avr': 3, 'mai': 4,
                'juin': 5, 'juillet': 6, 'juil': 6, 'août': 7, 'aout': 7,
                'septembre': 8, 'sept': 8, 'octobre': 9, 'oct': 9,
                'novembre': 10, 'nov': 10, 'décembre': 11, 'déc': 11, 'decembre': 11, 'dec': 11
        };
        
        const frenchPattern = /(\d{1,2})\s+([\wéû]+)[,.]?\s+(\d{4})/i;
        const match = dateStr.match(frenchPattern);
        
        if (match) {
                const day = parseInt(match[1], 10);
                const monthStr = match[2].toLowerCase().replace(/[éèê]/g, 'e');
                const year = parseInt(match[3], 10);
                
                const month = monthMap[monthStr];
                if (month !== undefined) {
                        let hours = 0;
                        let minutes = 0;
                        
                        if (timeStr) {
                                const timePattern = /(\d{1,2}):(\d{2})\s*(AM|PM)?/i;
                                const timeMatch = timeStr.match(timePattern);
                                
                                if (timeMatch) {
                                        hours = parseInt(timeMatch[1], 10);
                                        minutes = parseInt(timeMatch[2], 10);
                                        
                                        if (timeMatch[3]) {
                                                const meridiem = timeMatch[3].toUpperCase();
                                                if (meridiem === 'PM' && hours !== 12) {
                                                        hours += 12;
                                                } else if (meridiem === 'AM' && hours === 12) {
                                                        hours = 0;
                                                }
                                        }
                                }
                        }
                        
                        const date = new Date(year, month, day, hours, minutes);
                        return isNaN(date.getTime()) ? null : date;
                }
        }
        
        const standardDate = new Date(dateStr + (timeStr ? ' ' + timeStr : ''));
        return isNaN(standardDate.getTime()) ? null : standardDate;
}

function parseCSVLine(line: string): string[] {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
                const char = line[i];
                
                if (char === '"') {
                        inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                        result.push(current.trim());
                        current = '';
                } else {
                        current += char;
                }
        }
        
        result.push(current.trim());
        return result;
}

export function parseCSV(csvText: string): TransactionRow[] {
        const content = csvText.trim();
        const lines = content.split('\n');
        
        if (lines.length < 2) {
                throw new Error('CSV file is empty or invalid');
        }

        const headers = parseCSVLine(lines[0]).map((h) => h.trim().toLowerCase());
        const transactions: TransactionRow[] = [];

        const dateIdx = headers.findIndex(h => h === 'date');
        const timeIdx = headers.findIndex(h => h === 'time');
        const typeIdx = headers.findIndex(h => h === 'type');
        const amountIdx = headers.findIndex(h => h === 'amount');
        const soldeIdx = headers.findIndex(h => h === 'solde');

        for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                
                const values = parseCSVLine(line);
                
                let timestamp: Date | null = null;
                
                if (dateIdx >= 0 && values[dateIdx]) {
                        const dateStr = values[dateIdx];
                        const timeStr = timeIdx >= 0 ? values[timeIdx] : undefined;
                        timestamp = parseFrenchDate(dateStr, timeStr);
                }
                
                if (!timestamp || isNaN(timestamp.getTime())) {
                        continue;
                }
                
                const type = typeIdx >= 0 && values[typeIdx] 
                        ? normalizeType(values[typeIdx])
                        : 'OTHER';
                
                const amountStr = amountIdx >= 0 ? values[amountIdx] : '';
                const amount = amountStr
                        ? parseFloat(amountStr.replace(/[^\d.-]/g, ''))
                        : undefined;
                
                const soldeStr = soldeIdx >= 0 ? values[soldeIdx] : '';
                const solde = soldeStr
                        ? parseFloat(soldeStr.replace(/[^\d.-]/g, ''))
                        : undefined;
                
                const row: TransactionRow = {
                        timestamp,
                        type,
                        amount: amount !== undefined && !isNaN(amount) ? amount : undefined,
                        solde: solde !== undefined && !isNaN(solde) ? solde : undefined,
                };
                
                headers.forEach((header, idx) => {
                        if (idx !== dateIdx && idx !== timeIdx && idx !== typeIdx && 
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
