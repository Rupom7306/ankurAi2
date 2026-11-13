import * as XLSX from 'xlsx';

export interface ParsedSensorRow {
  date: string;
  section: string;
  cropType?: string;
  nitrogen: number | null;
  phosphorus: number | null;
  potassium: number | null;
  humidity: number | null;
  soilMoisture?: number | null;
  temperature?: number | null;
  ph?: number | null;
}

export interface ParseResult {
  success: boolean;
  error?: string;
  rows: ParsedSensorRow[];
  detectedSections: string[];
  dateRange: { start: string; end: string } | null;
  batchRows: ParsedSensorRow[];
}

/**
 * Normalizes header keys to standard lowercase identifiers
 */
const normalizeKey = (key: string): string => {
  return key.toLowerCase().trim().replace(/[\s\-_]+/g, '');
};

const COLUMN_SYNONYMS: Record<string, string[]> = {
  date: ['date', 'timestamp', 'datetime', 'time', 'readingdate'],
  section: ['section', 'sectionkey', 'plot', 'block', 'field', 'zone'],
  cropType: ['croptype', 'crop'],
  nitrogen: ['nitrogen', 'n', 'soiln', 'nitrate'],
  phosphorus: ['phosphorus', 'p', 'soilp', 'phosphate'],
  potassium: ['potassium', 'k', 'soilk', 'potash'],
  humidity: ['humidity', 'rh', 'relativehumidity', 'airhumidity', 'soilhumidity'],
  soilMoisture: ['soilmoisture', 'moisture', 'sm'],
  temperature: ['temperature', 'temp', 'soiltemp', 'airtemp'],
  ph: ['ph', 'soilph'],
};

/**
 * Parses a numeric value, treating empty or whitespace as null (never 0)
 */
const parseNullableNumber = (val: unknown): number | null => {
  if (val === undefined || val === null || val === '') return null;
  const num = typeof val === 'number' ? val : parseFloat(String(val).trim());
  return isNaN(num) ? null : num;
};

/**
 * Parses an Excel or CSV file client-side
 */
export const parseSensorFile = async (
  file: File,
  targetSectionKey?: string
): Promise<ParseResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          resolve({
            success: false,
            error: 'ফাইল থেকে ডেটা পড়া যায়নি।',
            rows: [],
            detectedSections: [],
            dateRange: null,
            batchRows: [],
          });
          return;
        }

        const workbook = XLSX.read(data, {
          type: 'binary',
          cellDates: true,
          dateNF: 'yyyy-mm-dd',
        });

        // Use the first sheet or one named 'SensorData'
        const sheetName =
          workbook.SheetNames.find((s) => s.toLowerCase().includes('sensor')) ||
          workbook.SheetNames[0];

        const worksheet = workbook.Sheets[sheetName];
        if (!worksheet) {
          resolve({
            success: false,
            error: 'এক্সেল ফাইলে কোনো শিট পাওয়া যায়নি।',
            rows: [],
            detectedSections: [],
            dateRange: null,
            batchRows: [],
          });
          return;
        }

        // Convert sheet to raw JSON objects
        const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(worksheet, {
          raw: false,
          defval: '',
        });

        if (rawRows.length === 0) {
          resolve({
            success: false,
            error: 'ফাইলে কোনো তথ্য বা রেকর্ড পাওয়া যায়নি।',
            rows: [],
            detectedSections: [],
            dateRange: null,
            batchRows: [],
          });
          return;
        }

        // Detect column mapping from the first row keys
        const firstRowKeys = Object.keys(rawRows[0]);
        const keyMap: Record<string, string> = {}; // standardField -> rawKey

        firstRowKeys.forEach((rawKey) => {
          const normalized = normalizeKey(rawKey);
          for (const [standardField, synonyms] of Object.entries(COLUMN_SYNONYMS)) {
            if (synonyms.includes(normalized) && !keyMap[standardField]) {
              keyMap[standardField] = rawKey;
            }
          }
        });

        // Check required columns: date, section, nitrogen, phosphorus, potassium
        const requiredFields = ['date', 'section', 'nitrogen', 'phosphorus', 'potassium'];
        const missingFields = requiredFields.filter((f) => !keyMap[f]);

        if (missingFields.length > 0) {
          resolve({
            success: false,
            error: `ফাইলের কলাম অনুপস্থিত (${missingFields.join(', ')}). প্রত্যাশিত কলাম: date, section, nitrogen, phosphorus, potassium, humidity`,
            rows: [],
            detectedSections: [],
            dateRange: null,
            batchRows: [],
          });
          return;
        }

        // Parse and deduplicate rows
        const parsedRows: ParsedSensorRow[] = [];
        const seenKeys = new Set<string>();
        const detectedSectionsSet = new Set<string>();

        for (const raw of rawRows) {
          let dateVal = String(raw[keyMap.date] || '').trim();
          // Format date if needed
          if (dateVal.includes('T')) dateVal = dateVal.split('T')[0];
          const sectionVal = String(raw[keyMap.section] || '').trim().toLowerCase();

          // Skip completely empty spacer rows or rows with non-date header strings
          if (!dateVal || !sectionVal || dateVal.toLowerCase() === 'date' || dateVal.toLowerCase() === 'column') {
            continue;
          }

          // Deduplication key
          const dedupeKey = `${dateVal}::${sectionVal}`;
          if (seenKeys.has(dedupeKey)) continue;
          seenKeys.add(dedupeKey);

          detectedSectionsSet.add(sectionVal);

          const parsedRow: ParsedSensorRow = {
            date: dateVal,
            section: sectionVal,
            cropType: keyMap.cropType ? String(raw[keyMap.cropType] || '').trim() : undefined,
            nitrogen: parseNullableNumber(raw[keyMap.nitrogen]),
            phosphorus: parseNullableNumber(raw[keyMap.phosphorus]),
            potassium: parseNullableNumber(raw[keyMap.potassium]),
            humidity: keyMap.humidity ? parseNullableNumber(raw[keyMap.humidity]) : null,
            soilMoisture: keyMap.soilMoisture ? parseNullableNumber(raw[keyMap.soilMoisture]) : null,
            temperature: keyMap.temperature ? parseNullableNumber(raw[keyMap.temperature]) : null,
            ph: keyMap.ph ? parseNullableNumber(raw[keyMap.ph]) : null,
          };

          parsedRows.push(parsedRow);
        }

        if (parsedRows.length === 0) {
          resolve({
            success: false,
            error: 'সঠিক ফরম্যাটের কোনো সেন্সর রেকর্ড পাওয়া যায়নি।',
            rows: [],
            detectedSections: [],
            dateRange: null,
            batchRows: [],
          });
          return;
        }

        // Sort chronologically
        parsedRows.sort((a, b) => a.date.localeCompare(b.date));

        const detectedSections = Array.from(detectedSectionsSet);
        const dateRange = {
          start: parsedRows[0].date,
          end: parsedRows[parsedRows.length - 1].date,
        };

        const normalizedTarget = targetSectionKey?.trim().toLowerCase();
        const batchRows = normalizedTarget
          ? parsedRows.filter((r) => r.section === normalizedTarget)
          : [];

        resolve({
          success: true,
          rows: parsedRows,
          detectedSections,
          dateRange,
          batchRows,
        });
      } catch (err) {
        console.error('SheetJS parse error:', err);
        resolve({
          success: false,
          error: 'এক্সেল বা সিএসভি ফাইল প্রসেস করতে সমস্যা হয়েছে। অনুগ্রহ করে নমুনা টেমপ্লেটটি ব্যবহার করুন।',
          rows: [],
          detectedSections: [],
          dateRange: null,
          batchRows: [],
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        error: 'ফাইলটি পড়তে ব্যর্থ হয়েছে।',
        rows: [],
        detectedSections: [],
        dateRange: null,
        batchRows: [],
      });
    };

    reader.readAsBinaryString(file);
  });
};
