# 🎨 Logo & Image Size Guide

## 📏 **Logo (Header/Navbar) - Text Panjang**

Karena logo ada **text panjang**, gunakan size landscape (horizontal):

### **Recommended Sizes:**

**For AI Generation:**
```
Resolution: 1200 x 300 px (4:1 ratio)
DPI: 300 (for high quality)
Format: PNG with transparent background
```

**Export untuk Web:**
```
Regular (1x):  400 x 100 px  → Save as: logo.png
Retina (2x):   800 x 200 px  → Save as: logo@2x.png
```

### **Maximum Width Support:**
- Mobile: 200px
- Tablet: 280px  
- Desktop: 320px

**Height:** Fixed 40-48px (auto-scale dari width)

---

## 💰 **Wallet Icon (Withdrawal Page)**

### **Recommended Sizes:**

**For AI Generation:**
```
Resolution: 800 x 800 px (1:1 ratio - square)
DPI: 300
Format: PNG with transparent background
Style: Flat design atau 3D illustration
```

**Export untuk Web:**
```
Regular (1x):  280 x 280 px  → Save as: wallet-icon.png
Retina (2x):   560 x 560 px  → Save as: wallet-icon@2x.png
```

---

## 📁 **File Structure**

Taruh semua files di folder `public/`:

```
public/
├── logo.png              (400x100px - logo utama)
├── logo@2x.png           (800x200px - retina display)
├── wallet-icon.png       (280x280px - withdrawal icon)
└── wallet-icon@2x.png    (560x560px - retina)
```

---

## 🎨 **AI Generation Prompts**

### **Logo Prompt:**
```
Create a modern fintech trading logo with text "[YOUR COMPANY NAME]"
- Style: Professional, clean, gradient colors (cyan/teal/green)
- Layout: Horizontal layout with icon on left, text on right
- Colors: Dark blue, cyan, teal, emerald gradient
- Format: Transparent background PNG
- Aspect ratio: 4:1 (wide horizontal)
- Resolution: 1200x300px
- Font: Bold, modern, tech-style
```

### **Wallet Icon Prompt:**
```
Create a 3D wallet illustration with money bills
- Style: Modern, clean 3D illustration
- Colors: Brown/orange wallet with green dollar bills
- Elements: Wallet with money sticking out, sparkles/stars
- Format: Transparent background PNG
- Aspect ratio: 1:1 (square)
- Resolution: 800x800px
- Mood: Friendly, trustworthy, professional
```

---

## 🖼️ **How to Replace**

### **Step 1: Generate & Export**

1. Generate logo di AI tool (Midjourney, DALL-E, etc)
2. Export 2 sizes:
   - `logo.png` (400x100px)
   - `logo@2x.png` (800x200px)
3. Generate wallet icon
4. Export 2 sizes:
   - `wallet-icon.png` (280x280px)  
   - `wallet-icon@2x.png` (560x560px)

### **Step 2: Optimize**

Compress images untuk web:
- Tool: TinyPNG.com atau Squoosh.app
- Target: < 50KB untuk logo, < 100KB untuk wallet icon

### **Step 3: Upload**

1. Copy files ke folder `public/`:
   ```bash
   cp logo.png public/
   cp logo@2x.png public/
   cp wallet-icon.png public/
   cp wallet-icon@2x.png public/
   ```

2. Commit dan push:
   ```bash
   git add public/
   git commit -m "Update logo and wallet icon"
   git push
   ```

### **Step 4: Verify**

1. Build dan deploy
2. Check di browser:
   - Logo di header harus muncul
   - Wallet icon di /withdrawal page
3. Test di mobile dan desktop
4. Check retina display (MacBook, high-DPI screens)

---

## ✅ **Current Code Support**

**Header Logo:**
- ✅ Auto-detect custom logo (`/logo.png`)
- ✅ Fallback to icon+text jika image tidak ada
- ✅ Responsive width (200px mobile → 320px desktop)
- ✅ Fixed height (40-48px)
- ✅ Retina support dengan `srcset`

**Withdrawal Page:**
- 🔨 Need to update code untuk custom wallet icon
- Currently: SVG custom illustration

---

## 🎯 **Example Sizes**

### Logo dengan Text Panjang:

**Short Text** (< 20 chars):
```
"TRADING TUTORIALS"
→ 400 x 100 px (4:1 ratio)
```

**Medium Text** (20-40 chars):
```
"TRADING TUTORIALS PLATFORM"
→ 500 x 100 px (5:1 ratio)
```

**Long Text** (40-60 chars):
```
"ADVANCED TRADING TUTORIALS & INVESTMENT PLATFORM"
→ 600 x 100 px (6:1 ratio)
```

---

## 🚨 **Common Issues**

### Issue: Logo terlalu blur
**Fix**: Export dengan 2x resolution (retina)

### Issue: Logo terlalu besar (slow loading)
**Fix**: Compress dengan TinyPNG, target < 50KB

### Issue: Logo terpotong di mobile
**Fix**: Gunakan max-width responsive, bukan fixed width

### Issue: Background tidak transparent
**Fix**: Re-export sebagai PNG dengan transparency enabled

---

## 📱 **Responsive Behavior**

**Mobile (< 640px):**
- Logo width: max 200px
- Height: 40px
- Hide long text jika perlu

**Tablet (640-1024px):**
- Logo width: max 280px
- Height: 44px

**Desktop (> 1024px):**
- Logo width: max 320px
- Height: 48px

---

## 💡 **Tips:**

1. **Keep it simple**: Logo dengan text panjang, hindari detail kecil
2. **High contrast**: Pastikan text readable di background dark
3. **Test everywhere**: Mobile, tablet, desktop, retina
4. **Optimize**: Compress tanpa kehilangan quality
5. **Fallback**: Selalu punya fallback kalau image gagal load

---

## 📞 **Need Help?**

Check file lokasi:
- Logo code: `src/components/Header.tsx`
- Wallet code: `src/pages/Withdrawal.tsx`
- Public files: `public/logo.png`, `public/wallet-icon.png`

---

**Ready to upload your custom logo!** 🎨
