import { Kampung, Beneficiary } from '../types';

// Helper to get a date relative to today
const getRelativeDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

export const KAMPUNGS: Kampung[] = [
  { 
    id: '1', 
    name: 'Kampung Buayan, Penampang', 
    state: 'Sabah', 
    postcode: '89500', 
    geography: 'DEEP_RURAL', 
    lat: 5.7723, 
    lng: 116.1922 
  },
  { 
    id: '2', 
    name: 'Nanga Engkuah (Ulu Katibas)', 
    state: 'Sarawak', 
    postcode: '96850', 
    geography: 'DEEP_RURAL', 
    lat: 2.0224, 
    lng: 112.5518 
  },
  { 
    id: '3', 
    name: 'Kampung Mat Daling (Ulu Tembeling)', 
    state: 'Pahang', 
    postcode: '27000', 
    geography: 'DEEP_RURAL', 
    lat: 4.4068, 
    lng: 102.6145 
  },
  { 
    id: '4', 
    name: 'Pos Slim (Titiwangsa Range)', 
    state: 'Perak', 
    postcode: '31300', 
    geography: 'DEEP_RURAL', 
    lat: 4.5692, 
    lng: 101.2794 
  },
  { 
    id: '5', 
    name: 'Kampung Perlok Ulu Cheka', 
    state: 'Pahang', 
    postcode: '27000', 
    geography: 'RURAL', 
    lat: 3.9191, // N 3° 55' 8.9292"
    lng: 102.1975 // E 102° 11' 51.216"
  },
  { 
    id: '6', 
    name: 'Kampung Orang Asli Peta', 
    state: 'Johor', 
    postcode: '86800', 
    geography: 'DEEP_RURAL', 
    lat: 2.2117, // 2°12'42.2"N
    lng: 103.5360 // 103°32'09.5"E
  },
  { 
    id: '7', 
    name: 'Rumah Nyuka, Sungai (Sg.) Bangkit', 
    state: 'Sarawak', 
    postcode: '96800', 
    geography: 'DEEP_RURAL', 
    lat: 1.931655, 
    lng: 111.501342 
  },
  { 
    id: '8', 
    name: 'Pos Gob, Gua Musang', 
    state: 'Kelantan', 
    postcode: '18300', 
    geography: 'DEEP_RURAL', 
    lat: 4.9200, 
    lng: 101.7900 
  }
];

export const BENEFICIARIES_BY_KAMPUNG: Record<string, Beneficiary[]> = {
  '1': [
    { 
      ic: "500101-13-1234", 
      name: "Abu Bakar", 
      status: "Active",
      geography: 'DEEP_RURAL',
      lastScanDate: getRelativeDate(28),
      monthlyPayout: 1250,
      pendingMonths: 3,
      address: "No. 10, Jalan Utama, Kampung Buayan, 89500 Sabah",
      lastPaid: "Dec 2024",
      photoUrl: "/mock-photos/Malay Uncle1.png",
      completed: false
    },
    { 
      ic: "450101-03-2222", 
      name: "Mariam Isa", 
      status: "Active", 
      geography: 'DEEP_RURAL',
      lastScanDate: getRelativeDate(30),
      monthlyPayout: 850,
      pendingMonths: 3,
      address: "No. 15, Jalan Utama, Kampung Buayan, 89500 Sabah",
      lastPaid: "Dec 2024",
      photoUrl: "/mock-photos/Malay Aunty1.png",
      completed: false
    },
    { 
      ic: "750101-10-1111", 
      name: "Fatimah Binti Ali", 
      status: "Active", 
      geography: 'DEEP_RURAL',
      lastScanDate: getRelativeDate(25),
      monthlyPayout: 950,
      pendingMonths: 1,
      address: "No. 20, Jalan Utama, Kampung Buayan, 89500 Sabah",
      lastPaid: "Feb 2025",
      photoUrl: "/mock-photos/Malay Aunty2.png",
      completed: false
    },
    { 
      ic: "880303-01-9988", 
      name: "Wong Wei Chen", 
      status: "Active", 
      geography: 'DEEP_RURAL',
      lastScanDate: getRelativeDate(35),
      monthlyPayout: 1100,
      pendingMonths: 2,
      address: "No. 25, Jalan Utama, Kampung Buayan, 89500 Sabah",
      lastPaid: "Jan 2025",
      photoUrl: "/mock-photos/Chinese Uncle1.png",
      completed: false
    },
  ],
  '2': [
    {
      name: "Jugu anak Entalai",
      ic: "520412-13-5041",
      address: "Bilik 3, Rumah Panjang Nanga Engkuah, Ulu Katibas",
      status: "Active",
      geography: 'DEEP_RURAL',
      lastScanDate: getRelativeDate(40),
      monthlyPayout: 1200,
      pendingMonths: 2,
      lastPaid: "Jan 2025",
      photoUrl: "/mock-photos/Other Uncle1.png",
      completed: false
    },
    {
      name: "Margaret Sinau",
      ic: "581015-13-5226",
      address: "Bilik 15, Rumah Panjang Nanga Engkuah, 96850 Song",
      status: "Active",
      geography: 'DEEP_RURAL',
      lastScanDate: getRelativeDate(15),
      monthlyPayout: 900,
      pendingMonths: 1,
      lastPaid: "Feb 2025",
      photoUrl: "/mock-photos/Other Aunty1.png",
      completed: false
    },
    {
      name: "Clement Wong",
      ic: "540303-13-1123",
      address: "Lot A2, Simpang Sungai Katibas, Nanga Engkuah",
      status: "Active",
      geography: 'DEEP_RURAL',
      lastScanDate: getRelativeDate(60),
      monthlyPayout: 1000,
      pendingMonths: 3,
      lastPaid: "Dec 2024",
      photoUrl: "/mock-photos/Chinese Uncle2.png",
      completed: false
    },
    {
      name: "Siah binti Lamat",
      ic: "560707-13-9004",
      address: "Pondok Hulu, Tebingan Sungai Engkuah",
      status: "Active",
      geography: 'DEEP_RURAL',
      lastScanDate: getRelativeDate(20),
      monthlyPayout: 850,
      pendingMonths: 1,
      lastPaid: "Feb 2025",
      photoUrl: "/mock-photos/Malay Aunty3.png",
      completed: false
    }
  ],
  '3': [
    {
      name: "Idris bin Ramli",
      ic: "500120-06-5331",
      address: "No 22, Kampung Mat Daling, Ulu Tembeling, 27000 Jerantut",
      status: "Active",
      geography: 'DEEP_RURAL',
      lastScanDate: getRelativeDate(10),
      monthlyPayout: 1300,
      pendingMonths: 1,
      lastPaid: "Feb 2025",
      photoUrl: "/mock-photos/Malay Uncle2.png",
      completed: false
    },
    {
      name: "Rohani binti Hassan",
      ic: "570815-06-5882",
      address: "Lot 104, Jalan Sungai Tembeling, Kampung Mat Daling",
      status: "Active",
      geography: 'DEEP_RURAL',
      lastScanDate: getRelativeDate(45),
      monthlyPayout: 950,
      pendingMonths: 2,
      lastPaid: "Jan 2025",
      photoUrl: "/mock-photos/Malay Aunty4.png",
      completed: false
    },
    {
      name: "Tan Kah Ming",
      ic: "481102-06-1145",
      address: "Kedai Papan Lama, Jeti Kampung Mat Daling",
      status: "Active",
      geography: 'DEEP_RURAL',
      lastScanDate: getRelativeDate(30),
      monthlyPayout: 1100,
      pendingMonths: 1,
      lastPaid: "Feb 2025",
      photoUrl: "/mock-photos/Chinese Uncle1.png",
      completed: false
    },
    {
      name: "Bah Tuah",
      ic: "531230-06-9917",
      address: "Penempatan Orang Asli, Sempadan Mat Daling",
      status: "Active",
      geography: 'DEEP_RURAL',
      lastScanDate: getRelativeDate(90),
      monthlyPayout: 1000,
      pendingMonths: 3,
      lastPaid: "Dec 2024",
      photoUrl: "/mock-photos/Other Uncle2.png",
      completed: false
    }
  ],
  '4': [
    {
      name: "Bah Sidin a/l Pandak",
      ic: "590920-08-6013",
      address: "No 45, Pos Slim, Jalan Cameron Highlands, 31300 Ipoh",
      status: "Active",
      geography: 'DEEP_RURAL',
      lastScanDate: getRelativeDate(25),
      monthlyPayout: 1150,
      pendingMonths: 1,
      lastPaid: "Feb 2025",
      photoUrl: "/mock-photos/Other Uncle1.png",
      completed: false
    },
    {
      name: "Kamariyah binti Mat",
      ic: "550505-08-5114",
      address: "Kuarters Lama KKM, Pos Slim",
      status: "Active",
      geography: 'DEEP_RURAL',
      lastScanDate: getRelativeDate(50),
      monthlyPayout: 900,
      pendingMonths: 2,
      lastPaid: "Jan 2025",
      photoUrl: "/mock-photos/Malay Aunty1.png",
      completed: false
    },
    {
      name: "Lee Ah Sang",
      ic: "510618-08-1127",
      address: "Kebun Lereng Bukit, Batu 24, Pos Slim",
      status: "Active",
      geography: 'DEEP_RURAL',
      lastScanDate: getRelativeDate(12),
      monthlyPayout: 1050,
      pendingMonths: 1,
      lastPaid: "Feb 2025",
      photoUrl: "/mock-photos/Chinese Uncle2.png",
      completed: false
    },
    {
      name: "Fatimah binti Isa",
      ic: "541010-08-5992",
      address: "Rumah No 8, Lorong Belakang, Pos Slim",
      status: "Active",
      geography: 'DEEP_RURAL',
      lastScanDate: getRelativeDate(35),
      monthlyPayout: 850,
      pendingMonths: 2,
      lastPaid: "Jan 2025",
      photoUrl: "/mock-photos/Malay Aunty2.png",
      completed: false
    }
  ],
  '5': [
    {
      name: "Mail bin Deris",
      ic: "FAKE-PHG-UC-001",
      address: "No. 12, Kampung Perlok Ulu Cheka, 27000 Jerantut, Pahang",
      status: "Active",
      geography: 'RURAL',
      lastScanDate: getRelativeDate(18),
      monthlyPayout: 1200,
      pendingMonths: 1,
      lastPaid: "Feb 2025",
      photoUrl: "/mock-photos/Malay Uncle3.png",
      completed: false
    },
    {
      name: "Awi anak Jantan",
      ic: "FAKE-PHG-UC-002",
      address: "No. 25, Kampung Perlok Ulu Cheka, 27000 Jerantut, Pahang",
      status: "Active",
      geography: 'RURAL',
      lastScanDate: getRelativeDate(42),
      monthlyPayout: 950,
      pendingMonths: 2,
      lastPaid: "Jan 2025",
      photoUrl: "/mock-photos/Other Uncle2.png",
      completed: false
    },
    {
      name: "Lim Ah Seng",
      ic: "FAKE-PHG-UC-003",
      address: "No. 8, Kampung Perlok Ulu Cheka, 27000 Jerantut, Pahang",
      status: "Active",
      geography: 'RURAL',
      lastScanDate: getRelativeDate(22),
      monthlyPayout: 1100,
      pendingMonths: 1,
      lastPaid: "Feb 2025",
      photoUrl: "/mock-photos/Chinese Uncle1.png",
      completed: false
    },
    {
      name: "Ramasamy a/l Subramaniam",
      ic: "FAKE-PHG-UC-004",
      address: "No. 33, Kampung Perlok Ulu Cheka, 27000 Jerantut, Pahang",
      status: "Active",
      geography: 'RURAL',
      lastScanDate: getRelativeDate(55),
      monthlyPayout: 1000,
      pendingMonths: 3,
      lastPaid: "Dec 2024",
      photoUrl: "/mock-photos/Indian Uncle1.png",
      completed: false
    }
  ],
  '6': [
    {
      name: "Rahman bin Talib",
      ic: "FAKE-JHR-KP-001",
      address: "No. 5, Kampung Orang Asli Peta, Ulu Endau, Johor, 86800, Mersing",
      status: "Active",
      geography: 'DEEP_RURAL',
      lastScanDate: getRelativeDate(14),
      monthlyPayout: 1250,
      pendingMonths: 1,
      lastPaid: "Feb 2025",
      photoUrl: "/mock-photos/Malay Uncle4.png",
      completed: false
    },
    {
      name: "Jantan anak Busu",
      ic: "FAKE-JHR-KP-002",
      address: "No. 18, Kampung Orang Asli Peta, Ulu Endau, Johor, 86800, Mersing",
      status: "Active",
      geography: 'DEEP_RURAL',
      lastScanDate: getRelativeDate(38),
      monthlyPayout: 900,
      pendingMonths: 2,
      lastPaid: "Jan 2025",
      photoUrl: "/mock-photos/Other Uncle1.png",
      completed: false
    },
    {
      name: "Tan Kok Leong",
      ic: "FAKE-JHR-KP-003",
      address: "No. 22, Kampung Orang Asli Peta, Ulu Endau, Johor, 86800, Mersing",
      status: "Active",
      geography: 'DEEP_RURAL',
      lastScanDate: getRelativeDate(26),
      monthlyPayout: 1150,
      pendingMonths: 1,
      lastPaid: "Feb 2025",
      photoUrl: "/mock-photos/Chinese Uncle2.png",
      completed: false
    },
    {
      name: "Arumugam a/l Muthu",
      ic: "FAKE-JHR-KP-004",
      address: "No. 9, Kampung Orang Asli Peta, Ulu Endau, Johor, 86800, Mersing",
      status: "Active",
      geography: 'DEEP_RURAL',
      lastScanDate: getRelativeDate(65),
      monthlyPayout: 1050,
      pendingMonths: 3,
      lastPaid: "Dec 2024",
      photoUrl: "/mock-photos/Indian Uncle2.png",
      completed: false
    }
  ],
  '7': [
    {
      name: "Nyuka anak Bakit",
      ic: "510312-13-5091",
      address: "Bilik No. 1, Rumah Panjang Nyuka, Sg. Bangkit, 96800 Kapit",
      status: "Active",
      geography: 'DEEP_RURAL',
      lastScanDate: getRelativeDate(20),
      monthlyPayout: 1300,
      pendingMonths: 1,
      lastPaid: "Feb 2025",
      photoUrl: "/mock-photos/Other Uncle2.png",
      completed: false
    },
    {
      name: "Indai Laja binti Gani",
      ic: "560715-13-5882",
      address: "Bilik No. 14, Rumah Panjang Nyuka, Sg. Bangkit, 96800 Kapit",
      status: "Active",
      geography: 'DEEP_RURAL',
      lastScanDate: getRelativeDate(48),
      monthlyPayout: 950,
      pendingMonths: 2,
      lastPaid: "Jan 2025",
      photoUrl: "/mock-photos/Other Aunty2.png",
      completed: false
    },
    {
      name: "Jabu anak Enti",
      ic: "481120-13-6113",
      address: "Unit Tepi Sungai, Rumah Panjang Nyuka, Sg. Bangkit, 96800 Kapit",
      status: "Active",
      geography: 'DEEP_RURAL',
      lastScanDate: getRelativeDate(32),
      monthlyPayout: 1100,
      pendingMonths: 1,
      lastPaid: "Feb 2025",
      photoUrl: "/mock-photos/Other Uncle1.png",
      completed: false
    },
    {
      name: "Margaret Sulan",
      ic: "590403-13-5224",
      address: "Bilik No. 8, Rumah Panjang Nyuka, Sg. Bangkit, 96800 Kapit",
      status: "Active",
      geography: 'DEEP_RURAL',
      lastScanDate: getRelativeDate(70),
      monthlyPayout: 900,
      pendingMonths: 3,
      lastPaid: "Dec 2024",
      photoUrl: "/mock-photos/Other Aunty1.png",
      completed: false
    }
  ],
  '8': [
    {
      name: "Along anak Angah",
      ic: "531015-03-5113",
      address: "Kampung Gawin, Pos Gob, 18300 Gua Musang",
      status: "Active",
      geography: 'DEEP_RURAL',
      lastScanDate: getRelativeDate(16),
      monthlyPayout: 1200,
      pendingMonths: 1,
      lastPaid: "Feb 2025",
      photoUrl: "/mock-photos/Other Uncle2.png",
      completed: false
    },
    {
      name: "Itam binti Penloi",
      ic: "570412-03-5824",
      address: "Kampung Kembok, Pos Gob, 18300 Gua Musang",
      status: "Active",
      geography: 'DEEP_RURAL',
      lastScanDate: getRelativeDate(44),
      monthlyPayout: 900,
      pendingMonths: 2,
      lastPaid: "Jan 2025",
      photoUrl: "/mock-photos/Other Aunty2.png",
      completed: false
    },
    {
      name: "Pandak bin Suda",
      ic: "490101-03-6221",
      address: "No. 5, Pos Gob Tengah, 18300 Gua Musang",
      status: "Active",
      geography: 'DEEP_RURAL',
      lastScanDate: getRelativeDate(28),
      monthlyPayout: 1050,
      pendingMonths: 1,
      lastPaid: "Feb 2025",
      photoUrl: "/mock-photos/Other Uncle1.png",
      completed: false
    },
    {
      name: "Alang binti Busu",
      ic: "550820-03-5442",
      address: "Pos Gob, D/A Pejabat JAKOA Gua Musang",
      status: "Active",
      geography: 'DEEP_RURAL',
      lastScanDate: getRelativeDate(62),
      monthlyPayout: 850,
      pendingMonths: 3,
      lastPaid: "Dec 2024",
      photoUrl: "/mock-photos/Other Aunty1.png",
      completed: false
    }
  ]
};
