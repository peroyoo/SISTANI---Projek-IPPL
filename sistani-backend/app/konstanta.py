"""Daftar sayur dan jenis tanah yang boleh dipilih petani.

Angka "hst" (hari setelah tanam sampai panen pertama), "suhu_opt" dan "air_opt"
adalah perkiraan umum agronomi, dipakai untuk membuat data latih awal model
prediksi panen. Ganti dengan data kebun asli jika sudah terkumpul.
"""

SAYUR = {
    "kangkung":      {"nama": "Kangkung",      "hst": 28,  "suhu_opt": 28, "air_opt": 7.0},
    "bayam":         {"nama": "Bayam",         "hst": 30,  "suhu_opt": 28, "air_opt": 6.0},
    "sawi":          {"nama": "Sawi",          "hst": 35,  "suhu_opt": 26, "air_opt": 6.0},
    "kol":           {"nama": "Kol",           "hst": 85,  "suhu_opt": 24, "air_opt": 5.0},
    "wortel":        {"nama": "Wortel",        "hst": 100, "suhu_opt": 22, "air_opt": 5.0},
    "tomat":         {"nama": "Tomat",         "hst": 85,  "suhu_opt": 25, "air_opt": 6.0},
    "cabai_rawit":   {"nama": "Cabai rawit",   "hst": 110, "suhu_opt": 27, "air_opt": 5.0},
    "cabai_merah":   {"nama": "Cabai merah",   "hst": 105, "suhu_opt": 26, "air_opt": 5.0},
    "terong":        {"nama": "Terong",        "hst": 80,  "suhu_opt": 27, "air_opt": 6.0},
    "timun":         {"nama": "Timun",         "hst": 50,  "suhu_opt": 27, "air_opt": 6.5},
    "kacang_panjang": {"nama": "Kacang panjang", "hst": 55, "suhu_opt": 28, "air_opt": 5.5},
    "buncis":        {"nama": "Buncis",        "hst": 55,  "suhu_opt": 24, "air_opt": 5.5},
}

TANAH = {
    "liat":     "Tanah liat",
    "lempung":  "Tanah lempung",
    "berpasir": "Tanah berpasir",
    "gambut":   "Tanah gambut",
    "podsolik": "Tanah podsolik (merah-kuning)",
}

# Dipakai jika layanan cuaca tidak bisa dihubungi (perkiraan iklim tropis pesisir Kaltim).
CUACA_DEFAULT = {"suhu_rata": 27.5, "curah_hujan_rata": 8.0, "kelembapan_rata": 82.0}
