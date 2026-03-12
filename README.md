# AI PPT Generator — Netlify Deploy

Aplikasi web untuk membuat presentasi PowerPoint otomatis menggunakan AI (OpenRouter).
API key tersembunyi di backend Netlify Functions — user tidak bisa melihatnya.

## Struktur Project

```
ai-ppt-generator/
├── index.html                    ← Frontend utama
├── netlify.toml                  ← Konfigurasi Netlify
└── netlify/
    └── functions/
        └── generate.mjs          ← Backend proxy ke OpenRouter
```

---

## Cara Deploy ke Netlify

### Langkah 1 — Siapkan API Key
1. Daftar di [openrouter.ai](https://openrouter.ai)
2. Buka **Keys** → buat API key baru
3. Simpan key-nya (format: `sk-or-v1-...`)

### Langkah 2 — Upload ke Netlify

**Cara A: Drag & Drop (paling mudah)**
1. Buka [app.netlify.com](https://app.netlify.com)
2. Login / daftar gratis
3. Drag folder `ai-ppt-generator/` ke halaman Netlify
4. Tunggu deploy selesai

**Cara B: Via GitHub**
1. Upload folder ke GitHub repository
2. Di Netlify → "Add new site" → "Import from Git"
3. Pilih repo kamu → deploy

### Langkah 3 — Set Environment Variable (WAJIB)
1. Di Netlify dashboard → pilih site kamu
2. **Site configuration** → **Environment variables**
3. Klik **Add a variable**:
   - Key: `OPENROUTER_API_KEY`
   - Value: `sk-or-v1-xxxxxxxxxxxxxx` (API key kamu)
4. Klik **Save**
5. **Redeploy** site-nya agar env var aktif:
   Deploys → klik "Trigger deploy" → "Deploy site"

---

## Cara Kerja

```
Browser (user)
     │
     │  POST /api/generate
     ▼
Netlify Function (generate.mjs)
     │
     │  API Key dari environment variable (tersembunyi)
     │  POST https://openrouter.ai/api/v1/chat/completions
     ▼
OpenRouter API → Model AI
     │
     ▼
Netlify Function → Browser
     │
     ▼
PptxGenJS generate .pptx di browser
```

User **tidak pernah melihat** API key karena semua request ke OpenRouter
dilakukan dari server Netlify, bukan dari browser.

---

## Troubleshooting

| Error | Solusi |
|-------|--------|
| "API key not configured" | Pastikan env var `OPENROUTER_API_KEY` sudah diset dan sudah redeploy |
| "HTTP 401" | API key salah atau expired, cek di openrouter.ai/keys |
| "HTTP 429" | Rate limit tercapai, tunggu sebentar atau upgrade plan |
| AI tidak merespons | Coba ganti model di dropdown |
| Function tidak ditemukan | Pastikan file `netlify.toml` ada dan struktur folder benar |
