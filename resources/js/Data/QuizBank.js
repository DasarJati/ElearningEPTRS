// This file contains all your questions and can be imported by QuizPage
import standardMathematicQuestions from './StandardMathematicQuestions';
import standardScienceQuestions from './StandardScienceQuestions';
import kemahiranHidupQuestions from './KemahiranHidupQuestions';
import standardHistoryQuestions from './StandardHistoryQuestions';
import generalKnowledgeQuestionBank from './GeneralKnowledgeQuestionBank';

const QUIZ_TOPIC_ROTATION_STORAGE_KEY = 'ptrs-quiz-topic-rotation-index';
const GENERAL_TOPIC_ROTATION = [
  ['Haiwan', 'Planet'],
  ['Tokoh Malaysia', 'Perdana Menteri Malaysia'],
  ['Tubuh Manusia', 'Haiwan'],
  ['Planet', 'Tokoh Malaysia'],
  ['Perdana Menteri Malaysia', 'Tubuh Manusia'],
];

export const questionBank = {
  mathematic: standardMathematicQuestions,
  science: standardScienceQuestions,
  kemahiran_hidup: kemahiranHidupQuestions,
  history: standardHistoryQuestions,
  new: [
    {
      "id": 121,
      "question": "Apakah lapisan atmosfera yang paling hampir dengan permukaan bumi?",
      "options": ["Troposfera", "Stratosfera", "Mesosfera", "Termosfera"],
      "correctAnswer": 0,
      "explanation": "Troposfera ialah lapisan paling hampir dengan bumi dan mengandungi kebanyakan cuaca.",
      "category": "Sains - Alam Sekitar",
      "difficulty": "medium"
    },
    {
      "id": 122,
      "question": "Fenomena air laut naik ke daratan akibat tarikan graviti bulan dikenali sebagai?",
      "options": ["Arus", "Pasang surut", "Ombak", "Tsunami"],
      "correctAnswer": 1,
      "explanation": "Pasang surut berlaku kerana tarikan graviti bulan terhadap air laut.",
      "category": "Sains - Alam Semesta",
      "difficulty": "medium"
    },
    {
      "id": 123,
      "question": "Apakah langkah paling berkesan untuk mengurangkan pencemaran udara di bandar?",
      "options": ["Mengurangkan penggunaan kenderaan bermotor", "Menanam lebih banyak pokok", "Membuang sampah ke laut", "Menggunakan lebih banyak pendingin hawa"],
      "correctAnswer": 0,
      "explanation": "Mengurangkan kenderaan bermotor dapat mengurangkan pelepasan asap dan gas berbahaya.",
      "category": "Sains - Alam Sekitar",
      "difficulty": "hard"
    },
    {
      "id": 124,
      "question": "Apakah sumber tenaga boleh diperbaharui yang paling banyak digunakan di Malaysia?",
      "options": ["Tenaga solar", "Tenaga angin", "Tenaga hidro", "Tenaga nuklear"],
      "correctAnswer": 2,
      "explanation": "Malaysia banyak menggunakan tenaga hidro melalui empangan.",
      "category": "Sains - Tenaga",
      "difficulty": "medium"
    },
    {
      "id": 125,
      "question": "Apakah proses utama dalam kitaran air yang membentuk awan?",
      "options": ["Penyejatan", "Penyejukan", "Penyinaran", "Fotosintesis"],
      "correctAnswer": 0,
      "explanation": "Air menyejat ke atmosfera, lalu terkondensasi menjadi awan.",
      "category": "Sains - Proses Semula Jadi",
      "difficulty": "medium"
    },
    {
      "id": 126,
      "question": "Apakah akibat utama penipisan lapisan ozon?",
      "options": ["Kenaikan aras laut", "Pendedahan kepada sinaran UV berlebihan", "Kekurangan oksigen", "Letupan gunung berapi"],
      "correctAnswer": 1,
      "explanation": "Penipisan ozon menyebabkan sinaran UV lebih banyak menembusi bumi.",
      "category": "Sains - Alam Sekitar",
      "difficulty": "hard"
    },
    {
      "id": 127,
      "question": "Apakah contoh inovasi teknologi hijau dalam pengangkutan?",
      "options": ["Kereta elektrik", "Kapal diesel", "Pesawat supersonik", "Bas petrol"],
      "correctAnswer": 0,
      "explanation": "Kereta elektrik menggunakan tenaga boleh diperbaharui dan kurang pencemaran.",
      "category": "Sains - Teknologi",
      "difficulty": "medium"
    },
    {
      "id": 128,
      "question": "Kitaran hidup nyamuk bermula daripada?",
      "options": ["Pupa", "Larva", "Telur", "Dewasa"],
      "correctAnswer": 2,
      "explanation": "Nyamuk bermula dari telur → larva → pupa → dewasa.",
      "category": "Sains - Kehidupan",
      "difficulty": "medium"
    },
    {
      "id": 129,
      "question": "Apakah tenaga utama yang membekalkan bumi dengan cahaya dan haba?",
      "options": ["Tenaga elektrik", "Tenaga suria", "Tenaga geoterma", "Tenaga nuklear"],
      "correctAnswer": 1,
      "explanation": "Matahari membekalkan bumi dengan tenaga suria.",
      "category": "Sains - Tenaga",
      "difficulty": "easy"
    },
    {
      "id": 130,
      "question": "Apakah kesan utama penebangan hutan secara berlebihan?",
      "options": ["Meningkatkan biodiversiti", "Meningkatkan kadar hakisan tanah", "Mengurangkan pencemaran udara", "Meningkatkan kandungan oksigen"],
      "correctAnswer": 1,
      "explanation": "Penebangan hutan menyebabkan tanah mudah terhakis.",
      "category": "Sains - Alam Sekitar",
      "difficulty": "medium"
    },
    {
      "id": 131,
      "question": "Planet manakah yang dikenali sebagai 'Planet Merah'?",
      "options": ["Bumi", "Marikh", "Zuhal", "Musytari"],
      "correctAnswer": 1,
      "explanation": "Marikh kelihatan merah kerana kandungan besi oksida di permukaannya.",
      "category": "Sains - Astronomi",
      "difficulty": "easy"
    },
    {
      "id": 132,
      "question": "Apakah teknologi yang digunakan untuk mengesan gempa bumi?",
      "options": ["Barometer", "Seismograf", "Termometer", "Altimeter"],
      "correctAnswer": 1,
      "explanation": "Seismograf digunakan untuk mengukur gegaran bumi.",
      "category": "Sains - Teknologi",
      "difficulty": "medium"
    },
    {
      "id": 133,
      "question": "Kitaran air adalah penting untuk...",
      "options": ["Menambah suhu bumi", "Mengekalkan bekalan air tawar", "Menghasilkan udara bersih", "Meningkatkan tenaga suria"],
      "correctAnswer": 1,
      "explanation": "Kitaran air membekalkan semula air tawar ke bumi.",
      "category": "Sains - Proses Semula Jadi",
      "difficulty": "medium"
    },
    {
      "id": 134,
      "question": "Apakah contoh tenaga boleh baharu yang sesuai di kawasan pantai?",
      "options": ["Tenaga angin", "Tenaga arang batu", "Tenaga nuklear", "Tenaga diesel"],
      "correctAnswer": 0,
      "explanation": "Kawasan pantai sesuai untuk jana kuasa angin.",
      "category": "Sains - Tenaga",
      "difficulty": "medium"
    },
    {
      "id": 135,
      "question": "Apakah komponen utama dalam sistem suria?",
      "options": ["Bintang lain", "Matahari dan planet", "Nebula", "Komet sahaja"],
      "correctAnswer": 1,
      "explanation": "Sistem suria terdiri daripada matahari, planet, bulan, asteroid, komet.",
      "category": "Sains - Astronomi",
      "difficulty": "medium"
    },
    {
      "id": 136,
      "question": "Apakah kesan rumah hijau semula jadi kepada bumi?",
      "options": ["Menjadikan bumi terlalu panas", "Mengekalkan suhu sesuai untuk kehidupan", "Menghasilkan gas toksik", "Mengurangkan oksigen"],
      "correctAnswer": 1,
      "explanation": "Kesan rumah hijau semula jadi mengekalkan suhu stabil.",
      "category": "Sains - Alam Sekitar",
      "difficulty": "medium"
    },
    {
      "id": 137,
      "question": "Apakah inovasi yang membantu manusia berhubung secara jarak jauh?",
      "options": ["Robot", "Telefon pintar", "Komputer riba", "Televisyen"],
      "correctAnswer": 1,
      "explanation": "Telefon pintar membolehkan komunikasi jarak jauh dengan mudah.",
      "category": "Sains - Teknologi",
      "difficulty": "easy"
    },
    {
      "id": 138,
      "question": "Apakah fenomena alam yang berlaku apabila cahaya matahari dibiaskan oleh titisan air hujan?",
      "options": ["Halo", "Gerhana", "Pelangi", "Aurora"],
      "correctAnswer": 2,
      "explanation": "Pelangi terbentuk kerana pembiasan dan pantulan cahaya dalam titisan air.",
      "category": "Sains - Alam Semesta",
      "difficulty": "medium"
    },
    {
      "id": 139,
      "question": "Apakah langkah terbaik untuk mengurangkan pencemaran plastik?",
      "options": ["Menggunakan plastik sekali guna", "Mengitar semula dan guna semula", "Membuang plastik ke sungai", "Meningkatkan pembakaran plastik"],
      "correctAnswer": 1,
      "explanation": "Kitar semula dan guna semula dapat kurangkan pencemaran plastik.",
      "category": "Sains - Alam Sekitar",
      "difficulty": "hard"
    },
    {
      "id": 140,
      "question": "Apakah sumber tenaga utama bagi tumbuhan untuk fotosintesis?",
      "options": ["Air", "Oksigen", "Cahaya matahari", "Tanah"],
      "correctAnswer": 2,
      "explanation": "Fotosintesis memerlukan cahaya matahari sebagai sumber tenaga.",
      "category": "Sains - Tenaga",
      "difficulty": "medium"
    },
    {
      "id": 141,
      "question": "Jika 5x + 7 = 27, berapakah nilai x?",
      "options": ["2", "3", "4", "5"],
      "correctAnswer": 2,
      "explanation": "5x + 7 = 27 → 5x = 20 → x = 4.",
      "category": "Matematik - Algebra",
      "difficulty": "medium"
    },
    {
      "id": 142,
      "question": "Cari nilai p: 2p² - 8 = 0.",
      "options": ["±2", "±4", "2 sahaja", "-2 sahaja"],
      "correctAnswer": 0,
      "explanation": "2p² - 8 = 0 → p² = 4 → p = ±2.",
      "category": "Matematik - Algebra",
      "difficulty": "medium"
    },
    {
      "id": 143,
      "question": "Sebuah segitiga mempunyai sisi 6 cm, 8 cm, dan 10 cm. Apakah jenis segitiga ini?",
      "options": ["Sama sisi", "Sama kaki", "Tegak", "Siku tumpul"],
      "correctAnswer": 2,
      "explanation": "6² + 8² = 36 + 64 = 100 = 10², maka segitiga siku-siku.",
      "category": "Matematik - Geometri",
      "difficulty": "medium"
    },
    {
      "id": 144,
      "question": "Kira kebarangkalian mendapat nombor genap apabila sebiji dadu dilontar.",
      "options": ["1/3", "1/2", "2/3", "1/6"],
      "correctAnswer": 1,
      "explanation": "Nombor genap = {2,4,6} → 3/6 = 1/2.",
      "category": "Matematik - Kebarangkalian",
      "difficulty": "medium"
    },
    {
      "id": 145,
      "question": "Kira min bagi data: 4, 6, 8, 10, 12.",
      "options": ["8", "9", "7", "6"],
      "correctAnswer": 0,
      "explanation": "(4+6+8+10+12)/5 = 40/5 = 8.",
      "category": "Matematik - Statistik",
      "difficulty": "easy"
    },
    {
      "id": 146,
      "question": "Luas sebuah bulatan dengan jejari 7 cm ialah?",
      "options": ["154 cm²", "144 cm²", "147 cm²", "150 cm²"],
      "correctAnswer": 0,
      "explanation": "Luas = πr² = 22/7 × 7² = 154 cm².",
      "category": "Matematik - Geometri",
      "difficulty": "medium"
    },
    {
      "id": 147,
      "question": "Selesaikan: log₁₀(1000) = ?",
      "options": ["1", "2", "3", "4"],
      "correctAnswer": 2,
      "explanation": "10³ = 1000, maka log₁₀(1000) = 3.",
      "category": "Matematik - Logaritma",
      "difficulty": "medium"
    },
    {
      "id": 148,
      "question": "Berapakah nilai cos 60°?",
      "options": ["0.5", "0.707", "0.866", "1"],
      "correctAnswer": 0,
      "explanation": "cos 60° = 1/2 = 0.5.",
      "category": "Matematik - Trigonometri",
      "difficulty": "easy"
    },
    {
      "id": 149,
      "question": "Jika sin θ = 3/5, cari cos θ bagi sudut tirus.",
      "options": ["4/5", "3/5", "5/3", "12/13"],
      "correctAnswer": 0,
      "explanation": "cos²θ = 1 - sin²θ = 1 - (9/25) = 16/25, cos θ = 4/5.",
      "category": "Matematik - Trigonometri",
      "difficulty": "hard"
    },
    {
      "id": 150,
      "question": "Cari kecerunan garis melalui titik (2,3) dan (6,11).",
      "options": ["1", "2", "3", "4"],
      "correctAnswer": 1,
      "explanation": "m = (11-3)/(6-2) = 8/4 = 2.",
      "category": "Matematik - Koordinat",
      "difficulty": "medium"
    },
    {
      "id": 151,
      "question": "Penyelesaian bagi 2(3x - 4) = 10 ialah?",
      "options": ["x = 2", "x = 3", "x = 4", "x = 5"],
      "correctAnswer": 1,
      "explanation": "6x - 8 = 10 → 6x = 18 → x = 3.",
      "category": "Matematik - Algebra",
      "difficulty": "medium"
    },
    {
      "id": 152,
      "question": "Apakah hasil tambah sudut dalam segiempat sama?",
      "options": ["180°", "270°", "360°", "540°"],
      "correctAnswer": 2,
      "explanation": "Jumlah sudut dalam segiempat ialah 360°.",
      "category": "Matematik - Geometri",
      "difficulty": "easy"
    },
    {
      "id": 153,
      "question": "Diberi mod data: 5, 6, 6, 7, 8, 9, 9, 9, 10. Apakah mod?",
      "options": ["6", "7", "8", "9"],
      "correctAnswer": 3,
      "explanation": "Nilai 9 paling kerap muncul (3 kali).",
      "category": "Matematik - Statistik",
      "difficulty": "medium"
    },
    {
      "id": 154,
      "question": "Kebarangkalian memilih huruf vokal daripada perkataan 'MALAYSIA' ialah?",
      "options": ["3/8", "4/8", "5/8", "6/8"],
      "correctAnswer": 1,
      "explanation": "Vokal = A, A, I, A (4 huruf). Jumlah = 8. 4/8 = 1/2.",
      "category": "Matematik - Kebarangkalian",
      "difficulty": "medium"
    },
    {
      "id": 155,
      "question": "Jika y berterusan secara langsung dengan x dan y=12 apabila x=4, cari y apabila x=10.",
      "options": ["20", "25", "30", "40"],
      "correctAnswer": 2,
      "explanation": "y/x = 12/4 = 3 → y = 3(10) = 30.",
      "category": "Matematik - Perkaitan",
      "difficulty": "medium"
    },
    {
      "id": 156,
      "question": "Hitung luas trapezium dengan tapak selari 8 cm dan 12 cm serta tinggi 5 cm.",
      "options": ["45 cm²", "50 cm²", "55 cm²", "60 cm²"],
      "correctAnswer": 1,
      "explanation": "Luas = 1/2 × (8+12) × 5 = 50 cm².",
      "category": "Matematik - Geometri",
      "difficulty": "medium"
    },
    {
      "id": 157,
      "question": "Cari median bagi data: 2, 4, 6, 8, 10, 12, 14.",
      "options": ["6", "7", "8", "9"],
      "correctAnswer": 2,
      "explanation": "Data tengah ialah 8.",
      "category": "Matematik - Statistik",
      "difficulty": "easy"
    },
    {
      "id": 158,
      "question": "Berapakah nilai √196?",
      "options": ["12", "13", "14", "15"],
      "correctAnswer": 2,
      "explanation": "√196 = 14.",
      "category": "Matematik - Nombor",
      "difficulty": "easy"
    },
    {
      "id": 159,
      "question": "Persamaan garis yang melalui (0,2) dan berkecerunan 3 ialah?",
      "options": ["y=2x+3", "y=3x+2", "y=3x-2", "y=2x-3"],
      "correctAnswer": 1,
      "explanation": "Garis lurus: y = mx + c, m=3, c=2 → y=3x+2.",
      "category": "Matematik - Koordinat",
      "difficulty": "medium"
    },
    {
      "id": 160,
      "question": "Berapakah luas permukaan sfera dengan jejari 7 cm?",
      "options": ["616 cm²", "628 cm²", "700 cm²", "720 cm²"],
      "correctAnswer": 0,
      "explanation": "Luas = 4πr² = 4 × 22/7 × 49 = 616 cm².",
      "category": "Matematik - Geometri",
      "difficulty": "hard"
    },
    {
      "id": 161,
      "question": "Apakah faktor utama kedatangan kuasa Barat ke Asia Tenggara pada abad ke-16?",
      "options": ["Menyebarkan agama", "Mencari rempah-ratus", "Membina empayar", "Mencari buruh murah"],
      "correctAnswer": 1,
      "explanation": "Kuasa Barat tertarik dengan kekayaan rempah-ratus di Asia Tenggara.",
      "category": "Sejarah - Penjajahan",
      "difficulty": "medium"
    },
    {
      "id": 162,
      "question": "Siapakah tokoh yang menentang British dalam Perang Naning?",
      "options": ["Dato' Maharajalela", "Dol Said", "Mat Kilau", "Tok Janggut"],
      "correctAnswer": 1,
      "explanation": "Dol Said, penghulu Naning, menentang British yang mahu mengutip cukai.",
      "category": "Sejarah - Penentangan",
      "difficulty": "medium"
    },
    {
      "id": 163,
      "question": "Apakah kesan Perjanjian Pangkor 1874 terhadap pentadbiran Perak?",
      "options": ["Raja kehilangan kuasa mutlak", "British menguasai hasil bijih timah", "Pembentukan Negeri-Negeri Selat", "Kedatangan tentera Jepun"],
      "correctAnswer": 0,
      "explanation": "Perjanjian Pangkor mewujudkan sistem Residen, mengurangkan kuasa Sultan.",
      "category": "Sejarah - Penjajahan",
      "difficulty": "hard"
    },
    {
      "id": 164,
      "question": "Siapakah tokoh pejuang Pahang yang menentang British bersama Tok Gajah?",
      "options": ["Mat Salleh", "Mat Kilau", "Haji Abdul Rahman Limbong", "Dato' Bahaman"],
      "correctAnswer": 1,
      "explanation": "Mat Kilau bersama Tok Gajah memimpin penentangan di Pahang.",
      "category": "Sejarah - Penentangan",
      "difficulty": "medium"
    },
    {
      "id": 165,
      "question": "Apakah tujuan penubuhan Malayan Union pada 1946?",
      "options": ["Menyatukan Tanah Melayu di bawah satu pentadbiran", "Menguatkan kuasa Sultan", "Memberi kemerdekaan segera", "Mengusir Jepun"],
      "correctAnswer": 0,
      "explanation": "British menubuhkan Malayan Union untuk menyatukan pentadbiran tetapi mendapat tentangan hebat.",
      "category": "Sejarah - Politik",
      "difficulty": "medium"
    },
    {
      "id": 166,
      "question": "Apakah pertubuhan politik utama yang menentang Malayan Union?",
      "options": ["PKMM", "UMNO", "MCA", "MIC"],
      "correctAnswer": 1,
      "explanation": "UMNO ditubuhkan pada 1946 khusus untuk menentang Malayan Union.",
      "category": "Sejarah - Politik",
      "difficulty": "medium"
    },
    // {
    //   "id": 167,
    //   "question": "Siapakah tokoh yang digelar 'Bapa Transformasi' Malaysia?",
    //   "options": ["Tun Abdul Razak", "Tunku Abdul Rahman", "Dato' Onn Jaafar", "Tun Hussein Onn"],
    //   "correctAnswer": 1,
    //   "explanation": "Tunku Abdul Rahman mengetuai rundingan kemerdekaan dengan British.",
    //   "category": "Sejarah - Kemerdekaan",
    //   "difficulty": "easy"
    // },
    {
      "id": 168,
      "question": "Apakah peranan Dato' Maharajalela dalam Perang Perak?",
      "options": ["Menentang pembinaan landasan kereta api", "Memimpin pembunuhan J.W.W Birch", "Menjadi Residen British pertama", "Menyokong Malayan Union"],
      "correctAnswer": 1,
      "explanation": "Dato' Maharajalela merupakan pemimpin utama dalam pembunuhan J.W.W. Birch, Residen British pertama di Perak, pada 2 November 1875 di Pasir Salak. Peristiwa ini mencetuskan Perang Perak.",
      "category": "Sejarah - Penentangan",
      "difficulty": "hard"
    },
    {
      "id": 169,
      "question": "Bilakah Tanah Melayu mencapai kemerdekaan?",
      "options": ["31 Ogos 1955", "31 Ogos 1957", "16 September 1963", "31 Ogos 1965"],
      "correctAnswer": 1,
      "explanation": "Tanah Melayu merdeka pada 31 Ogos 1957.",
      "category": "Sejarah - Kemerdekaan",
      "difficulty": "easy"
    },
    {
      "id": 170,
      "question": "Mengapakah Jepun menyerah kalah pada tahun 1945?",
      "options": ["Serangan besar tentera British", "Kebangkitan rakyat tempatan", "Letupan bom atom di Hiroshima dan Nagasaki", "Kekurangan tentera"],
      "correctAnswer": 2,
      "explanation": "Jepun menyerah selepas bom atom dijatuhkan di Hiroshima dan Nagasaki.",
      "category": "Sejarah - Penjajahan Jepun",
      "difficulty": "medium"
    },
    {
      "id": 171,
      "question": "Apakah tujuan utama Rukun Negara diperkenalkan?",
      "options": ["Mewujudkan perpaduan", "Meningkatkan pertanian", "Memperkukuh sistem raja", "Menghalang penjajahan"],
      "correctAnswer": 0,
      "explanation": "Rukun Negara diperkenalkan pada 1970 untuk memupuk perpaduan selepas 13 Mei 1969.",
      "category": "Sejarah - Malaysia Moden",
      "difficulty": "medium"
    },
    {
      "id": 172,
      "question": "Apakah maksud Dasar Ekonomi Baru (DEB) yang diperkenalkan pada 1971?",
      "options": ["Menghapuskan buta huruf", "Menghapuskan kemiskinan dan menyusun semula masyarakat", "Meningkatkan teknologi", "Menyatukan pentadbiran negeri"],
      "correctAnswer": 1,
      "explanation": "DEB bertujuan menghapuskan kemiskinan tanpa mengira kaum dan menyusun semula masyarakat.",
      "category": "Sejarah - Ekonomi",
      "difficulty": "hard"
    },
    {
      "id": 173,
      "question": "Negara manakah yang menarik diri daripada Malaysia pada tahun 1965?",
      "options": ["Singapura", "Brunei", "Sabah", "Sarawak"],
      "correctAnswer": 0,
      "explanation": "Singapura keluar daripada Malaysia pada 9 Ogos 1965.",
      "category": "Sejarah - Malaysia",
      "difficulty": "medium"
    },
    {
      "id": 174,
      "question": "Apakah matlamat utama Dasar Pandang Ke Timur yang diperkenalkan pada 1982?",
      "options": ["Mencontohi semangat kerja Jepun dan Korea", "Mengurangkan hubungan dengan Barat", "Menghapuskan kemiskinan", "Mewujudkan universiti tempatan"],
      "correctAnswer": 0,
      "explanation": "Dasar Pandang Ke Timur menekankan etika kerja Jepun dan Korea.",
      "category": "Sejarah - Ekonomi",
      "difficulty": "medium"
    },
    {
      "id": 175,
      "question": "Apakah slogan utama Wawasan 2020?",
      "options": ["Malaysia Boleh", "Rakyat Didahulukan", "Masyarakat Maju", "Kemakmuran Bersama"],
      "correctAnswer": 0,
      "explanation": "Slogan Malaysia Boleh dikaitkan dengan Wawasan 2020.",
      "category": "Sejarah - Malaysia Moden",
      "difficulty": "medium"
    },
    {
      "id": 176,
      "question": "Siapakah Perdana Menteri Malaysia kedua?",
      "options": ["Tun Hussein Onn", "Tun Abdul Razak", "Tunku Abdul Rahman", "Tun Dr. Mahathir Mohamad"],
      "correctAnswer": 1,
      "explanation": "Tun Abdul Razak menjadi Perdana Menteri kedua selepas Tunku Abdul Rahman.",
      "category": "Sejarah - Politik",
      "difficulty": "easy"
    },
    {
      "id": 177,
      "question": "Apakah peristiwa bersejarah pada 16 September 1963?",
      "options": ["Kemerdekaan Tanah Melayu", "Pembentukan Malaysia", "Singapura keluar Malaysia", "Rukun Negara diumumkan"],
      "correctAnswer": 1,
      "explanation": "Malaysia dibentuk pada 16 September 1963 bersama Sabah, Sarawak dan Singapura.",
      "category": "Sejarah - Malaysia",
      "difficulty": "medium"
    },
    {
      "id": 178,
      "question": "Apakah tujuan penubuhan ASEAN pada tahun 1967?",
      "options": ["Membentuk pasukan tentera", "Meningkatkan kerjasama serantau", "Menentang penjajahan", "Menyatukan mata wang"],
      "correctAnswer": 1,
      "explanation": "ASEAN ditubuhkan untuk mengukuhkan kerjasama politik, ekonomi dan sosial.",
      "category": "Sejarah - Antarabangsa",
      "difficulty": "medium"
    },
    {
      "id": 179,
      "question": "Siapakah yang digelar 'Bapa Pembangunan' Malaysia?",
      "options": ["Tun Abdul Razak", "Tun Hussein Onn", "Tun Dr. Mahathir Mohamad", "Tunku Abdul Rahman"],
      "correctAnswer": 0,
      "explanation": "Tun Abdul Razak dikenali sebagai Bapa Pembangunan kerana memperkenalkan DEB.",
      "category": "Sejarah - Politik",
      "difficulty": "medium"
    },
    {
      "id": 180,
      "question": "Apakah kesan utama tragedi 13 Mei 1969 kepada Malaysia?",
      "options": ["Pembentukan Malaysia", "Pengisytiharan darurat dan penggantungan Parlimen", "Kemerdekaan Tanah Melayu", "Keluar Singapura"],
      "correctAnswer": 1,
      "explanation": "Tragedi 13 Mei membawa kepada pengisytiharan darurat dan penubuhan MAGERAN.",
      "category": "Sejarah - Malaysia Moden",
      "difficulty": "hard"
    }
  ]
};
// Improved shuffle function using Fisher-Yates algorithm
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Fungsi baru: mengacak opsi dan mengupdate correctAnswer
const shuffleQuestionOptions = (question) => {
  const options = [...question.options];
  const correctAnswerIndex = question.correctAnswer;

  // Simpan jawaban yang benar sebelum mengacak
  const correctAnswerValue = options[correctAnswerIndex];

  // Acak opsi
  const shuffledOptions = shuffleArray(options);

  // Cari indeks baru dari jawaban yang benar
  const newCorrectAnswerIndex = shuffledOptions.indexOf(correctAnswerValue);

  // Return pertanyaan dengan opsi yang diacak dan correctAnswer yang diperbarui
  return {
    ...question,
    options: shuffledOptions,
    correctAnswer: newCorrectAnswerIndex
  };
};

// Question rotation manager
class QuestionRotationManager {
  constructor() {
    this.usedQuestions = new Set(); // Track used question IDs
    this.currentSet = 0;
    this.maxSets = 0;
    this.generalTopicRotationIndex = this.getGeneralTopicRotationIndex();
    this.initializeQuestionBank();
  }

  getGeneralTopicRotationIndex() {
    if (typeof window === 'undefined') return 0;

    const storedIndex = Number(window.localStorage.getItem(QUIZ_TOPIC_ROTATION_STORAGE_KEY));
    return Number.isInteger(storedIndex) && storedIndex >= 0
      ? storedIndex % GENERAL_TOPIC_ROTATION.length
      : 0;
  }

  getNextGeneralTopics() {
    const topics = GENERAL_TOPIC_ROTATION[this.generalTopicRotationIndex];
    this.generalTopicRotationIndex = (this.generalTopicRotationIndex + 1) % GENERAL_TOPIC_ROTATION.length;

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(QUIZ_TOPIC_ROTATION_STORAGE_KEY, this.generalTopicRotationIndex.toString());
    }

    return topics;
  }

  initializeQuestionBank() {
    // Add unique IDs to all questions if not present
    Object.keys(questionBank).forEach(category => {
      questionBank[category].forEach((question, index) => {
        if (!question.id) {
          question.id = `${category}_${index}`;
        }
      });
    });

    // Calculate maximum number of sets possible
    const totalQuestions = Object.values(questionBank).flat().length;
    this.maxSets = Math.floor(totalQuestions / 5);
  }

  // Get unique questions that haven't been used in current rotation
  getUniqueQuestions(questions, count = 5) {
    const availableQuestions = questions.filter(q => !this.usedQuestions.has(q.id));

    if (availableQuestions.length < count) {
      // Not enough unique questions, reset the used questions
      this.resetUsedQuestions();
      return this.getUniqueQuestions(questions, count);
    }

    const shuffled = shuffleArray(availableQuestions);
    const selected = shuffled.slice(0, count);

    // Mark these questions as used
    selected.forEach(q => this.usedQuestions.add(q.id));

    return selected.map(shuffleQuestionOptions);
  }

  resetUsedQuestions() {
    this.usedQuestions.clear();
    this.currentSet = 0;
  }

  // Helper function to get questions by category with rotation
  getQuestionsByCategory(category, count = 5) {
    const questions = questionBank[category] || [];

    if (this.currentSet >= this.maxSets) {
      this.resetUsedQuestions();
    }

    const uniqueQuestions = this.getUniqueQuestions(questions, count);
    this.currentSet++;

    return uniqueQuestions;
  }

  // Helper function to get mixed questions from all categories with rotation
  // getMixedQuestions(count = 5) {
  //   const allQuestions = Object.values(questionBank).flat();

  //   if (this.currentSet >= this.maxSets) {
  //     this.resetUsedQuestions();
  //   }

  //   const uniqueQuestions = this.getUniqueQuestions(allQuestions, count);
  //   this.currentSet++;

  //   return uniqueQuestions;
  // }

  getMixedQuestions(count = 5) {
    const quizCategories = ['history', 'science', 'mathematic', 'kemahiran_hidup'];

    if (this.currentSet >= this.maxSets) {
      this.resetUsedQuestions();
    }

    // Include every subject when at least four questions are requested.
    // Any extra slot rotates randomly between the available subjects.
    const categoryOrder = shuffleArray(quizCategories);
    const selectedQuestions = [];

    for (let index = 0; index < count; index++) {
      const category = categoryOrder[index % categoryOrder.length];
      const availableQuestions = questionBank[category]
        .filter(question => !this.usedQuestions.has(question.id));

      if (availableQuestions.length === 0) {
        this.resetUsedQuestions();
        return this.getMixedQuestions(count);
      }

      const selectedQuestion = shuffleArray(availableQuestions)[0];
      selectedQuestions.push(selectedQuestion);
      this.usedQuestions.add(selectedQuestion.id);
    }

    this.currentSet++;

    return shuffleArray(selectedQuestions).map(shuffleQuestionOptions);
  }

  getQuestionForDifficulty(questionPool, difficulty) {
    let availableQuestions = questionPool
      .filter(question => question.difficulty === difficulty && !this.usedQuestions.has(question.id));

    // Reuse only this category and difficulty after its pool has been completed.
    if (availableQuestions.length === 0) {
      questionPool
        .filter(question => question.difficulty === difficulty)
        .forEach(question => this.usedQuestions.delete(question.id));
      availableQuestions = questionPool.filter(question => question.difficulty === difficulty);
    }

    const selectedQuestion = shuffleArray(availableQuestions)[0];
    this.usedQuestions.add(selectedQuestion.id);
    return selectedQuestion;
  }

  // Every session includes Matematik, Sains and Kemahiran Hidup. The two
  // remaining slots rotate through the five general-knowledge topics.
  getRotatingSessionQuestions() {
    const sessionDifficulties = shuffleArray(['easy', 'easy', 'medium', 'medium', 'hard']);
    const [firstGeneralTopic, secondGeneralTopic] = this.getNextGeneralTopics();
    const sessionPools = [
      questionBank.mathematic,
      questionBank.science,
      questionBank.kemahiran_hidup,
      generalKnowledgeQuestionBank[firstGeneralTopic],
      generalKnowledgeQuestionBank[secondGeneralTopic],
    ];
    const selectedQuestions = sessionPools.map((questionPool, index) =>
      this.getQuestionForDifficulty(questionPool, sessionDifficulties[index])
    );

    this.currentSet++;
    return shuffleArray(selectedQuestions).map(shuffleQuestionOptions);
  }
  // Helper function to get questions by difficulty with rotation
  getQuestionsByDifficulty(difficulty, count = 5) {
    const allQuestions = Object.values(questionBank).flat();
    const filtered = allQuestions.filter(q => q.difficulty === difficulty);

    if (this.currentSet >= this.maxSets) {
      this.resetUsedQuestions();
    }

    const uniqueQuestions = this.getUniqueQuestions(filtered, count);
    this.currentSet++;

    return uniqueQuestions;
  }

  // Specific function to get exactly 5 random questions with rotation
  getRandomQuestions(count = 5) {
    if (count === 5) {
      return this.getRotatingSessionQuestions();
    }

    return this.getMixedQuestions(count);
  }

  // Get current set number and total sets
  getSetInfo() {
    return {
      currentSet: this.currentSet,
      maxSets: this.maxSets,
      questionsRemaining: this.maxSets - this.currentSet
    };
  }

  // Manually reset the rotation
  resetRotation() {
    this.resetUsedQuestions();
  }
}

// Create a singleton instance
const questionManager = new QuestionRotationManager();

// Export the functions with rotation capability
export const getQuestionsByCategory = (category, count = 5) => {
  return questionManager.getQuestionsByCategory(category, count);
};

export const getMixedQuestions = (count = 5) => {
  return questionManager.getMixedQuestions(count);
};

export const getQuestionsByDifficulty = (difficulty, count = 5) => {
  return questionManager.getQuestionsByDifficulty(difficulty, count);
};

export const getRandomQuestions = (count = 5) => {
  return questionManager.getRandomQuestions(count);
};

export const getSetInfo = () => {
  return questionManager.getSetInfo();
};

export const resetQuestionRotation = () => {
  return questionManager.resetRotation();
};

export default questionBank;
