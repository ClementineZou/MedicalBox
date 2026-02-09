import countries from 'world-countries';

export const COUNTRIES = countries.map(c => {
  // Get the first native name available, or fallback to common name
  const nativeObj = c.name.native ? Object.values(c.name.native)[0] : null;
  const nativeName = nativeObj ? nativeObj.common : c.name.common;
  
  return {
    code: c.cca2,
    name: c.name.common,
    native: nativeName, // Always provide the native name
    label: c.name.common === nativeName ? c.name.common : `${c.name.common} / ${nativeName}`
  };
}).sort((a, b) => a.name.localeCompare(b.name));

// Common languages list (Curated, as world-countries does not export a standalone language list)
export const LANGUAGES = [
  { code: 'zh', name: 'Chinese', native: '中文' },
  { code: 'en', name: 'English', native: 'English' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'jv', name: 'Javanese', native: 'Basa Jawa' },
  { code: 'ko', name: 'Korean', native: '한국어' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt' },
  { code: 'ur', name: 'Urdu', native: 'اردو' },
  { code: 'it', name: 'Italian', native: 'Italiano' },
  { code: 'th', name: 'Thai', native: 'ไทย' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'fa', name: 'Persian', native: 'فارسی' },
  { code: 'pl', name: 'Polish', native: 'Polski' },
  { code: 'uk', name: 'Ukrainian', native: 'Українська' },
  { code: 'ms', name: 'Malay', native: 'Bahasa Melayu' },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia' }
];

export const BLOOD_TYPES = [
  'A (+)', 'A (-)', 
  'B (+)', 'B (-)', 
  'AB (+)', 'AB (-)', 
  'O (+)', 'O (-)',
  'Oh (孟买血型 / Bombay Blood)',
  '不详 / Unknown'
];
