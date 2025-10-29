const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { Client } = require('pg');

const MONTH_MAP = {
  'janv.': '01', 'janvier': '01',
  'févr.': '02', 'février': '02',
  'mars': '03',
  'avr.': '04', 'avril': '04',
  'mai': '05',
  'juin': '06',
  'juil.': '07', 'juillet': '07',
  'août': '08',
  'sept.': '09', 'septembre': '09',
  'oct.': '10', 'octobre': '10',
  'nov.': '11', 'novembre': '11',
  'déc.': '12', 'décembre': '12'
};

function parseDate(dateStr, timeStr) {
  try {
    if (!dateStr || dateStr === 'true' || typeof dateStr !== 'string') {
      return new Date().toISOString();
    }
    
    const dateParts = dateStr.split(' ');
    if (dateParts.length < 3) {
      return new Date().toISOString();
    }
    
    const day = dateParts[0].padStart(2, '0');
    const monthFr = dateParts[1].replace(',', '');
    const year = dateParts[2];
    
    const month = MONTH_MAP[monthFr.toLowerCase()] || '01';
    
    let hour = 0, minute = 0;
    if (timeStr) {
      const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (timeMatch) {
        hour = parseInt(timeMatch[1]);
        minute = parseInt(timeMatch[2]);
        const period = timeMatch[3].toUpperCase();
        
        if (period === 'PM' && hour !== 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;
      }
    }
    
    const isoDate = `${year}-${month}-${day}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00Z`;
    return isoDate;
  } catch (error) {
    console.error('Error parsing date:', dateStr, timeStr, error);
    return new Date().toISOString();
  }
}

function cleanAmount(amountStr) {
  if (!amountStr || amountStr.trim() === '' || amountStr.trim() === '-') {
    return null;
  }
  
  const cleaned = amountStr.toString().replace(/Ar/gi, '').replace(/\s+/g, '').trim();
  return cleaned || null;
}

async function importCSV() {
  const csvPath = path.join(__dirname, '../../attached_assets/superchat_v1 - Feuille 1 (2)_1761717902908.csv');
  
  console.log('Reading CSV file...');
  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  
  console.log('Parsing CSV...');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    trim: true
  });
  
  console.log(`Found ${records.length} records`);
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  
  await client.connect();
  console.log('Connected to database');
  
  let imported = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const record of records) {
    try {
      if (!record.Message || record.Message.trim() === '') {
        skipped++;
        continue;
      }
      
      const messageId = record.ID || `import_${Date.now()}_${Math.random()}`;
      const sender = record.Sender || 'Unknown';
      const body = record.Message;
      const type = record.type || 'AUTRE';
      const amount = cleanAmount(record.amount);
      const balance = cleanAmount(record.solde);
      const timestamp = parseDate(record.Date, record.Time);
      const receivedAt = new Date().toISOString();
      
      const query = `
        INSERT INTO webhook_messages (id, body, sender, timestamp, type, amount, balance, "receivedAt", sent)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `;
      
      await client.query(query, [
        messageId,
        body,
        sender,
        timestamp,
        type,
        amount,
        balance,
        receivedAt,
        true
      ]);
      
      imported++;
      
      if (imported % 100 === 0) {
        console.log(`Imported ${imported} records...`);
      }
    } catch (error) {
      errors++;
      console.error('Error importing record:', error.message);
      if (errors < 5) {
        console.error('Record:', record);
      }
    }
  }
  
  await client.end();
  
  console.log('\n=== Import Summary ===');
  console.log(`Total records: ${records.length}`);
  console.log(`Imported: ${imported}`);
  console.log(`Skipped (empty): ${skipped}`);
  console.log(`Errors: ${errors}`);
}

importCSV()
  .then(() => {
    console.log('Import completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Import failed:', error);
    process.exit(1);
  });
