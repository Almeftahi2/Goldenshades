# Goldenshades 4.0 – Patch v1 (DRY + OG + Schema + Estimator + Gallery Filter)

## ماذا تم تنفيذه في هذا الباتش؟
1) DRY: فصل الـ Header والـ Footer في:
- abdah/partials/header.html
- abdah/partials/footer.html
مع حقن تلقائي عبر:
- abdah/assets/js/include.js

2) Next‑Gen Images:
- حذف ملفات PNG غير المستخدمة من abdah/images (تم الإبقاء على WebP فقط)
- إضافة صور OG مخصصة لكل صفحة (1200×630) داخل images باسم:
  og-index.webp / og-sandwich-panel.webp / ... إلخ

3) Open Graph لكل صفحة:
- Meta OG + Twitter Card مع صورة خاصة لكل صفحة (بروابط مطلقة)

4) Schema Markup (JSON‑LD):
- تعريف GeneralContractor / مؤسسة إبداع الظل
> ملاحظة: ساعات العمل داخل الـ JSON-LD افتراضية (Mo‑Su 08:00‑21:00) عدّلها إذا لزم.

5) Mobile First تحسينات:
- تحسين سلايدر قبل/بعد ليعمل باللمس (Pointer/Touch) داخل assets/js/site.js

6) Cost Estimator:
- حاسبة مبدئية (Modal) + زر فتح من الهيدر (🧮 احسب التكلفة)
- ملفاتها:
  - abdah/assets/js/estimator.js
> تعديل الأسعار من أعلى ملف estimator.js في كائن PRICES

7) Gallery Filter:
- فلترة في projects.html بدون إعادة تحميل
- ملفاتها:
  - abdah/assets/js/gallery-filter.js

8) Configurator Preview:
- معاينة بصرية تتغير مباشرة (SVG سريع) داخل:
  - abdah/assets/js/config-preview.js

## طريقة التطبيق على GitHub Repo
1) افتح الريبو: https://github.com/Almeftahi2/Goldenshades
2) ارفع محتويات مجلد abdah من هذا الـ ZIP مكان الملفات الحالية (استبدال)
3) Commit ثم انتظر GitHub Pages يحدث الموقع.

## ملاحظات مهمة
- حقن الـ Header/Footer يعتمد على fetch، لذلك يعمل على GitHub Pages، لكن قد لا يعمل إذا فتحت الملفات مباشرة من الجهاز (file://).
- لو تحتاج تشغيل محلي: استخدم أي سيرفر بسيط مثل VS Code Live Server.
