# Deposit Page Guide

## Overview
Halaman Deposit untuk user yang memungkinkan mereka melihat alamat wallet untuk deposit USDT/BTC.

## Features

### 1. **Currency Selection**
- Pilihan antara USDT atau BTC
- Button USDT (aktif) dengan warna cyan
- Button BTC (inactive) dengan warna gray

### 2. **Wallet Address Display**
- Input field read-only menampilkan alamat wallet deposit
- Button "Copy" untuk copy alamat wallet ke clipboard
- Konfirmasi visual "Copied" dengan icon checkmark hijau

### 3. **Network Address Display**
- Input field read-only menampilkan network (TRC20, BEP20, ERC20, dll)
- Button "Copy" untuk copy network ke clipboard
- Button "Network" di sebelah kanan untuk informasi tambahan

### 4. **Design & Styling**
- Tema konsisten dengan halaman Withdrawal:
  - Background: Black dengan gradient blur
  - Border: Cyan dengan glow effect
  - Card: Glass morphism dengan backdrop blur
  - Buttons: Gradient cyan-to-teal untuk primary action
- Header dengan icon Wallet
- Footer component di bagian bawah

### 5. **Important Notes Section**
- Informasi penting untuk user:
  - Pastikan alamat wallet dan network benar
  - Double-check network sebelum transfer
  - Hubungi admin jika deposit tidak masuk dalam 30 menit
  - Minimum deposit amount (check dengan admin)

## Navigation
- Menu "Deposit" di Header (antara Trading Access dan Withdrawal)
- Icon: ArrowUpToLine (untuk deposit/upload)
- Back button ke Dashboard

## Configuration

### Admin Configuration
Admin dapat mengubah alamat wallet dan network di file `Deposit.tsx`:

```typescript
// Line 10-11 di Deposit.tsx
const depositWallet = 'TXyGJKp8mN9fRqH5vLwZbE3xC2dY7sA4uP'
const networkAddress = 'TRC20'
```

**Future Enhancement:** Buat admin panel untuk mengelola wallet address dan network secara dinamis dari database.

## Files Modified/Created

### Created:
- `src/pages/Deposit.tsx` - Halaman deposit utama

### Modified:
- `src/App.tsx` - Menambahkan route `/deposit`
- `src/components/Header.tsx` - Menambahkan menu "Deposit" di navigation

## User Flow

1. User membuka halaman Dashboard
2. Klik menu "Deposit" di Header
3. Pilih currency (USDT/BTC)
4. Copy wallet address dengan klik button "Copy"
5. Copy network address dengan klik button "Copy"
6. Transfer crypto ke wallet address tersebut dengan network yang benar
7. Hubungi admin jika ada masalah

## Notes

- Wallet address dan network saat ini hardcoded di component
- Untuk production, disarankan menyimpan di database dan admin dapat mengubahnya
- Copy to clipboard menggunakan Navigator Clipboard API
- Visual feedback saat copy berhasil (icon berubah ke checkmark hijau selama 2 detik)

## Color Scheme
- Primary: Cyan (#06B6D4)
- Secondary: Teal (#14B8A6)
- Success: Emerald (#10B981)
- Warning: Yellow (#F59E0B)
- Background: Black (#000000)
- Card Background: Gray-900 with opacity
