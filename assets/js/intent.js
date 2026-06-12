// intent.js
// اسم الملف: assets/js/intent.js
// آخر تعديل: 2026-06-02
// الغرض: تحديد نية الخدمة الحالية، تخصيص روابط واتساب عبر data-wa فقط، وعرض Spotlight مخصص لكل خدمة.

(function () {
  'use strict';

  if (window.__IBDAA_INTENT_READY__) return;
  window.__IBDAA_INTENT_READY__ = true;

  // ==========================================================================
  // الإعدادات الأساسية
  // ==========================================================================

  const WHATSAPP_NUMBER = '966562526395';
  const STORAGE_KEY = 'ibdaa_intent';
  const STORAGE_TTL_MS = 1000 * 60 * 60 * 24 * 30;

  const SELECTORS = {
    whatsappLink: 'a[data-wa]',
    intentBar: '[data-intentbar]',
    intentButton: 'button.intent-pill[data-intent]',
    intentClear: '[data-intent-clear]',
    intentCta: '[data-intent-cta]',
    spotlight: '[data-intent-spotlight]',
    spotlightTitle: '[data-intent-title]',
    spotlightLead: '[data-intent-lead]',
    spotlightGallery: '[data-intent-gallery]',
    lightboxTrigger: '[data-open-lightbox]'
  };

  const INTENTS = {
    mazallat: {
      key: 'mazallat',
      label: 'مظلات مودرن',
      messageLabel: 'مظلات مودرن',
      cta: 'اطلب تسعيرة مظلات مودرن الآن',
      hint: 'مظلات سيارات ومداخل وأحواش بتصاميم حديثة تناسب الفلل والمباني السكنية.',
      keywords: [
        'mazallat',
        'مظلات',
        'مظلة',
        'مظلات مودرن',
        'مظلات سيارات',
        'مظلات مداخل',
        'مظلات احواش',
        'مظلات أحواش'
      ],
      images: [
        'assets/img/mazallat_modern/arched-modern-car-shade-villa-front-riyadh.webp',
        'assets/img/mazallat_modern/multiple-modern-car-shades-apartment-building-riyadh.webp',
        'assets/img/mazallat_modern/modern-slat-shade-outdoor-seating-riyadh.webp',
        'assets/img/mazallat_modern/modern-stretch-fabric-yard-shade-home-entrance-riyadh.webp',
        'assets/img/mazallat_modern/modern-beige-fabric-villa-entrance-shade-riyadh.webp'
      ]
    },

    laser: {
      key: 'laser',
      label: 'مظلات ليزر',
      messageLabel: 'مظلات ليزر',
      cta: 'اطلب تسعيرة مظلات ليزر الآن',
      hint: 'مظلات قص ليزر بتصاميم زخرفية حديثة للفلل والمداخل والجلسات الخارجية.',
      keywords: [
        'laser',
        'ليزر',
        'قص ليزر',
        'مظلات ليزر',
        'مظلة ليزر',
        'مظلات قص ليزر'
      ],
      images: [
        'assets/img/laser/luxury-wide-laser-cut-shades-riyadh.webp',
        'assets/img/laser/modern-wide-laser-shades-riyadh.webp',
        'assets/img/laser/large-modern-laser-shades-riyadh.webp',
        'assets/img/laser/wide-laser-cut-garden-shade-riyadh.webp',
        'assets/img/laser/luxury-large-laser-shade-villas-riyadh.webp'
      ]
    },

    wood: {
      key: 'wood',
      label: 'بديل خشب',
      messageLabel: 'بديل خشب',
      cta: 'اطلب تسعيرة بديل خشب الآن',
      hint: 'بديل خشب داخلي وخارجي بملمس فاخر ومظهر مودرن مناسب للجدران والمداخل والمجالس.',
      keywords: [
        'wood',
        'خشب',
        'بديل خشب',
        'خشب بديل',
        'ديكور خشب',
        'شرائح خشب',
        'بديل الخشب'
      ],
      images: [
        'assets/img/wood/wpc-wood-alternative-interior-wall-slats-riyadh.webp',
        'assets/img/wood/wpc-wood-alternative-stair-entrance-slats-riyadh.webp',
        'assets/img/wood/wpc-wood-alternative-tv-wall-riyadh.webp',
        'assets/img/wood/wpc-wood-alternative-stair-wall-riyadh.webp',
        'assets/img/wood/wpc-wood-alternative-majlis-wall-riyadh.webp',
        'assets/img/wood/wpc-wood-alternative-lighted-decor-slats-riyadh.webp'
      ]
    },

    sandwich: {
      key: 'sandwich',
      label: 'ساندوتش بانل',
      messageLabel: 'ساندوتش بانل',
      cta: 'اطلب تسعيرة ساندوتش بانل الآن',
      hint: 'حلول ساندوتش بانل للملاحق والغرف والأسطح بعزل حراري وسرعة تنفيذ عالية.',
      keywords: [
        'sandwich',
        'panel',
        'sandwich panel',
        'ساندوتش',
        'بانل',
        'ساندوتش بانل',
        'ملاحق ساندوتش بانل'
      ],
      images: [
        'assets/img/sandwich_panel/sandwich-panel-annex-installation-riyadh.webp',
        'assets/img/sandwich_panel/modern-sandwich-panel-annex-rooms-riyadh.webp',
        'assets/img/sandwich_panel/sandwich-panel-rooftop-annexes-riyadh.webp',
        'assets/img/sandwich_panel/sandwich-panel-outdoor-seating-annexes-riyadh.webp',
        'assets/img/sandwich_panel/sandwich-panel-extra-rooms-thermal-insulation-riyadh.webp',
        'assets/img/sandwich_panel/heat-resistant-sandwich-panel-outdoor-rooms-riyadh.webp'
      ]
    },

    cement: {
      key: 'cement',
      label: 'اسمنت بورد',
      messageLabel: 'اسمنت بورد',
      cta: 'اطلب تسعيرة اسمنت بورد الآن',
      hint: 'تنفيذ اسمنت بورد للواجهات والملاحق والغرف الخارجية بتشطيب حديث ومقاوم.',
      keywords: [
        'cement',
        'cement board',
        'اسمنت',
        'أسمنت',
        'سمنت',
        'اسمنت بورد',
        'أسمنت بورد',
        'سمنت بورد',
        'واجهات اسمنت بورد',
        'ملاحق اسمنت بورد'
      ],
      images: [
        'assets/img/cement_board/cement-board-exterior-cladding-riyadh.webp',
        'assets/img/cement_board/cement-board-outdoor-seating-annexes-riyadh.webp',
        'assets/img/cement_board/cement-board-rooftop-rooms-annexes-riyadh.webp',
        'assets/img/cement_board/cement-board-outdoor-annexes-riyadh.webp',
        'assets/img/cement_board/cement-board-modern-villa-facades-riyadh.webp',
        'assets/img/cement_board/cement-board-extra-rooms-installation-riyadh.webp'
      ]
    },

 majalis: {
  key: 'majalis',
  label: 'المجالس والجلسات',
  messageLabel: 'مجالس وجلسات خارجية',
  cta: 'اطلب تسعيرة مجالس وجلسات خارجية الآن',
  hint: 'جلسات ومجالس خارجية للفلل والحدائق والتراسات بتصاميم مودرن مناسبة للضيوف والعائلة.',
  keywords: [
    'majalis',
    'jalsat',
    'جلسات',
    'جلسات خارجية',
    'مجالس خارجية',
    'مجلس خارجي',
    'تراس',
    'حديقة',
    'جلسات فلل',
    'مجالس حدائق'
  ],
      images: [
        'assets/img/majalis_jalsat/modern-outdoor-terrace-seating-riyadh.webp',
        'assets/img/majalis_jalsat/luxury-outdoor-garden-seating-riyadh.webp',
        'assets/img/majalis_jalsat/modern-outdoor-seating-villa-front-riyadh.webp',
        'assets/img/majalis_jalsat/large-outdoor-seating-villas-riyadh.webp',
        'assets/img/majalis_jalsat/modern-outdoor-seating-villa-entrance-riyadh.webp',
        'assets/img/majalis_jalsat/luxury-outdoor-majlis-with-shades-riyadh.webp'
      ]
    }
  };

  const RESPONSIVE_IMAGES = {"assets/img/cement_board/cement-board-exterior-cladding-riyadh.webp":{"w":1024,"h":1024,"srcset":"assets/img/cement_board/cement-board-exterior-cladding-riyadh-480w.webp 480w, assets/img/cement_board/cement-board-exterior-cladding-riyadh-768w.webp 768w, assets/img/cement_board/cement-board-exterior-cladding-riyadh.webp 1024w"},"assets/img/cement_board/cement-board-outdoor-seating-annexes-riyadh.webp":{"w":900,"h":900,"srcset":"assets/img/cement_board/cement-board-outdoor-seating-annexes-riyadh-480w.webp 480w, assets/img/cement_board/cement-board-outdoor-seating-annexes-riyadh-768w.webp 768w, assets/img/cement_board/cement-board-outdoor-seating-annexes-riyadh.webp 900w"},"assets/img/cement_board/cement-board-rooftop-rooms-annexes-riyadh.webp":{"w":1024,"h":1024,"srcset":"assets/img/cement_board/cement-board-rooftop-rooms-annexes-riyadh-480w.webp 480w, assets/img/cement_board/cement-board-rooftop-rooms-annexes-riyadh-768w.webp 768w, assets/img/cement_board/cement-board-rooftop-rooms-annexes-riyadh.webp 1024w"},"assets/img/cement_board/cement-board-outdoor-annexes-riyadh.webp":{"w":1024,"h":1024,"srcset":"assets/img/cement_board/cement-board-outdoor-annexes-riyadh-480w.webp 480w, assets/img/cement_board/cement-board-outdoor-annexes-riyadh-768w.webp 768w, assets/img/cement_board/cement-board-outdoor-annexes-riyadh.webp 1024w"},"assets/img/cement_board/cement-board-modern-villa-facades-riyadh.webp":{"w":1024,"h":1024,"srcset":"assets/img/cement_board/cement-board-modern-villa-facades-riyadh-480w.webp 480w, assets/img/cement_board/cement-board-modern-villa-facades-riyadh-768w.webp 768w, assets/img/cement_board/cement-board-modern-villa-facades-riyadh.webp 1024w"},"assets/img/cement_board/cement-board-extra-rooms-installation-riyadh.webp":{"w":1024,"h":1024,"srcset":"assets/img/cement_board/cement-board-extra-rooms-installation-riyadh-480w.webp 480w, assets/img/cement_board/cement-board-extra-rooms-installation-riyadh-768w.webp 768w, assets/img/cement_board/cement-board-extra-rooms-installation-riyadh.webp 1024w"},"assets/img/majalis_jalsat/modern-outdoor-terrace-seating-riyadh.webp":{"w":1600,"h":1600,"srcset":"assets/img/majalis_jalsat/modern-outdoor-terrace-seating-riyadh-480w.webp 480w, assets/img/majalis_jalsat/modern-outdoor-terrace-seating-riyadh-768w.webp 768w, assets/img/majalis_jalsat/modern-outdoor-terrace-seating-riyadh-1200w.webp 1200w, assets/img/majalis_jalsat/modern-outdoor-terrace-seating-riyadh.webp 1600w"},"assets/img/majalis_jalsat/luxury-outdoor-garden-seating-riyadh.webp":{"w":900,"h":900,"srcset":"assets/img/majalis_jalsat/luxury-outdoor-garden-seating-riyadh-480w.webp 480w, assets/img/majalis_jalsat/luxury-outdoor-garden-seating-riyadh-768w.webp 768w, assets/img/majalis_jalsat/luxury-outdoor-garden-seating-riyadh.webp 900w"},"assets/img/majalis_jalsat/modern-outdoor-seating-villa-front-riyadh.webp":{"w":1200,"h":1200,"srcset":"assets/img/majalis_jalsat/modern-outdoor-seating-villa-front-riyadh-480w.webp 480w, assets/img/majalis_jalsat/modern-outdoor-seating-villa-front-riyadh-768w.webp 768w, assets/img/majalis_jalsat/modern-outdoor-seating-villa-front-riyadh.webp 1200w"},"assets/img/majalis_jalsat/large-outdoor-seating-villas-riyadh.webp":{"w":2048,"h":2048,"srcset":"assets/img/majalis_jalsat/large-outdoor-seating-villas-riyadh-480w.webp 480w, assets/img/majalis_jalsat/large-outdoor-seating-villas-riyadh-768w.webp 768w, assets/img/majalis_jalsat/large-outdoor-seating-villas-riyadh-1200w.webp 1200w, assets/img/majalis_jalsat/large-outdoor-seating-villas-riyadh.webp 2048w"},"assets/img/majalis_jalsat/modern-outdoor-seating-villa-entrance-riyadh.webp":{"w":900,"h":900,"srcset":"assets/img/majalis_jalsat/modern-outdoor-seating-villa-entrance-riyadh-480w.webp 480w, assets/img/majalis_jalsat/modern-outdoor-seating-villa-entrance-riyadh-768w.webp 768w, assets/img/majalis_jalsat/modern-outdoor-seating-villa-entrance-riyadh.webp 900w"},"assets/img/majalis_jalsat/luxury-outdoor-majlis-with-shades-riyadh.webp":{"w":1000,"h":1000,"srcset":"assets/img/majalis_jalsat/luxury-outdoor-majlis-with-shades-riyadh-480w.webp 480w, assets/img/majalis_jalsat/luxury-outdoor-majlis-with-shades-riyadh-768w.webp 768w, assets/img/majalis_jalsat/luxury-outdoor-majlis-with-shades-riyadh.webp 1000w"},"assets/img/laser/luxury-wide-laser-cut-shades-riyadh.webp":{"w":1200,"h":900,"srcset":"assets/img/laser/luxury-wide-laser-cut-shades-riyadh-480w.webp 480w, assets/img/laser/luxury-wide-laser-cut-shades-riyadh-768w.webp 768w, assets/img/laser/luxury-wide-laser-cut-shades-riyadh.webp 1200w"},"assets/img/laser/modern-wide-laser-shades-riyadh.webp":{"w":1200,"h":900,"srcset":"assets/img/laser/modern-wide-laser-shades-riyadh-480w.webp 480w, assets/img/laser/modern-wide-laser-shades-riyadh-768w.webp 768w, assets/img/laser/modern-wide-laser-shades-riyadh.webp 1200w"},"assets/img/laser/large-modern-laser-shades-riyadh.webp":{"w":1200,"h":900,"srcset":"assets/img/laser/large-modern-laser-shades-riyadh-480w.webp 480w, assets/img/laser/large-modern-laser-shades-riyadh-768w.webp 768w, assets/img/laser/large-modern-laser-shades-riyadh.webp 1200w"},"assets/img/laser/wide-laser-cut-garden-shade-riyadh.webp":{"w":1200,"h":900,"srcset":"assets/img/laser/wide-laser-cut-garden-shade-riyadh-480w.webp 480w, assets/img/laser/wide-laser-cut-garden-shade-riyadh-768w.webp 768w, assets/img/laser/wide-laser-cut-garden-shade-riyadh.webp 1200w"},"assets/img/laser/luxury-large-laser-shade-villas-riyadh.webp":{"w":1200,"h":900,"srcset":"assets/img/laser/luxury-large-laser-shade-villas-riyadh-480w.webp 480w, assets/img/laser/luxury-large-laser-shade-villas-riyadh-768w.webp 768w, assets/img/laser/luxury-large-laser-shade-villas-riyadh.webp 1200w"},"assets/img/mazallat_modern/multiple-modern-car-shades-apartment-building-riyadh.webp":{"w":549,"h":549,"srcset":"assets/img/mazallat_modern/multiple-modern-car-shades-apartment-building-riyadh-480w.webp 480w, assets/img/mazallat_modern/multiple-modern-car-shades-apartment-building-riyadh.webp 549w"},"assets/img/mazallat_modern/arched-modern-car-shade-villa-front-riyadh.webp":{"w":736,"h":735,"srcset":"assets/img/mazallat_modern/arched-modern-car-shade-villa-front-riyadh-480w.webp 480w, assets/img/mazallat_modern/arched-modern-car-shade-villa-front-riyadh.webp 736w"},"assets/img/mazallat_modern/modern-slat-shade-outdoor-seating-riyadh.webp":{"w":736,"h":703,"srcset":"assets/img/mazallat_modern/modern-slat-shade-outdoor-seating-riyadh-480w.webp 480w, assets/img/mazallat_modern/modern-slat-shade-outdoor-seating-riyadh.webp 736w"},"assets/img/mazallat_modern/modern-stretch-fabric-yard-shade-home-entrance-riyadh.webp":{"w":694,"h":674,"srcset":"assets/img/mazallat_modern/modern-stretch-fabric-yard-shade-home-entrance-riyadh-480w.webp 480w, assets/img/mazallat_modern/modern-stretch-fabric-yard-shade-home-entrance-riyadh.webp 694w"},"assets/img/mazallat_modern/modern-beige-fabric-villa-entrance-shade-riyadh.webp":{"w":736,"h":736,"srcset":"assets/img/mazallat_modern/modern-beige-fabric-villa-entrance-shade-riyadh-480w.webp 480w, assets/img/mazallat_modern/modern-beige-fabric-villa-entrance-shade-riyadh.webp 736w"},"assets/img/sandwich_panel/sandwich-panel-annex-installation-riyadh.webp":{"w":1024,"h":1024,"srcset":"assets/img/sandwich_panel/sandwich-panel-annex-installation-riyadh-480w.webp 480w, assets/img/sandwich_panel/sandwich-panel-annex-installation-riyadh-768w.webp 768w, assets/img/sandwich_panel/sandwich-panel-annex-installation-riyadh.webp 1024w"},"assets/img/sandwich_panel/modern-sandwich-panel-annex-rooms-riyadh.webp":{"w":900,"h":900,"srcset":"assets/img/sandwich_panel/modern-sandwich-panel-annex-rooms-riyadh-480w.webp 480w, assets/img/sandwich_panel/modern-sandwich-panel-annex-rooms-riyadh-768w.webp 768w, assets/img/sandwich_panel/modern-sandwich-panel-annex-rooms-riyadh.webp 900w"},"assets/img/sandwich_panel/sandwich-panel-rooftop-annexes-riyadh.webp":{"w":900,"h":900,"srcset":"assets/img/sandwich_panel/sandwich-panel-rooftop-annexes-riyadh-480w.webp 480w, assets/img/sandwich_panel/sandwich-panel-rooftop-annexes-riyadh-768w.webp 768w, assets/img/sandwich_panel/sandwich-panel-rooftop-annexes-riyadh.webp 900w"},"assets/img/sandwich_panel/sandwich-panel-outdoor-seating-annexes-riyadh.webp":{"w":900,"h":900,"srcset":"assets/img/sandwich_panel/sandwich-panel-outdoor-seating-annexes-riyadh-480w.webp 480w, assets/img/sandwich_panel/sandwich-panel-outdoor-seating-annexes-riyadh-768w.webp 768w, assets/img/sandwich_panel/sandwich-panel-outdoor-seating-annexes-riyadh.webp 900w"},"assets/img/sandwich_panel/sandwich-panel-extra-rooms-thermal-insulation-riyadh.webp":{"w":1024,"h":1024,"srcset":"assets/img/sandwich_panel/sandwich-panel-extra-rooms-thermal-insulation-riyadh-480w.webp 480w, assets/img/sandwich_panel/sandwich-panel-extra-rooms-thermal-insulation-riyadh-768w.webp 768w, assets/img/sandwich_panel/sandwich-panel-extra-rooms-thermal-insulation-riyadh.webp 1024w"},"assets/img/sandwich_panel/heat-resistant-sandwich-panel-outdoor-rooms-riyadh.webp":{"w":1024,"h":1024,"srcset":"assets/img/sandwich_panel/heat-resistant-sandwich-panel-outdoor-rooms-riyadh-480w.webp 480w, assets/img/sandwich_panel/heat-resistant-sandwich-panel-outdoor-rooms-riyadh-768w.webp 768w, assets/img/sandwich_panel/heat-resistant-sandwich-panel-outdoor-rooms-riyadh.webp 1024w"},"assets/img/wood/wpc-wood-alternative-interior-wall-slats-riyadh.webp":{"w":1200,"h":900,"srcset":"assets/img/wood/wpc-wood-alternative-interior-wall-slats-riyadh-480w.webp 480w, assets/img/wood/wpc-wood-alternative-interior-wall-slats-riyadh-768w.webp 768w, assets/img/wood/wpc-wood-alternative-interior-wall-slats-riyadh.webp 1200w"},"assets/img/wood/wpc-wood-alternative-stair-entrance-slats-riyadh.webp":{"w":1200,"h":900,"srcset":"assets/img/wood/wpc-wood-alternative-stair-entrance-slats-riyadh-480w.webp 480w, assets/img/wood/wpc-wood-alternative-stair-entrance-slats-riyadh-768w.webp 768w, assets/img/wood/wpc-wood-alternative-stair-entrance-slats-riyadh.webp 1200w"},"assets/img/wood/wpc-wood-alternative-tv-wall-riyadh.webp":{"w":1200,"h":900,"srcset":"assets/img/wood/wpc-wood-alternative-tv-wall-riyadh-480w.webp 480w, assets/img/wood/wpc-wood-alternative-tv-wall-riyadh-768w.webp 768w, assets/img/wood/wpc-wood-alternative-tv-wall-riyadh.webp 1200w"},"assets/img/wood/wpc-wood-alternative-stair-wall-riyadh.webp":{"w":1200,"h":900,"srcset":"assets/img/wood/wpc-wood-alternative-stair-wall-riyadh-480w.webp 480w, assets/img/wood/wpc-wood-alternative-stair-wall-riyadh-768w.webp 768w, assets/img/wood/wpc-wood-alternative-stair-wall-riyadh.webp 1200w"},"assets/img/wood/wpc-wood-alternative-majlis-wall-riyadh.webp":{"w":1200,"h":900,"srcset":"assets/img/wood/wpc-wood-alternative-majlis-wall-riyadh-480w.webp 480w, assets/img/wood/wpc-wood-alternative-majlis-wall-riyadh-768w.webp 768w, assets/img/wood/wpc-wood-alternative-majlis-wall-riyadh.webp 1200w"},"assets/img/wood/wpc-wood-alternative-lighted-decor-slats-riyadh.webp":{"w":1200,"h":900,"srcset":"assets/img/wood/wpc-wood-alternative-lighted-decor-slats-riyadh-480w.webp 480w, assets/img/wood/wpc-wood-alternative-lighted-decor-slats-riyadh-768w.webp 768w, assets/img/wood/wpc-wood-alternative-lighted-decor-slats-riyadh.webp 1200w"}};

  function getResponsiveImage(src) {
    return RESPONSIVE_IMAGES[src] || null;
  }

const PAGE_INTENTS = {
    'mazallat.html': 'mazallat',
    'laser.html': 'laser',
    'wood.html': 'wood',
    'sandwich.html': 'sandwich',
    'cement.html': 'cement',
    'majalis.html': 'majalis'
  };

  const INTENT_KEYS = Object.keys(INTENTS);
  let currentIntentKey = null;

  // ==========================================================================
  // أدوات عامة
  // ==========================================================================

  function qs(selector, root = document) {
    return root.querySelector(selector);
  }

  function qsa(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function onReady(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
      return;
    }

    callback();
  }

  function cleanText(value) {
    return String(value || '').trim().replace(/\s+/g, ' ');
  }

  function normalizeText(value) {
    return cleanText(value)
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u064B-\u065F\u0670]/g, '')
      .replace(/\u0640/g, '')
      .replace(/[إأآا]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ئ/g, 'ي')
      .replace(/ؤ/g, 'و')
      .replace(/ة/g, 'ه');
  }

  function getUrlParam(name) {
    try {
      return new URL(window.location.href).searchParams.get(name) || '';
    } catch (_error) {
      return '';
    }
  }

  function isValidIntent(key) {
    return Object.prototype.hasOwnProperty.call(INTENTS, key);
  }

  function getIntent(key) {
    return isValidIntent(key) ? INTENTS[key] : null;
  }

  function isSafeImagePath(src) {
    return Boolean(src) && !/^(javascript|data):/i.test(src);
  }

  // ==========================================================================
  // كشف الخدمة الحالية
  // ==========================================================================

  function detectIntentFromPath() {
    const fileName = window.location.pathname.split('/').pop() || 'index.html';
    return PAGE_INTENTS[fileName] || null;
  }

  function detectIntentFromText(text) {
    const normalizedText = normalizeText(text);
    if (!normalizedText) return null;

    const matches = [];

    INTENT_KEYS.forEach((key) => {
      INTENTS[key].keywords.forEach((keyword) => {
        const normalizedKeyword = normalizeText(keyword);

        if (normalizedKeyword && normalizedText.includes(normalizedKeyword)) {
          matches.push({
            key,
            score: normalizedKeyword.length
          });
        }
      });
    });

    matches.sort((a, b) => b.score - a.score);
    return matches[0]?.key || null;
  }

  function detectIntentFromUrl() {
    const directIntent = normalizeText(getUrlParam('intent'));

    if (isValidIntent(directIntent)) {
      return directIntent;
    }

    return detectIntentFromText([
      directIntent,
      getUrlParam('utm_source'),
      getUrlParam('utm_medium'),
      getUrlParam('utm_campaign'),
      getUrlParam('utm_term'),
      getUrlParam('utm_content')
    ].join(' '));
  }

  function saveIntent(key) {
    if (!isValidIntent(key)) return;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          key,
          ts: Date.now()
        })
      );
    } catch (_error) {}
  }

  function readSavedIntent() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;

      const saved = JSON.parse(raw);
      if (!saved || !isValidIntent(saved.key)) return null;

      const savedAt = Number(saved.ts);

      if (!Number.isFinite(savedAt) || Date.now() - savedAt > STORAGE_TTL_MS) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return saved.key;
    } catch (_error) {
      return null;
    }
  }

  function clearSavedIntent() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_error) {}
  }

  function resolveInitialIntent() {
    return detectIntentFromUrl() || detectIntentFromPath() || readSavedIntent();
  }

  // ==========================================================================
  // بناء رسالة واتساب تلقائياً حسب الخدمة الحالية
  // ==========================================================================

  function getPageTitle() {
    return cleanText(qs('h1')?.textContent || document.title);
  }

  function getCurrentIntent() {
    return getIntent(currentIntentKey);
  }

  function buildWhatsAppMessage(intentKey = currentIntentKey) {
    const intent = getIntent(intentKey);
    const serviceName = intent?.messageLabel || 'خدمات مؤسسة إبداع الظل';
    const pageTitle = getPageTitle();

    return [
      `السلام عليكم، أرغب في معاينة مجانية وتسعيرة لخدمة ${serviceName}.`,
      pageTitle ? `الصفحة: ${pageTitle}` : null,
      'المدينة: الرياض',
      'فضلاً تواصلوا معي لتحديد التفاصيل والمعاينة.'
    ].filter(Boolean).join('\n');
  }

  function buildWhatsAppHref(intentKey = currentIntentKey) {
    const message = buildWhatsAppMessage(intentKey);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }

  function updateWhatsAppLinks() {
    const href = buildWhatsAppHref();

    qsa(SELECTORS.whatsappLink).forEach((link) => {
      link.href = href;
      link.target = '_blank';
      link.rel = 'noopener';
      link.setAttribute('aria-label', 'تواصل عبر واتساب مع مؤسسة إبداع الظل');
    });
  }

  // ==========================================================================
  // تحديث عناصر الواجهة حسب الخدمة
  // ==========================================================================

  function updateIntentButtons() {
    qsa(SELECTORS.intentButton).forEach((button) => {
      if (!(button instanceof HTMLButtonElement)) return;

      const key = button.getAttribute('data-intent');
      const isActive = key === currentIntentKey;

      button.classList.toggle('active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  }

  function updateIntentCtas() {
    const intent = getCurrentIntent();
    if (!intent) return;

    qsa(SELECTORS.intentCta).forEach((element) => {
      element.textContent = intent.cta;
    });
  }

  // ==========================================================================
  // Spotlight مخصص حسب الخدمة
  // ==========================================================================

  function renderSpotlightImage(src, intent) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'sg-thumb';
    button.setAttribute('data-open-lightbox', '');
    button.setAttribute('data-src', src);

    const image = document.createElement('img');
    const responsive = getResponsiveImage(src);

    image.src = src;
    image.alt = `${intent.label} - مؤسسة إبداع الظل بالرياض`;
    image.loading = 'lazy';
    image.decoding = 'async';

    if (responsive) {
      image.srcset = responsive.srcset;
      image.sizes = '(max-width: 640px) 50vw, 33vw';
      image.width = responsive.w;
      image.height = responsive.h;
    }

    button.appendChild(image);
    return button;
  }

  function renderSpotlight() {
    const spotlight = qs(SELECTORS.spotlight);
    if (!spotlight) return;

    const intent = getCurrentIntent();

    if (!intent) {
      spotlight.hidden = true;
      return;
    }

    const title = qs(SELECTORS.spotlightTitle, spotlight);
    const lead = qs(SELECTORS.spotlightLead, spotlight);
    const gallery = qs(SELECTORS.spotlightGallery, spotlight);

    spotlight.hidden = false;

    if (title) {
      title.textContent = `${intent.label} — خيارات مختارة لك`;
    }

    if (lead) {
      lead.textContent = intent.hint;
    }

    if (gallery) {
      const fragment = document.createDocumentFragment();

      intent.images.slice(0, 6).forEach((src) => {
        if (!isSafeImagePath(src)) return;
        fragment.appendChild(renderSpotlightImage(src, intent));
      });

      gallery.replaceChildren(fragment);
    }
  }

  // ==========================================================================
  // Lightbox بسيط وآمن لصور Spotlight
  // ==========================================================================

  function closeLightbox() {
    qs('.spotlight-lb')?.remove();
  }

  function openLightbox(src, alt = '') {
    if (!isSafeImagePath(src)) return;

    closeLightbox();

    const overlay = document.createElement('div');
    overlay.className = 'spotlight-lb open';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'تكبير الصورة');

    const backdrop = document.createElement('button');
    backdrop.type = 'button';
    backdrop.className = 'slb-backdrop';
    backdrop.setAttribute('aria-label', 'إغلاق الصورة');

    const dialog = document.createElement('div');
    dialog.className = 'slb-dialog';

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'slb-close';
    closeButton.textContent = '×';
    closeButton.setAttribute('aria-label', 'إغلاق الصورة');

    const image = document.createElement('img');
    image.className = 'slb-img';
    image.src = src;
    image.alt = alt;
    image.decoding = 'async';

    backdrop.addEventListener('click', closeLightbox);
    closeButton.addEventListener('click', closeLightbox);

    dialog.append(closeButton, image);
    overlay.append(backdrop, dialog);
    document.body.appendChild(overlay);

    closeButton.focus();
  }

  function wireLightbox() {
    document.addEventListener('click', (event) => {
      const trigger = event.target.closest(SELECTORS.lightboxTrigger);
      if (!trigger) return;

      const src = trigger.getAttribute('data-src');
      const alt = qs('img', trigger)?.alt || '';

      event.preventDefault();
      openLightbox(src, alt);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeLightbox();
      }
    });
  }

  // ==========================================================================
  // تطبيق الخدمة الحالية
  // ==========================================================================

  function applyIntent(key, options = {}) {
    currentIntentKey = isValidIntent(key) ? key : null;

    if (currentIntentKey) {
      document.documentElement.dataset.currentIntent = currentIntentKey;

      if (options.save === true) {
        saveIntent(currentIntentKey);
      }
    } else {
      delete document.documentElement.dataset.currentIntent;
    }

    updateIntentButtons();
    updateIntentCtas();
    updateWhatsAppLinks();
    renderSpotlight();
  }

  function wireIntentBar() {
    const bar = qs(SELECTORS.intentBar);
    if (!bar) return;

    bar.addEventListener('click', (event) => {
      const clearButton = event.target.closest(SELECTORS.intentClear);

      if (clearButton) {
        event.preventDefault();
        clearSavedIntent();
        applyIntent(null);
        return;
      }

      const intentButton = event.target.closest(SELECTORS.intentButton);
      if (!intentButton || !bar.contains(intentButton)) return;

      const key = intentButton.getAttribute('data-intent');
      if (!isValidIntent(key)) return;

      event.preventDefault();
      applyIntent(key, { save: true });

      const spotlight = qs(SELECTORS.spotlight);
      if (spotlight && !spotlight.hidden) {
        spotlight.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  }

  // ==========================================================================
  // التهيئة النهائية
  // ==========================================================================

  function init() {
    wireIntentBar();
    wireLightbox();

    applyIntent(resolveInitialIntent(), {
      save: Boolean(detectIntentFromPath())
    });

    window.IbdaaIntent = Object.freeze({
      apply(key) {
        applyIntent(key, { save: true });
      },
      clear() {
        clearSavedIntent();
        applyIntent(null);
      },
      current() {
        return currentIntentKey;
      },
      message() {
        return buildWhatsAppMessage(currentIntentKey);
      },
      href() {
        return buildWhatsAppHref(currentIntentKey);
      }
    });
  }

  onReady(init);
})();