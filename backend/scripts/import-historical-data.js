const fs = require('fs');
const path = require('path');
const axios = require('axios');

const MONTH_MAP = {
	'janv.': 0, 'janv': 0, 'janvier': 0,
	'févr.': 1, 'févr': 1, 'février': 1,
	'mars': 2,
	'avr.': 3, 'avr': 3, 'avril': 3,
	'mai': 4,
	'juin': 5,
	'juil.': 6, 'juil': 6, 'juillet': 6,
	'août': 7,
	'sept.': 8, 'sept': 8, 'septembre': 8,
	'oct.': 9, 'oct': 9, 'octobre': 9,
	'nov.': 10, 'nov': 10, 'novembre': 10,
	'déc.': 11, 'déc': 11, 'décembre': 11,
};

function parseCSVLine(line) {
	const fields = [];
	let current = '';
	let inQuotes = false;
	
	for (let i = 0; i < line.length; i++) {
		const char = line[i];
		
		if (char === '"') {
			inQuotes = !inQuotes;
		} else if (char === ',' && !inQuotes) {
			fields.push(current);
			current = '';
		} else {
			current += char;
		}
	}
	fields.push(current);
	
	return fields;
}

function parseFrenchDate(dateStr, timeStr) {
	try {
		const dateParts = dateStr.toLowerCase().replace(/,/g, '').split(' ');
		const day = parseInt(dateParts[0]);
		const monthStr = dateParts[1];
		const year = parseInt(dateParts[2]);
		
		const month = MONTH_MAP[monthStr];
		if (month === undefined) {
			console.warn(`⚠️  Unknown month: ${monthStr}`);
			return null;
		}
		
		const timeParts = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
		if (!timeParts) {
			console.warn(`⚠️  Invalid time format: ${timeStr}`);
			return null;
		}
		
		let hours = parseInt(timeParts[1]);
		const minutes = parseInt(timeParts[2]);
		const meridiem = timeParts[3].toUpperCase();
		
		if (meridiem === 'PM' && hours !== 12) hours += 12;
		if (meridiem === 'AM' && hours === 12) hours = 0;
		
		const date = new Date(year, month, day, hours, minutes, 0);
		return date.toISOString();
	} catch (error) {
		console.error(`❌ Error parsing date: ${dateStr} ${timeStr}`, error.message);
		return null;
	}
}

async function importData() {
	const csvPath = path.join(__dirname, '../../attached_assets/superchat_v1 - Feuille 1 (2)_1761305893855.csv');
	
	if (!fs.existsSync(csvPath)) {
		console.error(`❌ CSV file not found: ${csvPath}`);
		process.exit(1);
	}
	
	console.log('📂 Reading CSV file...');
	const fileContent = fs.readFileSync(csvPath, 'utf-8');
	const lines = fileContent.split('\n').filter(line => line.trim());
	
	console.log(`📊 Found ${lines.length - 1} lines (excluding header)`);
	
	const API_URL = 'http://localhost:3000/webhook/messages';
	let successCount = 0;
	let errorCount = 0;
	let skippedCount = 0;
	
	const seenIds = new Set();
	
	for (let i = 1; i < lines.length; i++) {
		const fields = parseCSVLine(lines[i]);
		
		if (fields.length < 5) {
			console.warn(`⚠️  Line ${i + 1}: Not enough fields, skipping`);
			skippedCount++;
			continue;
		}
		
		const [id, sender, date, time, message, , , type, amount, solde] = fields;
		
		if (!id || !sender || !date || !time || !message) {
			console.warn(`⚠️  Line ${i + 1}: Missing required fields, skipping`);
			skippedCount++;
			continue;
		}
		
		if (seenIds.has(id.trim())) {
			skippedCount++;
			continue;
		}
		seenIds.add(id.trim());
		
		const timestamp = parseFrenchDate(date.trim(), time.trim());
		if (!timestamp) {
			console.warn(`⚠️  Line ${i + 1}: Invalid date/time format, skipping`);
			skippedCount++;
			continue;
		}
		
		const payload = {
			id: id.trim(),
			message: message.trim().replace(/\n/g, ' '),
			sender: sender.trim(),
			timestamp: timestamp,
			sent: true,
		};
		
		try {
			await axios.post(API_URL, payload);
			successCount++;
			
			if (successCount % 100 === 0) {
				console.log(`✅ Imported ${successCount} messages...`);
			}
		} catch (error) {
			errorCount++;
			console.error(`❌ Line ${i + 1}: Failed to import`, error.response?.data || error.message);
		}
	}
	
	console.log('\n=================================');
	console.log('📊 Import Summary:');
	console.log(`✅ Successfully imported: ${successCount}`);
	console.log(`⚠️  Skipped (duplicates/invalid): ${skippedCount}`);
	console.log(`❌ Errors: ${errorCount}`);
	console.log('=================================\n');
}

importData().catch(error => {
	console.error('💥 Fatal error:', error);
	process.exit(1);
});
