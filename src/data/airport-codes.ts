// IATA airport codes mapped to ISO 3166-1 alpha-2 country codes
// Covers major international airports

export const airportToCountry: Record<string, string> = {
  // United States
  JFK: 'US', LAX: 'US', ORD: 'US', DFW: 'US', DEN: 'US', SFO: 'US', SEA: 'US',
  LAS: 'US', MCO: 'US', EWR: 'US', MIA: 'US', PHX: 'US', IAH: 'US', BOS: 'US',
  MSP: 'US', DTW: 'US', PHL: 'US', ATL: 'US', LGA: 'US', FLL: 'US', BWI: 'US',
  SLC: 'US', SAN: 'US', DCA: 'US', IAD: 'US', TPA: 'US', PDX: 'US', HNL: 'US',
  AUS: 'US', DAL: 'US', MDW: 'US', STL: 'US', RDU: 'US', SJC: 'US', OAK: 'US',
  SMF: 'US', CLE: 'US', MCI: 'US', IND: 'US', CVG: 'US', PIT: 'US', CMH: 'US',

  // Canada
  YYZ: 'CA', YVR: 'CA', YUL: 'CA', YYC: 'CA', YEG: 'CA', YOW: 'CA', YHZ: 'CA',
  YWG: 'CA', YQB: 'CA',

  // United Kingdom
  LHR: 'GB', LGW: 'GB', STN: 'GB', LTN: 'GB', MAN: 'GB', EDI: 'GB', BHX: 'GB',
  GLA: 'GB', BRS: 'GB', LCY: 'GB', NCL: 'GB', BFS: 'GB', LPL: 'GB', EMA: 'GB',

  // Germany
  FRA: 'DE', MUC: 'DE', DUS: 'DE', TXL: 'DE', BER: 'DE', HAM: 'DE', CGN: 'DE',
  STR: 'DE', HAJ: 'DE', NUE: 'DE', LEJ: 'DE',

  // France
  CDG: 'FR', ORY: 'FR', NCE: 'FR', LYS: 'FR', MRS: 'FR', TLS: 'FR', BOD: 'FR',
  NTE: 'FR', BVA: 'FR',

  // Spain
  MAD: 'ES', BCN: 'ES', PMI: 'ES', AGP: 'ES', ALC: 'ES', VLC: 'ES', SVQ: 'ES',
  IBZ: 'ES', TFS: 'ES', LPA: 'ES', BIO: 'ES', GRX: 'ES',

  // Italy
  FCO: 'IT', MXP: 'IT', LIN: 'IT', VCE: 'IT', NAP: 'IT', BGY: 'IT', BLQ: 'IT',
  PSA: 'IT', FLR: 'IT', CTA: 'IT', PMO: 'IT', TRN: 'IT',

  // Netherlands
  AMS: 'NL', EIN: 'NL', RTM: 'NL',

  // Belgium
  BRU: 'BE', CRL: 'BE',

  // Switzerland
  ZRH: 'CH', GVA: 'CH', BSL: 'CH',

  // Austria
  VIE: 'AT', SZG: 'AT', INN: 'AT',

  // Portugal
  LIS: 'PT', OPO: 'PT', FAO: 'PT', FNC: 'PT',

  // Ireland
  DUB: 'IE', SNN: 'IE', ORK: 'IE',

  // Greece
  ATH: 'GR', SKG: 'GR', HER: 'GR', RHO: 'GR', CFU: 'GR', JMK: 'GR', JTR: 'GR',

  // Turkey
  IST: 'TR', SAW: 'TR', ESB: 'TR', AYT: 'TR', ADB: 'TR', DLM: 'TR', BJV: 'TR',

  // Poland
  WAW: 'PL', KRK: 'PL', GDN: 'PL', WRO: 'PL', POZ: 'PL', KTW: 'PL',

  // Czech Republic
  PRG: 'CZ', BRQ: 'CZ',

  // Hungary
  BUD: 'HU',

  // Romania
  OTP: 'RO', CLJ: 'RO',

  // Bulgaria
  SOF: 'BG', VAR: 'BG', BOJ: 'BG',

  // Croatia
  ZAG: 'HR', SPU: 'HR', DBV: 'HR',

  // Serbia
  BEG: 'RS',

  // Slovenia
  LJU: 'SI',

  // Slovakia
  BTS: 'SK',

  // Nordic countries
  CPH: 'DK', ARN: 'SE', GOT: 'SE', OSL: 'NO', BGO: 'NO', TRD: 'NO',
  HEL: 'FI', TMP: 'FI', KEF: 'IS', RKV: 'IS',

  // Baltic states
  TLL: 'EE', RIX: 'LV', VNO: 'LT',

  // Russia
  SVO: 'RU', DME: 'RU', VKO: 'RU', LED: 'RU',

  // Ukraine
  KBP: 'UA', IEV: 'UA', ODS: 'UA', LWO: 'UA',

  // Middle East
  DXB: 'AE', AUH: 'AE', SHJ: 'AE', DOH: 'QA', BAH: 'BH', KWI: 'KW',
  MCT: 'OM', RUH: 'SA', JED: 'SA', DMM: 'SA', MED: 'SA',
  TLV: 'IL', AMM: 'JO', BEY: 'LB', BGW: 'IQ', IKA: 'IR', THR: 'IR',

  // Africa
  JNB: 'ZA', CPT: 'ZA', DUR: 'ZA', CAI: 'EG', HRG: 'EG', SSH: 'EG', LXR: 'EG',
  CMN: 'MA', RAK: 'MA', TUN: 'TN', ALG: 'DZ', NBO: 'KE', MBA: 'KE',
  ADD: 'ET', LOS: 'NG', ABV: 'NG', ACC: 'GH', DAR: 'TZ', ZNZ: 'TZ',
  JRO: 'TZ', MRU: 'MU', SEZ: 'SC', TNR: 'MG', DSS: 'SN', ABJ: 'CI',

  // East Asia
  PEK: 'CN', PKX: 'CN', PVG: 'CN', SHA: 'CN', CAN: 'CN', SZX: 'CN', CTU: 'CN',
  XIY: 'CN', HGH: 'CN', NKG: 'CN', WUH: 'CN', CKG: 'CN', KMG: 'CN', XMN: 'CN',
  NRT: 'JP', HND: 'JP', KIX: 'JP', NGO: 'JP', FUK: 'JP', CTS: 'JP', OKA: 'JP',
  ICN: 'KR', GMP: 'KR', PUS: 'KR', CJU: 'KR',
  TPE: 'TW', KHH: 'TW', RMQ: 'TW',
  HKG: 'HK', MFM: 'MO',
  ULN: 'MN',

  // Southeast Asia
  SIN: 'SG', KUL: 'MY', PEN: 'MY', LGK: 'MY', BKI: 'MY', KCH: 'MY',
  BKK: 'TH', DMK: 'TH', HKT: 'TH', CNX: 'TH', USM: 'TH',
  CGK: 'ID', DPS: 'ID', SUB: 'ID', JOG: 'ID', UPG: 'ID',
  MNL: 'PH', CEB: 'PH', DVO: 'PH',
  SGN: 'VN', HAN: 'VN', DAD: 'VN', CXR: 'VN',
  RGN: 'MM', PNH: 'KH', REP: 'KH', VTE: 'LA', LPQ: 'LA',
  BWN: 'BN',

  // South Asia
  DEL: 'IN', BOM: 'IN', BLR: 'IN', MAA: 'IN', CCU: 'IN', HYD: 'IN', COK: 'IN',
  GOI: 'IN', AMD: 'IN', PNQ: 'IN', GAU: 'IN',
  DAC: 'BD', CMB: 'LK', KTM: 'NP', PBH: 'BT', MLE: 'MV', KHI: 'PK', LHE: 'PK', ISB: 'PK',

  // Central Asia
  TSE: 'KZ', ALA: 'KZ', TAS: 'UZ', SKD: 'UZ', FRU: 'KG', DYU: 'TJ', ASB: 'TM',

  // Oceania
  SYD: 'AU', MEL: 'AU', BNE: 'AU', PER: 'AU', ADL: 'AU', OOL: 'AU', CNS: 'AU',
  CBR: 'AU', HBA: 'AU', DRW: 'AU',
  AKL: 'NZ', WLG: 'NZ', CHC: 'NZ', ZQN: 'NZ',
  NAN: 'FJ', SUV: 'FJ', APW: 'WS', TBU: 'TO', PPT: 'PF', NOU: 'NC',
  POM: 'PG',

  // Central America & Caribbean
  MEX: 'MX', CUN: 'MX', GDL: 'MX', MTY: 'MX', TIJ: 'MX', SJD: 'MX', PVR: 'MX',
  PTY: 'PA', SJO: 'CR', LIR: 'CR', SAL: 'SV', GUA: 'GT', TGU: 'HN', SAP: 'HN',
  MGA: 'NI', BZE: 'BZ',
  HAV: 'CU', VRA: 'CU', SJU: 'PR', SDQ: 'DO', PUJ: 'DO', KIN: 'JM', MBJ: 'JM',
  NAS: 'BS', FPO: 'BS', BGI: 'BB', POS: 'TT', AUA: 'AW', CUR: 'CW', SXM: 'SX',
  PTP: 'GP', FDF: 'MQ',

  // South America
  GRU: 'BR', GIG: 'BR', BSB: 'BR', CNF: 'BR', SSA: 'BR', REC: 'BR', POA: 'BR',
  CWB: 'BR', FOR: 'BR', MAO: 'BR', FLN: 'BR',
  EZE: 'AR', AEP: 'AR', COR: 'AR', MDZ: 'AR', IGR: 'AR', BRC: 'AR', USH: 'AR',
  SCL: 'CL', PMC: 'CL', PUQ: 'CL', IQQ: 'CL',
  LIM: 'PE', CUZ: 'PE', AQP: 'PE',
  BOG: 'CO', MDE: 'CO', CTG: 'CO', CLO: 'CO',
  UIO: 'EC', GYE: 'EC', GPS: 'EC',
  CCS: 'VE', VLN: 'VE',
  LPB: 'BO', VVI: 'BO',
  ASU: 'PY',
  MVD: 'UY',
  GEO: 'GY', PBM: 'SR',
};

// Cities mapped to country codes for location parsing
export const cityToCountry: Record<string, string> = {
  // Major world cities
  'new york': 'US', 'nyc': 'US', 'los angeles': 'US', 'la': 'US', 'chicago': 'US',
  'houston': 'US', 'phoenix': 'US', 'philadelphia': 'US', 'philly': 'US',
  'san antonio': 'US', 'san diego': 'US', 'dallas': 'US', 'san jose ca': 'US',
  'austin': 'US', 'seattle': 'US', 'denver': 'US', 'boston': 'US',
  'las vegas': 'US', 'vegas': 'US', 'miami': 'US', 'atlanta': 'US',
  'san francisco': 'US', 'sf': 'US', 'washington': 'US', 'dc': 'US',
  'orlando': 'US', 'honolulu': 'US', 'portland': 'US', 'nashville': 'US',

  'toronto': 'CA', 'montreal': 'CA', 'vancouver': 'CA', 'calgary': 'CA',
  'ottawa': 'CA', 'edmonton': 'CA', 'quebec': 'CA',

  'london': 'GB', 'manchester': 'GB', 'birmingham': 'GB', 'edinburgh': 'GB',
  'glasgow': 'GB', 'liverpool': 'GB', 'bristol': 'GB', 'leeds': 'GB',
  'newcastle': 'GB', 'belfast': 'GB', 'cardiff': 'GB', 'oxford': 'GB',
  'cambridge': 'GB', 'brighton': 'GB', 'bath': 'GB', 'york': 'GB',

  'paris': 'FR', 'marseille': 'FR', 'lyon': 'FR', 'toulouse': 'FR',
  'nice': 'FR', 'nantes': 'FR', 'strasbourg': 'FR', 'bordeaux': 'FR',
  'lille': 'FR', 'cannes': 'FR', 'monaco': 'MC',

  'berlin': 'DE', 'munich': 'DE', 'frankfurt': 'DE', 'hamburg': 'DE',
  'cologne': 'DE', 'düsseldorf': 'DE', 'stuttgart': 'DE', 'dusseldorf': 'DE',
  'dresden': 'DE', 'leipzig': 'DE', 'nuremberg': 'DE',

  'rome': 'IT', 'milan': 'IT', 'naples': 'IT', 'turin': 'IT', 'florence': 'IT',
  'venice': 'IT', 'bologna': 'IT', 'genoa': 'IT', 'palermo': 'IT',
  'verona': 'IT', 'pisa': 'IT', 'siena': 'IT', 'amalfi': 'IT', 'capri': 'IT',

  'madrid': 'ES', 'barcelona': 'ES', 'valencia': 'ES', 'seville': 'ES',
  'bilbao': 'ES', 'malaga': 'ES', 'palma': 'ES', 'mallorca': 'ES',
  'ibiza': 'ES', 'tenerife': 'ES', 'granada': 'ES', 'san sebastian': 'ES',

  'lisbon': 'PT', 'porto': 'PT', 'faro': 'PT', 'madeira': 'PT', 'funchal': 'PT',

  'amsterdam': 'NL', 'rotterdam': 'NL', 'hague': 'NL', 'utrecht': 'NL',
  'eindhoven': 'NL',

  'brussels': 'BE', 'antwerp': 'BE', 'bruges': 'BE', 'ghent': 'BE',

  'zurich': 'CH', 'geneva': 'CH', 'basel': 'CH', 'bern': 'CH', 'lucerne': 'CH',
  'interlaken': 'CH', 'zermatt': 'CH',

  'vienna': 'AT', 'salzburg': 'AT', 'innsbruck': 'AT', 'graz': 'AT',

  'dublin': 'IE', 'cork': 'IE', 'galway': 'IE',

  'athens': 'GR', 'thessaloniki': 'GR', 'santorini': 'GR', 'mykonos': 'GR',
  'crete': 'GR', 'rhodes': 'GR', 'corfu': 'GR',

  'istanbul': 'TR', 'ankara': 'TR', 'antalya': 'TR', 'izmir': 'TR',
  'bodrum': 'TR', 'cappadocia': 'TR',

  'copenhagen': 'DK', 'stockholm': 'SE', 'gothenburg': 'SE', 'oslo': 'NO',
  'bergen': 'NO', 'helsinki': 'FI', 'reykjavik': 'IS',

  'prague': 'CZ', 'budapest': 'HU', 'warsaw': 'PL', 'krakow': 'PL',
  'bucharest': 'RO', 'sofia': 'BG', 'zagreb': 'HR', 'split': 'HR',
  'dubrovnik': 'HR', 'belgrade': 'RS', 'ljubljana': 'SI', 'bratislava': 'SK',

  'tallinn': 'EE', 'riga': 'LV', 'vilnius': 'LT',

  'moscow': 'RU', 'st petersburg': 'RU', 'saint petersburg': 'RU',
  'kyiv': 'UA', 'kiev': 'UA', 'lviv': 'UA', 'odessa': 'UA',

  'dubai': 'AE', 'abu dhabi': 'AE', 'doha': 'QA', 'bahrain': 'BH',
  'kuwait': 'KW', 'muscat': 'OM', 'riyadh': 'SA', 'jeddah': 'SA',
  'tel aviv': 'IL', 'jerusalem': 'IL', 'amman': 'JO', 'petra': 'JO',
  'beirut': 'LB', 'tehran': 'IR',

  'cairo': 'EG', 'luxor': 'EG', 'aswan': 'EG', 'hurghada': 'EG', 'sharm el sheikh': 'EG',
  'marrakech': 'MA', 'casablanca': 'MA', 'fez': 'MA', 'tangier': 'MA',
  'tunis': 'TN', 'algiers': 'DZ',
  'johannesburg': 'ZA', 'cape town': 'ZA', 'durban': 'ZA',
  'nairobi': 'KE', 'mombasa': 'KE', 'addis ababa': 'ET',
  'lagos': 'NG', 'accra': 'GH', 'dar es salaam': 'TZ', 'zanzibar': 'TZ',
  'mauritius': 'MU', 'seychelles': 'SC', 'madagascar': 'MG',

  'tokyo': 'JP', 'osaka': 'JP', 'kyoto': 'JP', 'yokohama': 'JP', 'nagoya': 'JP',
  'fukuoka': 'JP', 'sapporo': 'JP', 'hiroshima': 'JP', 'nara': 'JP', 'kobe': 'JP',

  'beijing': 'CN', 'shanghai': 'CN', 'guangzhou': 'CN', 'shenzhen': 'CN',
  'hong kong': 'HK', 'macau': 'MO', 'chengdu': 'CN', 'hangzhou': 'CN',
  'xian': 'CN', "xi'an": 'CN', 'guilin': 'CN', 'kunming': 'CN',

  'seoul': 'KR', 'busan': 'KR', 'jeju': 'KR', 'incheon': 'KR',
  'taipei': 'TW', 'kaohsiung': 'TW',

  'singapore': 'SG', 'kuala lumpur': 'MY', 'penang': 'MY', 'langkawi': 'MY',
  'bangkok': 'TH', 'phuket': 'TH', 'chiang mai': 'TH', 'krabi': 'TH', 'koh samui': 'TH',
  'bali': 'ID', 'jakarta': 'ID', 'yogyakarta': 'ID', 'ubud': 'ID',
  'manila': 'PH', 'cebu': 'PH', 'boracay': 'PH', 'palawan': 'PH',
  'ho chi minh': 'VN', 'saigon': 'VN', 'hanoi': 'VN', 'da nang': 'VN', 'hoi an': 'VN',
  'phnom penh': 'KH', 'siem reap': 'KH', 'angkor': 'KH',
  'vientiane': 'LA', 'luang prabang': 'LA',
  'yangon': 'MM', 'bagan': 'MM',

  'delhi': 'IN', 'mumbai': 'IN', 'bombay': 'IN', 'bangalore': 'IN', 'bengaluru': 'IN',
  'chennai': 'IN', 'kolkata': 'IN', 'calcutta': 'IN', 'hyderabad': 'IN',
  'goa': 'IN', 'jaipur': 'IN', 'agra': 'IN', 'varanasi': 'IN', 'kerala': 'IN',
  'kathmandu': 'NP', 'colombo': 'LK', 'dhaka': 'BD', 'maldives': 'MV', 'male': 'MV',
  'karachi': 'PK', 'lahore': 'PK', 'islamabad': 'PK',

  'sydney': 'AU', 'melbourne': 'AU', 'brisbane': 'AU', 'perth': 'AU',
  'adelaide': 'AU', 'gold coast': 'AU', 'cairns': 'AU', 'darwin': 'AU',
  'auckland': 'NZ', 'wellington': 'NZ', 'christchurch': 'NZ', 'queenstown': 'NZ',
  'fiji': 'FJ', 'tahiti': 'PF', 'bora bora': 'PF',

  'mexico city': 'MX', 'cancun': 'MX', 'playa del carmen': 'MX', 'tulum': 'MX',
  'guadalajara': 'MX', 'puerto vallarta': 'MX', 'cabo': 'MX', 'los cabos': 'MX',
  'panama city': 'PA', 'san jose cr': 'CR', 'guatemala city': 'GT',
  'havana': 'CU', 'santo domingo': 'DO', 'punta cana': 'DO',
  'kingston': 'JM', 'montego bay': 'JM', 'nassau': 'BS', 'aruba': 'AW',
  'san juan': 'PR', 'barbados': 'BB', 'curacao': 'CW', 'st maarten': 'SX',

  'sao paulo': 'BR', 'rio de janeiro': 'BR', 'rio': 'BR', 'brasilia': 'BR',
  'salvador': 'BR', 'recife': 'BR', 'fortaleza': 'BR',
  'buenos aires': 'AR', 'mendoza': 'AR', 'iguazu': 'AR', 'bariloche': 'AR',
  'ushuaia': 'AR', 'patagonia': 'AR',
  'santiago': 'CL', 'valparaiso': 'CL', 'easter island': 'CL',
  'lima': 'PE', 'cusco': 'PE', 'machu picchu': 'PE', 'arequipa': 'PE',
  'bogota': 'CO', 'medellin': 'CO', 'cartagena': 'CO',
  'quito': 'EC', 'galapagos': 'EC', 'guayaquil': 'EC',
  'caracas': 'VE', 'la paz': 'BO', 'uyuni': 'BO', 'asuncion': 'PY',
  'montevideo': 'UY',
};
