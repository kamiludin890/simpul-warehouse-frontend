# Warehouse frontend

Frontend aplikasi manajemen Warehouse menggunakan Next.js.

## Menjalankan aplikasi

Jalankan Rails API pada port `3001`:

```bash
cd ../warehouse-api
bin/rails server -p 3001
```

Di terminal lain, jalankan frontend:

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000). Next.js meneruskan request `/api/*` ke Rails melalui rewrite server-side, sehingga browser tidak memerlukan konfigurasi CORS.

Jika API berjalan di host atau port lain, atur `WAREHOUSE_API_URL` sebelum menjalankan Next.js. Contoh: `WAREHOUSE_API_URL=http://localhost:4000 npm run dev`.
