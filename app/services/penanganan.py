"""Informasi penyebab, penanganan, dan pencegahan untuk tiap hasil diagnosis.

Saran bersifat umum dan hati-hati. Untuk dosis dan jenis pestisida, petani sebaiknya
mengikuti petunjuk pada kemasan atau bertanya ke penyuluh pertanian setempat.
"""

PENANGANAN = {
    "hama_ulat": {
        "nama": "Serangan ulat pemakan daun/buah",
        "penyebab": "Ulat (misalnya ulat grayak atau ulat buah) memakan daun, pucuk, atau buah.",
        "penanganan": [
            "Ambil ulat dengan tangan, terutama pagi atau sore hari, lalu musnahkan.",
            "Buang daun atau buah yang sudah terserang berat dan jauhkan dari kebun.",
            "Semprot pestisida nabati (misalnya ekstrak bawang putih atau daun mimba) pada sore hari.",
            "Jika serangan meluas, gunakan insektisida yang sesuai tanaman dan ikuti aturan pada kemasan.",
        ],
        "pencegahan": [
            "Periksa bagian bawah daun secara rutin, terutama saat tanaman masih muda.",
            "Bersihkan gulma di sekitar bedengan karena sering menjadi tempat ulat bersembunyi.",
            "Lakukan rotasi tanaman setiap musim tanam.",
        ],
    },
    "kutu_daun": {
        "nama": "Serangan hama penghisap (kutu daun, kutu kebul, tungau, thrips)",
        "penyebab": "Serangga kecil menghisap cairan daun dan pucuk sehingga daun keriting dan melemah.",
        "penanganan": [
            "Semprot air bertekanan sedang atau larutan sabun cair encer pada bagian bawah daun.",
            "Pangkas bagian tanaman yang sangat padat kutu dan buang jauh dari kebun.",
            "Gunakan pestisida nabati secara berkala, ulangi setiap beberapa hari sesuai kebutuhan.",
            "Pada serangan berat, gunakan insektisida yang sesuai dan ikuti petunjuk kemasan.",
        ],
        "pencegahan": [
            "Kendalikan semut di sekitar tanaman karena semut ikut menyebarkan kutu.",
            "Pasang perangkap kuning untuk kutu kebul dan thrips.",
            "Hindari pemupukan nitrogen berlebihan yang membuat pucuk terlalu lunak.",
        ],
    },
    "layu_bakteri": {
        "nama": "Layu bakteri atau layu fusarium",
        "penyebab": "Bakteri atau jamur di dalam tanah menyumbat pembuluh batang sehingga tanaman layu walau tanah basah.",
        "penanganan": [
            "Cabut dan musnahkan tanaman yang layu beserta tanah di sekitar akarnya, jangan dibuang di kebun.",
            "Hentikan penyiraman berlebih dan perbaiki saluran air agar tidak tergenang.",
            "Bersihkan alat (cangkul, gunting) dengan air panas atau desinfektan setelah dipakai pada tanaman sakit.",
            "Tanah yang sudah terserang sebaiknya diistirahatkan atau ditanami tanaman dari famili berbeda.",
        ],
        "pencegahan": [
            "Gunakan bibit sehat dan rotasi tanaman dengan jenis non-terung-terungan (bukan cabai, tomat, terong).",
            "Buat bedengan yang tinggi dengan drainase baik.",
            "Beri bahan organik atau kompos matang untuk memperbaiki tanah.",
        ],
    },
    "bercak_daun": {
        "nama": "Bercak daun (jamur atau bakteri)",
        "penyebab": "Jamur atau bakteri berkembang pada daun yang lembap, terutama saat musim hujan dan tanaman terlalu rapat.",
        "penanganan": [
            "Petik dan musnahkan daun yang bercak parah, jangan dikomposkan.",
            "Kurangi kelembapan: atur jarak tanam dan siram pada pagi hari, jangan membasahi daun.",
            "Gunakan fungisida yang sesuai dan ikuti aturan pada kemasan jika bercak terus meluas.",
        ],
        "pencegahan": [
            "Jaga jarak tanam agar sirkulasi udara baik.",
            "Bersihkan sisa tanaman dari musim sebelumnya.",
            "Lakukan rotasi tanaman dan gunakan bibit yang sehat.",
        ],
    },
    "embun_tepung": {
        "nama": "Embun tepung (powdery mildew)",
        "penyebab": "Jamur membentuk lapisan putih seperti tepung di permukaan daun, sering pada cuaca lembap dan malam dingin.",
        "penanganan": [
            "Pangkas daun yang tertutup lapisan putih dan buang jauh dari kebun.",
            "Semprot larutan bikarbonat encer atau fungisida yang sesuai tanaman, ikuti aturan kemasan.",
            "Kurangi kelembapan di sekitar tanaman dengan mengatur jarak dan penyiraman.",
        ],
        "pencegahan": [
            "Beri jarak tanam yang cukup dan pastikan tanaman mendapat sinar matahari.",
            "Hindari pemupukan nitrogen berlebihan.",
            "Periksa daun secara rutin pada masa pancaroba.",
        ],
    },
    "busuk_akar": {
        "nama": "Busuk akar atau pangkal batang (tanah terlalu basah)",
        "penyebab": "Tanah tergenang atau terlalu sering disiram sehingga akar kekurangan udara dan diserang jamur tanah.",
        "penanganan": [
            "Perbaiki drainase: buat parit di sela bedengan agar air tidak menggenang.",
            "Kurangi frekuensi penyiraman dan biarkan permukaan tanah mengering di antara penyiraman.",
            "Cabut tanaman yang akarnya sudah hitam dan lembek, lalu buang jauh dari kebun.",
            "Beri kompos atau bahan organik dan tambahkan pasir jika tanah terlalu liat.",
        ],
        "pencegahan": [
            "Buat bedengan lebih tinggi pada musim hujan.",
            "Jangan menanam di lahan yang sering tergenang.",
            "Gunakan media tanam yang gembur.",
        ],
    },
    "kekurangan_nutrisi": {
        "nama": "Kekurangan unsur hara",
        "penyebab": "Tanah miskin unsur hara atau pemupukan kurang seimbang sehingga daun menguning dan tumbuh lambat.",
        "penanganan": [
            "Beri pupuk dasar organik (kompos atau pupuk kandang matang) di sekitar tanaman.",
            "Tambahkan pupuk majemuk sesuai anjuran kemasan; jangan berlebihan karena bisa membakar akar.",
            "Daun menguning dari bagian bawah biasanya menandakan kurang nitrogen; ujung daun cokelat bisa kurang kalium.",
            "Jika ragu, periksakan tanah ke penyuluh atau dinas pertanian setempat.",
        ],
        "pencegahan": [
            "Pupuk secara berkala sesuai umur tanaman.",
            "Perbaiki tanah dengan bahan organik setiap musim tanam.",
            "Catat jadwal pemupukan agar tidak terlewat.",
        ],
    },
    "virus_keriting": {
        "nama": "Penyakit virus (keriting, kuning, atau mosaik)",
        "penyebab": "Virus yang umumnya dibawa serangga seperti kutu kebul atau kutu daun; tanaman tidak bisa disembuhkan.",
        "penanganan": [
            "Cabut dan musnahkan tanaman yang bergejala agar tidak menular, jangan dikomposkan.",
            "Kendalikan serangga pembawa (kutu kebul, kutu daun, thrips) di sekitar bedengan.",
            "Cuci tangan dan alat setelah menyentuh tanaman sakit.",
        ],
        "pencegahan": [
            "Gunakan bibit sehat dan, bila memungkinkan, varietas yang lebih tahan.",
            "Pasang perangkap kuning dan bersihkan gulma inang.",
            "Pisahkan persemaian dari lahan tanam.",
        ],
    },
    "busuk_buah": {
        "nama": "Busuk buah atau antraknosa",
        "penyebab": "Jamur menyerang buah, terutama saat lembap atau buah menyentuh tanah dan terkena percikan air.",
        "penanganan": [
            "Petik dan musnahkan buah yang sudah busuk atau bercak, jangan dibiarkan di kebun.",
            "Panen buah yang sudah matang tepat waktu dan jangan menumpuk dalam keadaan basah.",
            "Gunakan fungisida yang sesuai jika serangan meluas dan ikuti aturan kemasan.",
        ],
        "pencegahan": [
            "Gunakan mulsa agar buah tidak langsung menyentuh tanah.",
            "Atur jarak tanam dan penyiraman agar tidak lembap berlebihan.",
            "Lakukan rotasi tanaman dan bersihkan sisa buah musim sebelumnya.",
        ],
    },
    "cekaman_kekeringan": {
        "nama": "Cekaman kekeringan atau panas berlebih",
        "penyebab": "Tanaman kekurangan air atau terlalu panas, sering terjadi pada musim kemarau, terutama di tanah berpasir.",
        "penanganan": [
            "Siram pada pagi atau sore hari hingga tanah lembap di sekitar akar.",
            "Pasang mulsa jerami atau plastik untuk menahan penguapan.",
            "Beri naungan sementara (paranet) saat cuaca sangat terik.",
            "Tambahkan bahan organik agar tanah lebih lama menahan air.",
        ],
        "pencegahan": [
            "Pantau perkiraan cuaca dan siapkan sumber air sebelum kemarau.",
            "Atur waktu tanam agar tidak bertepatan dengan puncak kemarau.",
            "Pilih jenis sayur yang lebih tahan kering pada musim kemarau.",
        ],
    },
    "sehat": {
        "nama": "Tanaman tampak sehat",
        "penyebab": "Tidak ditemukan tanda kerusakan yang jelas pada foto.",
        "penanganan": ["Lanjutkan perawatan seperti biasa dan tetap pantau tanaman secara rutin."],
        "pencegahan": [
            "Siram dan pupuk sesuai kebutuhan tanaman.",
            "Periksa daun bagian bawah secara berkala untuk mendeteksi hama sejak dini.",
        ],
    },
}

UMUM = {
    "penyebab": "Penyebab pastinya belum bisa dipastikan dari hasil ini.",
    "penanganan": [
        "Pisahkan atau tandai tanaman yang bergejala dan pantau perkembangannya beberapa hari.",
        "Tanyakan ke penyuluh pertanian atau petani berpengalaman di sekitar Anda sebelum memakai pestisida.",
    ],
    "pencegahan": [
        "Jaga kebersihan kebun dan sisa tanaman.",
        "Atur drainase dan jarak tanam agar tidak terlalu lembap.",
    ],
}

# Kata kunci untuk memetakan nama kelas dari dataset foto (mis. PlantVillage) ke kelas di atas
_KATA_KUNCI = [
    (("healthy", "sehat"), "sehat"),
    (("powdery", "mildew", "embun"), "embun_tepung"),
    (("virus", "mosaic", "curl", "mosaik", "keriting"), "virus_keriting"),
    (("wilt", "layu"), "layu_bakteri"),
    (("mite", "aphid", "thrips", "kutu", "whitefly"), "kutu_daun"),
    (("worm", "caterpillar", "ulat", "borer"), "hama_ulat"),
    (("rot", "busuk", "anthracnose", "antraknosa"), "busuk_buah"),
    (("blight", "spot", "bercak", "mold", "rust", "scab"), "bercak_daun"),
]


def kunci_dari_label(label: str) -> str | None:
    """Cari kelas penanganan yang cocok dengan nama kelas (dari model foto atau teks)."""
    teks = label.strip().lower()
    if teks in PENANGANAN:
        return teks
    for kata, kunci in _KATA_KUNCI:
        if any(k in teks for k in kata):
            return kunci
    return None


def info_dari_label(label: str) -> dict:
    """Mengembalikan nama tampilan, penyebab, penanganan, pencegahan untuk sebuah label."""
    kunci = kunci_dari_label(label)
    if kunci:
        info = PENANGANAN[kunci]
        # Nama dari dataset foto sering lebih spesifik (mis. Tomato Late blight); pakai itu bila ada
        nama = info["nama"] if kunci == label.strip().lower() else _rapikan(label) + f" ({info['nama']})"
        return {"nama": nama, **{k: info[k] for k in ("penyebab", "penanganan", "pencegahan")}}
    return {"nama": _rapikan(label), **UMUM}


def _rapikan(label: str) -> str:
    teks = label.replace("___", " - ").replace("_", " ")
    return " ".join(teks.split())
