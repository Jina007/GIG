import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type LanguageCode = 'en' | 'ta' | 'hi';

interface Translations {
  [key: string]: {
    en: string;
    ta: string;
    hi: string;
  };
}

export const dictionary: Translations = {
  // Brand & Nav
  appName: {
    en: 'Sahakari Gig',
    ta: 'சககாரி கிக்',
    hi: 'सहकारी गिग',
  },
  appTagline: {
    en: 'Cooperative Gig Platform for Household & Community Services',
    ta: 'குடும்ப மற்றும் சமூக சேவைகளுக்கான கூட்டுறவு கிக் தளம்',
    hi: 'घरेलू एवं सामुदायिक सेवाओं हेतु सहकारी गिग मंच',
  },
  home: {
    en: 'Home',
    ta: 'முகப்பு',
    hi: 'होम',
  },
  services: {
    en: 'Services',
    ta: 'சேவைகள்',
    hi: 'सेवाएं',
  },
  myBookings: {
    en: 'My Bookings',
    ta: 'என் முன்பதிவுகள்',
    hi: 'मेरी बुकिंग्स',
  },
  cooperativeNetwork: {
    en: 'Cooperative Network',
    ta: 'கூட்டுறவு நெட்வொர்க்',
    hi: 'सहकारी नेटवर्क',
  },
  welfarePortal: {
    en: 'Worker Welfare',
    ta: 'தொழிலாளர் நலன்',
    hi: 'श्रमिक कल्याण',
  },
  emergencyService: {
    en: 'Emergency Service',
    ta: 'அவசர சேவை',
    hi: 'आपातकालीन सेवा',
  },
  emergencyServiceDesc: {
    en: 'Instant dispatch for urgent pipe bursts, electrical sparks, lockouts & elder assistance',
    ta: 'குழாய் உடைப்பு, மின் கோளாறு, பூட்டு முறிவு மற்றும் அவசர முதியோர் உதவிக்கான உடனடி சேவை',
    hi: 'पाइप लीकेज, बिजली फॉल्ट, लॉक रिपेयर एवं तत्काल बुजुर्ग सहायता हेतु त्वरित सेवा',
  },
  whyRecommended: {
    en: 'Why this worker was recommended',
    ta: 'இந்த தொழிலாளர் ஏன் பரிந்துரைக்கப்பட்டார்',
    hi: 'इस श्रमिक की अनुशंसा क्यों की गई',
  },

  // Hero Section
  heroQuestion: {
    en: 'What service do you need today?',
    ta: 'இன்று உங்களுக்கு என்ன சேவை தேவைப்படுகிறது?',
    hi: 'आज आपको किस सेवा की आवश्यकता है?',
  },
  heroSubtitle: {
    en: 'Connect directly with verified local workers from registered Labour Cooperative Societies.',
    ta: 'பதிவுசெய்யப்பட்ட தொழிலாளர் கூட்டுறவு சங்கங்களின் சரிபார்க்கப்பட்ட தொழிலாளர்களுடன் இணையுங்கள்.',
    hi: 'पंजीकृत श्रम सहकारी समितियों के सत्यापित स्थानीय श्रमिकों से सीधे जुड़ें।',
  },
  selectCommunity: {
    en: 'Select Community / Service Area',
    ta: 'சமூக பகுதி / சேவை பகுதியை தேர்வு செய்யவும்',
    hi: 'सामुदायिक क्षेत्र / सेवा क्षेत्र चुनें',
  },
  allTamilNadu: {
    en: 'Tamil Nadu Labour Cooperative Network',
    ta: 'தமிழ்நாடு தொழிலாளர் கூட்டுறவு நெட்வொர்க்',
    hi: 'तमिलनाडु श्रम सहकारी नेटवर्क',
  },

  // Trust Badges
  verifiedByCooperative: {
    en: 'Verified by Labour Cooperative',
    ta: 'தொழிலாளர் கூட்டுறவு சங்கத்தால் சரிபார்க்கப்பட்டது',
    hi: 'श्रम सहकारी समिति द्वारा सत्यापित',
  },
  ratedByCustomers: {
    en: 'Rated by Local Community',
    ta: 'உள்ளூர் சமூகத்தால் மதிப்பிடப்பட்டது',
    hi: 'स्थानीय समुदाय द्वारा मूल्यांकित',
  },
  identityVerified: {
    en: 'Identity Verified',
    ta: 'அடையாளம் சரிபார்க்கப்பட்டது',
    hi: 'पहचान सत्यापित',
  },
  cooperativeMember: {
    en: 'Cooperative Member',
    ta: 'கூட்டுறவு உறுப்பினர்',
    hi: 'सहकारी सदस्य',
  },
  skillVerified: {
    en: 'Skill Verified',
    ta: 'திறன் சரிபார்க்கப்பட்டது',
    hi: 'कौशल सत्यापित',
  },
  certificateVerified: {
    en: 'Certificate Verified',
    ta: 'சான்றிதழ் சரிபார்க்கப்பட்டது',
    hi: 'प्रमाणपत्र सत्यापित',
  },
  repeatCustomers: {
    en: 'Repeat Customers',
    ta: 'மறுமுறை வாடிக்கையாளர்கள்',
    hi: 'पुनरावृत्ति ग्राहक',
  },
  jobsCompleted: {
    en: 'Jobs Completed',
    ta: 'முடிக்கப்பட்ட பணிகள்',
    hi: 'संपन्न कार्य',
  },
  yearsExperience: {
    en: 'Years Experience',
    ta: 'ஆண்டுகள் அனுபவம்',
    hi: 'वर्षों का अनुभव',
  },
  servingRadius: {
    en: 'Service Radius',
    ta: 'சேவை ஆரம்',
    hi: 'सेवा दायरा',
  },
  bookNow: {
    en: 'Book Verified Worker',
    ta: 'சரிபார்க்கப்பட்ட தொழிலாளரை முன்பதிவு செய்',
    hi: 'सत्यापित श्रमिक बुक करें',
  },

  // Service Categories
  plumbing: {
    en: 'Plumbing',
    ta: 'குழாய் வேலை (பிளம்பிங்)',
    hi: 'नलसाजी (प्लंबिंग)',
  },
  electrical: {
    en: 'Electrical',
    ta: 'மின் வேலை (எலக்ட்ரிக்கல்)',
    hi: 'विद्युत कार्य (इलेक्ट्रिकल)',
  },
  carpentry: {
    en: 'Carpentry',
    ta: 'மரவேலை (தச்சு வேலை)',
    hi: 'बढ़ईगीरी (कारपेंट्री)',
  },
  painting: {
    en: 'Painting',
    ta: 'வர்ணம் பூசுதல் (பெயிண்டிங்)',
    hi: 'रंगाई (पेंटिंग)',
  },
  cleaning: {
    en: 'Deep Cleaning',
    ta: 'முழுமையான சுத்தம் செய்தல்',
    hi: 'गहन सफाई (डीप क्लीनिंग)',
  },
  domesticHelp: {
    en: 'Domestic Help',
    ta: 'வீட்டுப் பணி உதவி',
    hi: 'घरेलू सहायता',
  },
  elderCare: {
    en: 'Elder Care',
    ta: 'முதியோர் பராமரிப்பு',
    hi: 'बुजुर्गों की देखभाल',
  },
  childCare: {
    en: 'Child Care',
    ta: 'குழந்தை பராமரிப்பு',
    hi: 'शिशु देखभाल',
  },
  driving: {
    en: 'Driver on Demand',
    ta: 'தேவைக்கேற்ற ஓட்டுநர்',
    hi: 'मांग पर चालक (ड्राइवर)',
  },
  gardening: {
    en: 'Gardening & Plants',
    ta: 'தோட்டக்கலை & செடிகள்',
    hi: 'बागवानी एवं पौधे',
  },
  applianceRepair: {
    en: 'Appliance Repair',
    ta: 'சாதன பழுதுநீக்கம்',
    hi: 'उपकरण मरम्मत',
  },
  acRepair: {
    en: 'AC Servicing',
    ta: 'ஏசி சேவை & பழுது',
    hi: 'एसी सर्विसिंग',
  },
  technician: {
    en: 'Technician Services',
    ta: 'தொழில்நுட்ப சேவைகள்',
    hi: 'तकनीशियन सेवाएं',
  },
  communityCleaning: {
    en: 'Community Sanitation',
    ta: 'சமூக கழிவுநீர் & துப்புரவு',
    hi: 'सामुदायिक स्वच्छता',
  },
  communityMaint: {
    en: 'Facility Maintenance',
    ta: 'சமூக வசதி பராமரிப்பு',
    hi: 'सुविधा रखरखाव',
  },
  movingLoading: {
    en: 'Moving & Loading',
    ta: 'பொருட்கள் ஏற்றுதல் & ஏற்றுமதி',
    hi: 'सामान ढुलाई एवं लोडिंग',
  },

  // Booking Statuses
  REQUESTED: {
    en: 'Requested',
    ta: 'கோரப்பட்டது',
    hi: 'अनुरोधित',
  },
  ACCEPTED: {
    en: 'Worker Accepted',
    ta: 'ஏற்றுக்கொள்ளப்பட்டது',
    hi: 'स्वीकृत',
  },
  ON_THE_WAY: {
    en: 'On The Way',
    ta: 'வழியில் உள்ளார்',
    hi: 'मार्ग में',
  },
  ARRIVED: {
    en: 'Arrived at Location',
    ta: 'இடத்திற்கு வந்து சேர்ந்தார்',
    hi: 'स्थान पर पहुंचे',
  },
  IN_PROGRESS: {
    en: 'Work In Progress',
    ta: 'பணி நடைபெறுகிறது',
    hi: 'कार्य प्रगति पर',
  },
  COMPLETED: {
    en: 'Service Completed',
    ta: 'பணி நிறைவுற்றது',
    hi: 'कार्य पूर्ण',
  },
  CANCELLED: {
    en: 'Cancelled',
    ta: 'ரத்து செய்யப்பட்டது',
    hi: 'रद्द किया गया',
  },
  DISPUTED: {
    en: 'Under Mediation',
    ta: 'மத்தியஸ்தத்தில் உள்ளது',
    hi: 'विवाद मध्यस्थता में',
  },

  // Roles & Dashboards
  customerRole: {
    en: 'Customer',
    ta: 'வாடிக்கையாளர்',
    hi: 'ग्राहक',
  },
  workerRole: {
    en: 'Cooperative Worker',
    ta: 'கூட்டுறவு தொழிலாளர்',
    hi: 'सहकारी श्रमिक',
  },
  coopAdminRole: {
    en: 'Cooperative Admin',
    ta: 'கூட்டுறவு நிர்வாகி',
    hi: 'सहकारी प्रबंधक',
  },
  fedAdminRole: {
    en: 'Federation Admin',
    ta: 'கூட்டமைப்பு நிர்வாகி',
    hi: 'महासंघ प्रशासक',
  },
  superAdminRole: {
    en: 'Super Admin',
    ta: 'முதன்மை நிர்வாகி',
    hi: 'सुपर एडमिन',
  },

  // AI & Analytics
  demandForecast: {
    en: 'AI Demand Forecasting',
    ta: 'AI சேவை தேவை கணிப்பு',
    hi: 'एआई मांग पूर्वानुमान',
  },
  workforceAllocation: {
    en: 'AI Workforce Allocation',
    ta: 'AI பணியாளர் ஒதுக்கீடு பரிந்துரை',
    hi: 'एआई कार्यबल आवंटन',
  },
  coopWelfareCard: {
    en: 'Worker Social Security & Welfare',
    ta: 'தொழிலாளர் சமூக பாதுகாப்பு மற்றும் நலன்',
    hi: 'श्रमिक सामाजिक सुरक्षा एवं कल्याण',
  },
  insuranceActive: {
    en: 'Insurance Active',
    ta: 'காப்பீடு செயலில் உள்ளது',
    hi: 'बीमा सक्रिय',
  },
  transparentPayout: {
    en: '88% Direct Worker Payout • 7% Cooperative Welfare Fund • 5% Platform',
    ta: '88% தொழிலாளர் நேரடி ஊதியம் • 7% கூட்டுறவு நல நிதி • 5% தளம்',
    hi: '88% श्रमिक को सीधा भुगतान • 7% सहकारी कल्याण कोष • 5% मंच',
  },
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    return (localStorage.getItem('sahakari_lang') as LanguageCode) || 'en';
  });

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('sahakari_lang', lang);
  };

  const t = (key: string, fallback?: string): string => {
    if (dictionary[key] && dictionary[key][language]) {
      return dictionary[key][language];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
