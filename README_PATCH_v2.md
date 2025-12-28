# Goldenshades 4.0 — Patch v2 (Performance + OG + UX)

هذا الباتش يبني على Patch v1 ويضيف تحسينات قوية للسرعة وتجربة المستخدم ومشاركة واتساب.

## ماذا يشمل v2؟
1) **Bundle/Minify**
- `assets/css/site.min.css`
- `assets/js/app.bundle.min.js` (يجمع: include + estimator + gallery-filter + config-preview + trend32 + site)

2) **Open Graph موحّد لكل صفحة**
- تنظيف التكرار داخل `<head>`
- OG/Twitter + canonical + og:url
- صور OG لكل صفحة: `images/og-*.webp` بحجم 1200×630

3) **Thermal Proof جاهز**
- صور placeholders:
  - `images/thermal-block.webp`
  - `images/thermal-panel.webp`

4) **CLS أقل**
- إضافة `width/height` للصور المحلية (`images/*.webp`) داخل صفحات الموقع

## طريقة التركيب على GitHub Repo
- فك الضغط
- ادخل مجلد `abdah/`
- انسخ كل المحتويات واستبدل ملفات موقعك الحالية

> ملاحظة: إذا كنت تستخدم مجلد `abdah` داخل الريبو كنقطة نشر، استبدل المجلد بالكامل.

