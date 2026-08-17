# Font Setup Guide

## Fonts yang digunakan:

### 1. **Archivo Black** - Running Text
- Lokasi: Running text "Trade Smarter. Move Faster."
- Class: `font-archivo-black`
- Style: Bold, Italic

### 2. **Inter** - UI Elements
- Lokasi: Navbar, Button, Body text, Label kecil
- Class: `font-inter` atau default (sudah di body)
- Weight: 400, 500, 600, 700

### 3. **Manrope** - Headings & Names
- Lokasi: Headings (h1-h6), Nama user
- Class: `font-manrope` atau `.text-username`
- Weight: 400, 500, 600, 700, 800

### 4. **JetBrains Mono** - Numbers
- Lokasi: Balance, Harga trading, P/L & angka
- Class: `font-jetbrains`, `.text-balance`, `.text-price`
- Weight: 400, 500, 600, 700

## Cara Pakai:

```tsx
// Running text
<h2 className="font-archivo-black italic">Trade Smarter</h2>

// Nama user
<p className="font-manrope">John Doe</p>
// atau
<p className="text-username">John Doe</p>

// Balance / Harga
<p className="font-jetbrains">1,234.56</p>
// atau
<p className="text-balance">USDT 1800</p>
<p className="text-price">$64,248.00</p>

// Label / Body text (default Inter)
<p className="font-inter">Description here</p>
// atau langsung pakai tanpa class (sudah default)
<p>Description here</p>
```

## Fonts sudah di-import di:
- `index.html` - Google Fonts link
- `tailwind.config.js` - Font family definitions
- `index.css` - Default font settings
