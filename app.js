/**
 * ==============================================================================
 * تلفاز مباشر PRO - المشغل المزدوج المتقدم (HLS & MPEG-TS & MAC Portal) (app.js)
 * ==============================================================================
 * يدعم هذا الملف:
 * 1. تشغيل روابط تدفقات MPEG-TS المباشرة (.ts) بواسطة mpegts.js
 * 2. تشغيل روابط بوابات Stalker / MAC Portal مثل:
 *    http://host:port/play/live.php?mac=...&stream=...&extension=ts&play_token=...
 * 3. تشغيل تدفقات HLS (.m3u8) بواسطة hls.js
 * 4. تشفير الروابط بالكامل وحمايتها من الاستخراج المباشر
 * 5. واجهة إدخال وتشغيل الروابط المخصصة مع دعم وسيط تجاوز حظر CORS
 * ==============================================================================
 */

(function () {
  'use strict';

  // مفتاح التشفير الديناميكي المشترك لتشفير وفك تشفير الروابط في الذاكرة
  const CIPHER_SECRET_SEED = 'LIVE_TV_SECURE_STREAM_KEY_2026_@ANTIGRAVITY';

  /**
   * دالة فك تشفير وتجميع روابط القنوات وقت التشغيل
   */
  function decryptStreamUrl(payload) {
    try {
      const binaryString = atob(payload);
      let decrypted = '';
      for (let i = 0; i < binaryString.length; i++) {
        const charCode = binaryString.charCodeAt(i);
        const keyChar = CIPHER_SECRET_SEED.charCodeAt(i % CIPHER_SECRET_SEED.length);
        decrypted += String.fromCharCode(charCode ^ keyChar);
      }
      return decrypted;
    } catch (err) {
      return null;
    }
  }

  /**
   * دالة تشفير الروابط
   */
  function encryptStreamUrl(rawUrl) {
    let encrypted = '';
    for (let i = 0; i < rawUrl.length; i++) {
      const charCode = rawUrl.charCodeAt(i);
      const keyChar = CIPHER_SECRET_SEED.charCodeAt(i % CIPHER_SECRET_SEED.length);
      encrypted += String.fromCharCode(charCode ^ keyChar);
    }
    return btoa(encrypted);
  }

  // ==========================================================================
  // قاعدة بيانات القنوات المسبقة (تتضمن روابط HLS وروابط MPEG-TS وبوابات MAC)
  // ==========================================================================
  const CHANNELS_DATA = [
     {
      id: 'ch-21',
      name: 'biIN SPORTS NEWS FHD',
      category: 'sports',
      format: 'ts',
      quality: '1080p 60fps',
      icon: 'https://assets.bein.com/mena/sites/3/2015/06/NEWS_DIGITAL_Mono.png',
      description: 'تغطية وبث مباشر لأهم الفعاليات والأنشطة الرياضية العالمية بتدفق فائق السرعة وبدون تقطيع.',
      encryptedPayload: encryptStreamUrl('http://185.243.7.171:80/play/live.php?mac=00:1B:79:47:82:1F&stream=1917225&extension=ts&play_token=1wNa27GdLb')
     },
     {
      id: 'ch-20',
      name: 'biIN SPORTS Global FHD',
      category: 'sports',
      format: 'ts',
      quality: '1080p 60fps',
      icon: 'https://assets.bein.com/mena/sites/3/2015/06/bein_SPORTS_FTA_DIGITAL_Mono.png',
      description: 'تغطية وبث مباشر لأهم الفعاليات والأنشطة الرياضية العالمية بتدفق فائق السرعة وبدون تقطيع.',
      encryptedPayload: encryptStreamUrl('http://185.243.7.171:80/play/live.php?mac=00:1B:79:47:82:1F&stream=1917226&extension=ts&play_token=bpKXrfB2pL')
    },   
    {
      id: 'ch-01',
      name: 'ALWAN SPORTS 1 FHD',
      category: 'sports',
      format: 'ts',
      quality: '1080p 60fps',
      icon: 'https://k.top4top.io/p_3906tbhad1.png',
      description: 'تغطية وبث مباشر لأهم الفعاليات والأنشطة الرياضية العالمية بتدفق فائق السرعة وبدون تقطيع.',
      encryptedPayload: encryptStreamUrl('http://185.243.7.171:80/play/live.php?mac=00:1B:79:47:82:1F&stream=1859098&extension=ts&play_token=KrLeHHytGP')
    },
    {
      id: 'ch-02',
      name: 'ALWAN SPORTS 2 FHD',
      category: 'sports',
      format: 'ts',
      quality: '1080p 60fps',
      icon: 'https://k.top4top.io/p_3906tbhad1.png',
      description: 'تغطية وبث مباشر لأهم الفعاليات والأنشطة الرياضية العالمية بتدفق فائق السرعة وبدون تقطيع.',
      encryptedPayload: encryptStreamUrl('http://185.243.7.171:80/play/live.php?mac=00:1B:79:47:82:1F&stream=1859097&extension=ts&play_token=91WZG2kV8y')
    },
    {
      id: 'ch-03',
      name: 'ALWAN SPORTS 3 FHD',
      category: 'sports',
      format: 'ts',
      quality: '1080p 60fps',
      icon: 'https://k.top4top.io/p_3906tbhad1.png',
      description: 'تغطية وبث مباشر لأهم الفعاليات والأنشطة الرياضية العالمية بتدفق فائق السرعة وبدون تقطيع.',
      encryptedPayload: encryptStreamUrl('http://185.243.7.171:80/play/live.php?mac=00:1B:79:47:82:1F&stream=1859096&extension=ts&play_token=x1YgsozRrV')
    },
    {
      id: 'ch-04',
      name: 'ALWAN SPORTS 4 FHD',
      category: 'sports',
      format: 'ts',
      quality: '1080p 60fps',
      icon: 'https://k.top4top.io/p_3906tbhad1.png',
      description: 'تغطية وبث مباشر لأهم الفعاليات والأنشطة الرياضية العالمية بتدفق فائق السرعة وبدون تقطيع.',
      encryptedPayload: encryptStreamUrl('http://185.243.7.171:80/play/live.php?mac=00:1B:79:47:82:1F&stream=1859095&extension=ts&play_token=lQVHIJsDqU')
    },
    {
      id: 'ch-05',
      name: 'ALWAN SPORTS 5 FHD',
      category: 'sports',
      format: 'ts',
      quality: '1080p 60fps',
      icon: 'https://k.top4top.io/p_3906tbhad1.png',
      description: 'تغطية وبث مباشر لأهم الفعاليات والأنشطة الرياضية العالمية بتدفق فائق السرعة وبدون تقطيع.',
      encryptedPayload: encryptStreamUrl('http://185.243.7.171:80/play/live.php?mac=00:1B:79:47:82:1F&stream=1859094&extension=ts&play_token=W3d6Fsni6C')
    },
    {
      id: 'ch-06',
      name: 'ALWAN SPORTS 6 FHD',
      category: 'sports',
      format: 'ts',
      quality: '1080p 60fps',
      icon: 'https://k.top4top.io/p_3906tbhad1.png',
      description: 'تغطية وبث مباشر لأهم الفعاليات والأنشطة الرياضية العالمية بتدفق فائق السرعة وبدون تقطيع.',
      encryptedPayload: encryptStreamUrl('http://185.243.7.171:80/play/live.php?mac=00:1B:79:47:82:1F&stream=1859093&extension=ts&play_token=cVoBUQ81Ys')
    },
    {
      id: 'ch-07',
      name: 'biIN SPORTS 1 FHD',
      category: 'sports',
      format: 'ts',
      quality: '1080p 60fps',
      icon: 'https://assets.bein.com/mena/sites/4/2015/06/beIN_SPORTS1_DIGITAL_Mono.png',
      description: 'تغطية وبث مباشر لأهم الفعاليات والأنشطة الرياضية العالمية بتدفق فائق السرعة وبدون تقطيع.',
      encryptedPayload: encryptStreamUrl('http://185.243.7.171:80/play/live.php?mac=00:1B:79:47:82:1F&stream=1836268&extension=ts&play_token=tijlODM9co')
    },
    {
      id: 'ch-08',
      name: 'biIN SPORTS 2 FHD',
      category: 'sports',
      format: 'ts',
      quality: '1080p 60fps',
      icon: 'https://assets.bein.com/mena/sites/4/2021/02/beIN_SPORTS2_DIGITAL_Mono.png',
      description: 'تغطية وبث مباشر لأهم الفعاليات والأنشطة الرياضية العالمية بتدفق فائق السرعة وبدون تقطيع.',
      encryptedPayload: encryptStreamUrl('http://185.243.7.171:80/play/live.php?mac=00:1B:79:47:82:1F&stream=1836267&extension=ts&play_token=gxB7bgicRB')
    },
    {
      id: 'ch-09',
      name: 'biIN SPORTS 3 FHD',
      category: 'sports',
      format: 'ts',
      quality: '1080p 60fps',
      icon: 'https://assets.bein.com/mena/sites/4/2015/06/beIN_SPORTS3_DIGITAL_Mono.png',
      description: 'تغطية وبث مباشر لأهم الفعاليات والأنشطة الرياضية العالمية بتدفق فائق السرعة وبدون تقطيع.',
      encryptedPayload: encryptStreamUrl('http://185.243.7.171:80/play/live.php?mac=00:1B:79:47:82:1F&stream=1836266&extension=ts&play_token=MpqZ1c0vxg')
    },
    {
      id: 'ch-10',
      name: 'biIN SPORTS 4 FHD',
      category: 'sports',
      format: 'ts',
      quality: '1080p 60fps',
      icon: 'https://assets.bein.com/mena/sites/4/2015/06/beIN_SPORTS4_DIGITAL_Mono.png',
      description: 'تغطية وبث مباشر لأهم الفعاليات والأنشطة الرياضية العالمية بتدفق فائق السرعة وبدون تقطيع.',
      encryptedPayload: encryptStreamUrl('http://185.243.7.171:80/play/live.php?mac=00:1B:79:47:82:1F&stream=1836265&extension=ts&play_token=9aRroyafVb')
    },
    {
      id: 'ch-11',
      name: 'biIN SPORTS 5 FHD',
      category: 'sports',
      format: 'ts',
      quality: '1080p 60fps',
      icon: 'https://assets.bein.com/mena/sites/4/2015/06/beIN_SPORTS5_DIGITAL_Mono.png',
      description: 'تغطية وبث مباشر لأهم الفعاليات والأنشطة الرياضية العالمية بتدفق فائق السرعة وبدون تقطيع.',
      encryptedPayload: encryptStreamUrl('http://185.243.7.171:80/play/live.php?mac=00:1B:79:47:82:1F&stream=1836264&extension=ts&play_token=ccLVG3HuSB')
    },
    {
      id: 'ch-12',
      name: 'biIN SPORTS 6 FHD',
      category: 'sports',
      format: 'ts',
      quality: '1080p 60fps',
      icon: 'https://assets.bein.com/mena/sites/4/2021/02/beIN_SPORTS6_DIGITAL_Mono-d-1.png',
      description: 'تغطية وبث مباشر لأهم الفعاليات والأنشطة الرياضية العالمية بتدفق فائق السرعة وبدون تقطيع.',
      encryptedPayload: encryptStreamUrl('http://185.243.7.171:80/play/live.php?mac=00:1B:79:47:82:1F&stream=1917219&extension=ts&play_token=eFI0c2eg2E')
    },
    {
      id: 'ch-13',
      name: 'biIN SPORTS 7 FHD',
      category: 'sports',
      format: 'ts',
      quality: '1080p 60fps',
      icon: 'https://assets.bein.com/mena/sites/4/2015/06/beIN_SPORTS7_DIGITAL_Mono.png',
      description: 'تغطية وبث مباشر لأهم الفعاليات والأنشطة الرياضية العالمية بتدفق فائق السرعة وبدون تقطيع.',
      encryptedPayload: encryptStreamUrl('http://185.243.7.171:80/play/live.php?mac=00:1B:79:47:82:1F&stream=1836262&extension=ts&play_token=qgO0xJgoDT')
    },
    {
      id: 'ch-14',
      name: 'biIN SPORTS 8 FHD',
      category: 'sports',
      format: 'ts',
      quality: '1080p 60fps',
      icon: 'https://assets.bein.com/mena/sites/4/2023/09/logos-_beINSPORTS8.png',
      description: 'تغطية وبث مباشر لأهم الفعاليات والأنشطة الرياضية العالمية بتدفق فائق السرعة وبدون تقطيع.',
      encryptedPayload: encryptStreamUrl('http://185.243.7.171:80/play/live.php?mac=00:1B:79:47:82:1F&stream=1836261&extension=ts&play_token=DPZcIWMWYW')
    },
    {
      id: 'ch-15',
      name: 'biIN SPORTS 9 FHD',
      category: 'sports',
      format: 'ts',
      quality: '1080p 60fps',
      icon: 'https://assets.bein.com/mena/sites/4/2023/09/logos-_beINSPORTS9.png',
      description: 'تغطية وبث مباشر لأهم الفعاليات والأنشطة الرياضية العالمية بتدفق فائق السرعة وبدون تقطيع.',
      encryptedPayload: encryptStreamUrl('http://185.243.7.171:80/play/live.php?mac=00:1B:79:47:82:1F&stream=1836260&extension=ts&play_token=X7F9szg5pw')
    },
    {
      id: 'ch-16',
      name: '',
      category: 'sports',
      format: 'ts',
      quality: '1080p 60fps',
      icon: '⚽',
      description: 'تغطية وبث مباشر لأهم الفعاليات والأنشطة الرياضية العالمية بتدفق فائق السرعة وبدون تقطيع.',
      encryptedPayload: encryptStreamUrl('')
    },
    {
      id: 'ch-17',
      name: '',
      category: 'sports',
      format: 'ts',
      quality: '1080p 60fps',
      icon: '⚽',
      description: 'تغطية وبث مباشر لأهم الفعاليات والأنشطة الرياضية العالمية بتدفق فائق السرعة وبدون تقطيع.',
      encryptedPayload: encryptStreamUrl('')
    },
    {
      id: 'ch-18',
      name: '',
      category: 'sports',
      format: 'ts',
      quality: '1080p 60fps',
      icon: '⚽',
      description: 'تغطية وبث مباشر لأهم الفعاليات والأنشطة الرياضية العالمية بتدفق فائق السرعة وبدون تقطيع.',
      encryptedPayload: encryptStreamUrl('')









    },
    {
      id: 'ch-0',
      name: 'سينما هوليوود (Sintel Cinema)',
      category: 'movies',
      format: 'hls',
      quality: '4K Ultra HD',
      icon: '🎬',
      description: 'أروع الأفلام والإنتاجات السينمائية العالمية بجودة صوت محيطي متعدد القنوات ونقاء فائق.',
      encryptedPayload: encryptStreamUrl('https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8')
    },
    {
      id: 'ch-0',
      name: 'قناة أفلام الخيال العلمي (Tears of Steel)',
      category: 'movies',
      format: 'hls',
      quality: '1080p FHD',
      icon: '🚀',
      description: 'مختارات شيقة من أفلام الحركة والخيال العلمي والمؤثرات البصرية المبتكرة بجودة سينمائية.',
      encryptedPayload: encryptStreamUrl('https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8')
    },
    {
      id: 'ch-0',
      name: 'قناة الطبيعة والبحار (Oceans Discovery)',
      category: 'documentary',
      format: 'hls',
      quality: '1080p FHD',
      icon: '🌊',
      description: 'سلسلة وثائقية مبهرة تستكشف أعماق المحيطات وأسرار الحياة البرية في شتى بقاع الأرض.',
      encryptedPayload: encryptStreamUrl('https://playertest.longtailvideo.com/adaptive/oceans_aes/oceans_aes.m3u8')
    },
    {
      id: 'ch-0',
      name: 'قناة الأطفال والمغامرات (Bunny Kids TV)',
      category: 'kids',
      format: 'hls',
      quality: '720p HD',
      icon: '🐰',
      description: 'عالم ممتع وترفيهي وتعليمي للأطفال يضم أحدث الرسوم المتحركة والبرامج الهادفة والمسلية.',
      encryptedPayload: encryptStreamUrl('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8')
    }
  ];

  // ==========================================================================
  // عناصر واجهة المستخدم (DOM Elements)
  // ==========================================================================
  const videoPlayer = document.getElementById('video-player');
  const videoContainer = document.getElementById('video-container');
  const protectionOverlay = document.getElementById('protection-overlay');
  const playerLoader = document.getElementById('player-loader');
  const loaderStatus = document.getElementById('loader-status');
  const playerError = document.getElementById('player-error');
  const retryBtn = document.getElementById('retry-btn');
  const proxyRetryBtn = document.getElementById('proxy-retry-btn');
  const channelsList = document.getElementById('channels-list');
  const channelCountSpan = document.getElementById('channel-count');
  const noChannelsDiv = document.getElementById('no-channels');
  const channelSearchInput = document.getElementById('channel-search');
  const clearSearchBtn = document.getElementById('clear-search');
  const categoriesContainer = document.getElementById('categories-container');
  const securityAlert = document.getElementById('security-alert');
  const toggleSidebarBtn = document.getElementById('toggle-sidebar');
  const channelsSidebar = document.getElementById('channels-sidebar');

  // عناصر مشغل الفيديو المخصصة
  const playPauseBtn = document.getElementById('play-pause-btn');
  const iconPlay = playPauseBtn.querySelector('.icon-play');
  const iconPause = playPauseBtn.querySelector('.icon-pause');
  const muteBtn = document.getElementById('mute-btn');
  const iconVolume = muteBtn.querySelector('.icon-volume');
  const iconMute = muteBtn.querySelector('.icon-mute');
  const volumeSlider = document.getElementById('volume-slider');
  const reloadStreamBtn = document.getElementById('reload-stream-btn');
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  const iconExpand = fullscreenBtn.querySelector('.icon-expand');
  const iconCompress = fullscreenBtn.querySelector('.icon-compress');
  const playerEngineBadge = document.getElementById('player-engine-badge');

  // عناصر اختيار الجودة (SD / HD / FHD)
  const qualitySelectorContainer = document.getElementById('quality-selector-container');
  const qualityBtn = document.getElementById('quality-btn');
  const qualityMenu = document.getElementById('quality-menu');
  const currentQualityBadge = document.getElementById('current-quality-badge');
  const currentChannelQuality = document.getElementById('current-channel-quality');

  // عناصر تفاصيل القناة النشطة
  const currentChannelName = document.getElementById('current-channel-name');
  const currentChannelCategory = document.getElementById('current-channel-category');
  const currentChannelType = document.getElementById('current-channel-type');
  const currentChannelLogo = document.getElementById('current-channel-logo');
  const currentChannelDesc = document.getElementById('current-channel-desc');

  // عناصر النافذة المنبثقة لإضافة رابط مخصص
  const openCustomModalBtn = document.getElementById('open-custom-modal-btn');
  const customStreamModal = document.getElementById('custom-stream-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const cancelModalBtn = document.getElementById('cancel-modal-btn');
  const playCustomBtn = document.getElementById('play-custom-btn');
  const customUrlInput = document.getElementById('custom-url-input');
  const customNameInput = document.getElementById('custom-name-input');
  const customLogoInput = document.getElementById('custom-logo-input');
  const customCategorySelect = document.getElementById('custom-category-select');
  const customFormatSelect = document.getElementById('custom-format-select');
  const customProxySelect = document.getElementById('custom-proxy-select');

  // ==========================================================================
  // حالات المشغلات المتعددة (Player Instances)
  // ==========================================================================
  let hlsInstance = null;
  let mpegtsInstance = null;
  let activeChannel = null;
  let currentCategory = 'all';
  let searchQuery = '';
  let securityAlertTimer = null;
  let lastAttemptedRawUrl = '';
  let currentSelectedQuality = 'auto'; // 'auto', 'fhd', 'hd', 'sd'

  // ==========================================================================
  // منظومة الحماية والأمان (Security Shield)
  // ==========================================================================
  function triggerSecurityAlert(message) {
    if (securityAlertTimer) clearTimeout(securityAlertTimer);
    if (message) {
      const textSpan = securityAlert.querySelector('.alert-text');
      if (textSpan) textSpan.textContent = message;
    }
    securityAlert.classList.remove('hidden');
    securityAlertTimer = setTimeout(() => {
      securityAlert.classList.add('hidden');
    }, 3200);
  }

  // تعطيل القائمة المنبثقة للزر الأيمن
  document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    triggerSecurityAlert('تم تفعيل حماية البث: تم حظر النقر بالزر الأيمن لمنع استخراج كود المشغل.');
    return false;
  }, false);

  // حظر اختصارات المطورين
  document.addEventListener('keydown', function (e) {
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      triggerSecurityAlert('أدوات المطورين محظورة لحماية روابط البث.');
      return false;
    }
    if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'i', 'j', 'c'].includes(e.key)) {
      e.preventDefault();
      triggerSecurityAlert('أمر فحص العناصر محظور لحماية الروابط.');
      return false;
    }
    if (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      return false;
    }
  });

  // تنظيف السجلات الدورية
  setInterval(() => {
    try { console.clear(); } catch (e) {}
  }, 10000);

  // ==========================================================================
  // فحص نوع الرابط وتحديد المحرك المناسب (Smart Format Detection)
  // ==========================================================================
  /**
   * تحديد هل الرابط هو تدفق MPEG-TS أم HLS أم غير ذلك
   */
  function detectStreamFormat(url, preferredFormat) {
    if (preferredFormat && preferredFormat !== 'auto') {
      return preferredFormat;
    }
    const cleanUrl = (url || '').toLowerCase();
    
    // روابط بوابات Stalker أو الامتدادات الصريحة لـ TS
    if (
      cleanUrl.includes('extension=ts') ||
      cleanUrl.endsWith('.ts') ||
      cleanUrl.includes('/play/live.php') ||
      cleanUrl.includes('type=m2ts') ||
      cleanUrl.includes('format=ts')
    ) {
      return 'ts';
    }

    // روابط قوائم تشغيل HLS
    if (cleanUrl.includes('.m3u8') || cleanUrl.includes('extension=m3u8')) {
      return 'hls';
    }

    // الافتراضي هو TS إذا وُجدت مؤشرات ماك، وإلا HLS
    if (cleanUrl.includes('mac=') || cleanUrl.includes('stream=')) {
      return 'ts';
    }

    return 'hls';
  }

  /**
   * تطبيق وسيط فك حظر CORS في حال طلبه المستخدم أو فشل الاتصال المباشر
   */
  function applyCorsProxy(url, proxyType) {
    if (!proxyType || proxyType === 'direct') {
      return url;
    }
    if (proxyType === 'corsproxy') {
      return `https://corsproxy.io/?url=${encodeURIComponent(url)}`;
    }
    if (proxyType === 'allorigins') {
      return `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    }
    return url;
  }

  // ==========================================================================
  // المحرك المزدوج لتشغيل الفيديو (Dual Playback Engine)
  // ==========================================================================

  /**
   * إيقاف وتفريغ كافة المشغلات السابقة بأمان
   */
  function resetAllPlayers() {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
    if (mpegtsInstance) {
      try {
        mpegtsInstance.pause();
        mpegtsInstance.unload();
        mpegtsInstance.detachMediaElement();
        mpegtsInstance.destroy();
      } catch (e) {}
      mpegtsInstance = null;
    }
    videoPlayer.pause();
    videoPlayer.removeAttribute('src');
    videoPlayer.load();
  }

  /**
   * تشغيل القناة المحددة عبر المحرك المناسب مع التشفير
   */
  function playChannel(channel, overrideProxy) {
    if (!channel) return;
    activeChannel = channel;

    // تحديث بيانات الواجهة
    updateChannelUI(channel);

    // إظهار شاشة التحميل
    playerLoader.classList.remove('hidden');
    playerError.classList.add('hidden');
    proxyRetryBtn.classList.add('hidden');

    // فك تشفير الرابط في الذاكرة المعزولة
    let streamUrl = decryptStreamUrl(channel.encryptedPayload);
    if (!streamUrl) {
      showPlayerError('فشل في فك تشفير بيانات القناة.');
      return;
    }

    lastAttemptedRawUrl = streamUrl;

    // كشف Mixed Content: إذا كان الموقع HTTPS والرابط HTTP → تفعيل البروكسي تلقائياً
    let autoProxy = overrideProxy || channel.proxy || 'direct';
    if (
      autoProxy === 'direct' &&
      window.location.protocol === 'https:' &&
      streamUrl.startsWith('http://')
    ) {
      autoProxy = 'corsproxy'; // تجاوز حظر المتصفح للمحتوى المختلط تلقائياً
    }
    const finalStreamUrl = applyCorsProxy(streamUrl, autoProxy);

    // تفريغ أي مشغل نشط حالياً
    resetAllPlayers();

    // فحص واكتشاف صيغة البث
    const format = detectStreamFormat(streamUrl, channel.format);

    if (format === 'ts') {
      playMpegTsStream(finalStreamUrl, channel);
    } else {
      playHlsStream(finalStreamUrl, channel);
    }

    highlightActiveChannelCard();
  }

  /**
   * محرك تشغيل تدفقات MPEG-TS المباشرة بواسطة mpegts.js
   * مصمم خصيصاً لروابط Stalker/MAC Portal وروابط .ts
   */
  function playMpegTsStream(url, channel) {
    playerEngineBadge.textContent = 'MPEG-TS Engine (Live)';
    playerEngineBadge.style.color = '#fbbf24';
    loaderStatus.textContent = 'جارٍ معالجة حزم MPEG-TS وبوابة MAC Portal...';

    if (window.mpegts && mpegts.isSupported()) {
      try {
        mpegtsInstance = mpegts.createPlayer({
          type: 'mpegts', // أو 'm2ts'
          isLive: true,
          url: url
        }, {
          enableWorker: true,
          lazyLoad: false,
          enableStashBuffer: true,             // تفعيل التخزين المؤقت المسبق لمنع التقطيع
          stashInitialSize: 512,              // حجم تخزين أولي 512KB لضمان انسيابية الإطارات
          liveBufferLatencyChasing: false,     // إيقاف تسريع وتخطي الإطارات العنيف لمنع تقطيع الصوت والصورة
          autoCleanupSourceBuffer: true,      // تنظيف الذاكرة تلقائياً
          autoCleanupMaxBackwardDuration: 60, // الاحتفاظ بـ 60 ثانية سابقة
          autoCleanupMinBackwardDuration: 30
        });

        mpegtsInstance.attachMediaElement(videoPlayer);
        mpegtsInstance.load();

        const playPromise = mpegtsInstance.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            playerLoader.classList.add('hidden');
          }).catch(err => {
            // محاولة التشغيل مع كتم الصوت إذا حظر المتصفح التشغيل التلقائي
            videoPlayer.muted = true;
            videoPlayer.play().then(() => {
              playerLoader.classList.add('hidden');
              updateVolumeIcons();
            }).catch(() => {});
          });
        }

        // مراقبة أحداث المشغل والأخطاء
        mpegtsInstance.on(mpegts.Events.ERROR, function (errorType, errorDetail, errorInfo) {
          console.clear();
          showPlayerError(
            'تعذر استقبال تدفق MPEG-TS المباشر. قد يكون رابط البث منتهياً، السيرفر مقفلاً، أو محظوراً بسياسة CORS.',
            true
          );
        });

        // إخفاء التحميل عند بدء استقبال الإطارات
        videoPlayer.onplaying = function () {
          playerLoader.classList.add('hidden');
        };

      } catch (err) {
        showPlayerError('حدث خطأ أثناء تهيئة محرك MPEG-TS: ' + err.message, true);
      }
    } else {
      showPlayerError('المتصفح الحالي لا يدعم مكتبة mpegts.js لتشغيل حزم الـ TS.');
    }
  }

  /**
   * محرك تشغيل تدفقات HLS (.m3u8) بواسطة hls.js
   */
  function playHlsStream(url, channel) {
    playerEngineBadge.textContent = 'HLS Engine (m3u8)';
    playerEngineBadge.style.color = '#60a5fa';
    loaderStatus.textContent = 'جارٍ تشغيل قائمة HLS المباشرة...';

    if (window.Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        debug: false,
        enableWorker: true,
        lowLatencyMode: false,              // إيقاف وضع زمن الاستجابة المنخفض الشديد لضمان ثبات تدفقات IPTV
        backBufferLength: 60,               // سعة تخزين خلفية 60 ثانية
        maxBufferLength: 60,                // سعة تخزين مسبقة 60 ثانية لتجاوز تذبذب سرعة الإنترنت
        maxMaxBufferLength: 120,
        maxBufferSize: 60 * 1000 * 1000,    // سعة تخزين قصوى 60 ميجابايت
        maxBufferHole: 0.5,                 // قفز وتجاوز فجوات البث الصغيرة بسلاسة دون توقف
        highBufferWatchdogPeriod: 2,        // مراقبة تعليق البث وتجاوزه
        nudgeOffset: 0.2,                   // تحريك المشغل عند تجمد الإطار
        nudgeMaxRetry: 8,                   // إعادة المحاولة التلقائية عند التعليق
        liveSyncDurationCount: 3,           // التزامن مع 3 أجزاء من البث لضمان عدم نفاذ البيانات
        liveMaxLatencyDurationCount: 10,
        fragLoadingTimeOut: 20000,          // مهلة كافية لتحميل أجزاء البث
        manifestLoadingTimeOut: 20000
      });

      hlsInstance.loadSource(url);
      hlsInstance.attachMedia(videoPlayer);

      hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
        playerLoader.classList.add('hidden');
        if (currentSelectedQuality !== 'auto') {
          applyHlsQualityLevel(currentSelectedQuality);
        }
        videoPlayer.play().catch(() => {
          videoPlayer.muted = true;
          videoPlayer.play();
          updateVolumeIcons();
        });
      });

      // رصد تبديل الجودة التلقائي لتحديث الشارة
      hlsInstance.on(Hls.Events.LEVEL_SWITCHED, function (event, data) {
        if (currentSelectedQuality === 'auto' && hlsInstance && hlsInstance.levels) {
          const level = hlsInstance.levels[data.level];
          if (level) {
            const h = level.height || 720;
            let tag = 'Auto';
            if (h >= 1000) tag = 'Auto (FHD)';
            else if (h >= 700) tag = 'Auto (HD)';
            else tag = 'Auto (SD)';
            if (currentQualityBadge) currentQualityBadge.textContent = tag;
          }
        }
      });

      hlsInstance.on(Hls.Events.ERROR, function (event, data) {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hlsInstance.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hlsInstance.recoverMediaError();
              break;
            default:
              showPlayerError('انقطع تدفق HLS. يرجى تجربة قناة أخرى.', true);
              hlsInstance.destroy();
              break;
          }
        } else if (data.details === Hls.ErrorDetails.BUFFER_STALLED_ERROR) {
          // تجاوز توقف البافر اللحظي لاستعادة السلاسة فوراً
          if (videoPlayer && !videoPlayer.paused) {
            videoPlayer.currentTime += 0.1;
          }
        }
      });
    } else if (videoPlayer.canPlayType('application/vnd.apple.mpegurl')) {
      videoPlayer.src = url;
      videoPlayer.addEventListener('loadedmetadata', function () {
        playerLoader.classList.add('hidden');
        videoPlayer.play();
      });
      videoPlayer.addEventListener('error', function () {
        showPlayerError('تعذر تشغيل البث على هذا المتصفح.', true);
      });
    } else {
      showPlayerError('متصفحك لا يدعم تقنية تشغيل بث HLS.');
    }
  }

  /**
   * إظهار شاشة الخطأ وتوفير زر المحاولة عبر البروكسي
   */
  function showPlayerError(message, showProxyOption) {
    playerLoader.classList.add('hidden');
    playerError.classList.remove('hidden');
    const msgElem = document.getElementById('error-message');
    if (msgElem && message) msgElem.textContent = message;

    if (showProxyOption) {
      proxyRetryBtn.classList.remove('hidden');
    } else {
      proxyRetryBtn.classList.add('hidden');
    }
  }

  // زر إعادة المحاولة عبر وسيط CORS
  proxyRetryBtn.addEventListener('click', () => {
    if (activeChannel) {
      // إذا كان الموقع HTTPS والرابط HTTP، جرب allorigins كبديل لـ corsproxy
      let nextProxy = 'corsproxy';
      if (
        window.location.protocol === 'https:' &&
        lastAttemptedRawUrl &&
        lastAttemptedRawUrl.startsWith('http://')
      ) {
        nextProxy = 'allorigins';
      }
      triggerSecurityAlert('جارٍ إعادة الاتصال وتجاوز قيود CORS عبر البروكسي...');
      playChannel(activeChannel, nextProxy);
    }
  });

  retryBtn.addEventListener('click', () => {
    if (activeChannel) playChannel(activeChannel);
  });

  /**
   * توليد عنصر الأيقونة أو الصورة المصغرة للقناة (يدعم الروابط الخارجية، المسارات المحلية، وBase64)
   */
  function renderChannelIcon(iconVal) {
    if (!iconVal) return '📺';
    const str = String(iconVal).trim();
    // فحص هل القيمة هي رابط صورة ويب أو مسار أو data URI
    if (
      str.startsWith('http://') ||
      str.startsWith('https://') ||
      str.startsWith('data:image/') ||
      str.startsWith('/') ||
      str.startsWith('./') ||
      /\.(png|jpe?g|svg|webp|gif|ico)($|\?)/i.test(str)
    ) {
      return `<img src="${str}" alt="logo" class="channel-thumb-img" onerror="this.onerror=null;this.parentElement.innerHTML='📺';">`;
    }
    // إذا كانت إيموجي أو نصاً
    return `<span>${str}</span>`;
  }

  /**
   * تحديث بيانات واجهة المشغل
   */
  function updateChannelUI(channel) {
    currentChannelName.textContent = channel.name;
    currentChannelCategory.textContent = getCategoryName(channel.category);
    currentChannelDesc.textContent = channel.description;
    currentChannelLogo.innerHTML = renderChannelIcon(channel.icon || channel.logo);

    const format = detectStreamFormat(decryptStreamUrl(channel.encryptedPayload), channel.format);
    if (format === 'ts') {
      currentChannelType.textContent = 'MPEG-TS / MAC';
      currentChannelType.style.color = '#fbbf24';
    } else {
      currentChannelType.textContent = 'HLS (m3u8)';
      currentChannelType.style.color = '#60a5fa';
    }
  }

  function getCategoryName(cat) {
    const map = {
      all: 'جميع القنوات',
      sports: 'رياضة',
      news: 'أخبار',
      movies: 'سينما وأفلام',
      documentary: 'وثائقيات',
      kids: 'أطفال'
    };
    return map[cat] || cat;
  }

  // ==========================================================================
  // بناء وإدارة قائمة القنوات (Channels Grid & Sidebar)
  // ==========================================================================
  function renderChannels() {
    channelsList.innerHTML = '';

    const filtered = CHANNELS_DATA.filter(channel => {
      const matchCategory = (currentCategory === 'all') || (channel.category === currentCategory);
      const query = searchQuery.trim().toLowerCase();
      const matchSearch = !query || 
        channel.name.toLowerCase().includes(query) || 
        channel.description.toLowerCase().includes(query) ||
        getCategoryName(channel.category).toLowerCase().includes(query);
      return matchCategory && matchSearch;
    });

    channelCountSpan.textContent = filtered.length;

    if (filtered.length === 0) {
      noChannelsDiv.classList.remove('hidden');
      return;
    } else {
      noChannelsDiv.classList.add('hidden');
    }

    filtered.forEach(channel => {
      const card = document.createElement('div');
      const isActive = activeChannel && activeChannel.id === channel.id;
      card.className = `channel-card ${isActive ? 'active' : ''}`;
      card.dataset.channelId = channel.id;

      // تحديد الشارة المناسبة
      const isTs = channel.format === 'ts' || (channel.name && channel.name.includes('TS'));
      const isMac = channel.name && channel.name.includes('MAC');
      let badgeClass = 'card-badge-format';
      let badgeLabel = 'HLS';

      if (isMac) {
        badgeClass += ' mac';
        badgeLabel = 'MAC Portal';
      } else if (isTs) {
        badgeClass += ' ts';
        badgeLabel = 'MPEG-TS';
      } else {
        badgeClass += ' hls';
        badgeLabel = 'HLS';
      }

      card.innerHTML = `
        <div class="card-icon">${renderChannelIcon(channel.icon || channel.logo)}</div>
        <div class="card-content">
          <div class="card-title">${channel.name}</div>
          <div class="card-subtitle">
            <span class="${badgeClass}">${badgeLabel}</span>
            <span>•</span>
            <span>${getCategoryName(channel.category)}</span>
            <span>•</span>
            <span>${channel.quality || 'FHD'}</span>
          </div>
        </div>
        <div class="playing-bars">
          <div class="bar"></div>
          <div class="bar"></div>
          <div class="bar"></div>
        </div>
      `;

      card.addEventListener('click', () => {
        playChannel(channel);
        if (window.innerWidth <= 1024) {
          channelsSidebar.classList.remove('open');
        }
      });

      channelsList.appendChild(card);
    });
  }

  function highlightActiveChannelCard() {
    const cards = document.querySelectorAll('.channel-card');
    cards.forEach(card => {
      if (activeChannel && card.dataset.channelId === activeChannel.id) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });
  }

  // ==========================================================================
  // نافذة إدخال وتشغيل الروابط المخصصة وبوابات MAC Portal
  // ==========================================================================
  if (openCustomModalBtn) {
    openCustomModalBtn.addEventListener('click', () => {
      customStreamModal.classList.remove('hidden');
      customUrlInput.focus();
    });
  }

  closeModalBtn.addEventListener('click', closeCustomModal);
  cancelModalBtn.addEventListener('click', closeCustomModal);

  function closeCustomModal() {
    customStreamModal.classList.add('hidden');
  }

  // إغلاق النافذة عند النقر خارجها
  customStreamModal.addEventListener('click', (e) => {
    if (e.target === customStreamModal) {
      closeCustomModal();
    }
  });

  // تشغيل وحفظ الرابط المخصص
  playCustomBtn.addEventListener('click', () => {
    const rawUrl = customUrlInput.value.trim();
    if (!rawUrl) {
      alert('يرجى إدخال رابط البث المباشر أولاً.');
      return;
    }

    const channelName = customNameInput.value.trim() || 'قناة مخصصة ' + (CHANNELS_DATA.length + 1);
    const category = customCategorySelect.value;
    const formatPreference = customFormatSelect.value;
    const proxyPreference = customProxySelect.value;

    const detectedFormat = detectStreamFormat(rawUrl, formatPreference);
    const logoVal = (customLogoInput && customLogoInput.value.trim()) || (detectedFormat === 'ts' ? '⚡' : '📡');

    // إنشاء كائن القناة الجديدة وتشفير رابطها فوراً
    const newChannel = {
      id: 'custom-' + Date.now(),
      name: channelName,
      category: category,
      format: detectedFormat,
      proxy: proxyPreference,
      quality: detectedFormat === 'ts' ? '1080p TS' : '1080p HLS',
      icon: logoVal,
      description: `رابط مخصص يعمل عبر محرك ${detectedFormat === 'ts' ? 'MPEG-TS' : 'HLS'} مع التشفير الداخلي.`,
      encryptedPayload: encryptStreamUrl(rawUrl)
    };

    // إدراج القناة في بداية القائمة
    CHANNELS_DATA.unshift(newChannel);

    // إعادة رسم القائمة وتشغيل القناة الجديدة فوراً
    renderChannels();
    closeCustomModal();
    playChannel(newChannel);

    triggerSecurityAlert(`تمت إضافة وتشغيل "${channelName}" بنجاح وتشفير رابطها.`);
  });

  // ==========================================================================
  // عناصر التحكم بالمشغل (Controls Handlers)
  // ==========================================================================
  playPauseBtn.addEventListener('click', togglePlayPause);
  protectionOverlay.addEventListener('click', togglePlayPause);

  function togglePlayPause() {
    if (videoPlayer.paused) {
      videoPlayer.play();
    } else {
      videoPlayer.pause();
    }
  }

  videoPlayer.addEventListener('play', () => {
    iconPlay.classList.add('hidden');
    iconPause.classList.remove('hidden');
  });

  videoPlayer.addEventListener('pause', () => {
    iconPlay.classList.remove('hidden');
    iconPause.classList.add('hidden');
  });

  muteBtn.addEventListener('click', () => {
    videoPlayer.muted = !videoPlayer.muted;
    updateVolumeIcons();
  });

  volumeSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    videoPlayer.volume = val;
    videoPlayer.muted = (val === 0);
    updateVolumeIcons();
  });

  function updateVolumeIcons() {
    if (videoPlayer.muted || videoPlayer.volume === 0) {
      iconVolume.classList.add('hidden');
      iconMute.classList.remove('hidden');
      volumeSlider.value = 0;
    } else {
      iconVolume.classList.remove('hidden');
      iconMute.classList.add('hidden');
      volumeSlider.value = videoPlayer.volume;
    }
  }

  reloadStreamBtn.addEventListener('click', () => {
    if (activeChannel) {
      playChannel(activeChannel);
      triggerSecurityAlert('تم تحديث جلسة وتدفق البث المباشر.');
    }
  });

  fullscreenBtn.addEventListener('click', toggleFullscreen);

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      if (videoContainer.requestFullscreen) {
        videoContainer.requestFullscreen();
      } else if (videoContainer.webkitRequestFullscreen) {
        videoContainer.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
      iconExpand.classList.add('hidden');
      iconCompress.classList.remove('hidden');
    } else {
      iconExpand.classList.remove('hidden');
      iconCompress.classList.add('hidden');
    }
  });

  // ==========================================================================
  // محرك اختيار جودة البث (SD / HD / FHD / Auto)
  // ==========================================================================

  /**
   * تطبيق مستوى الجودة المحدد في محرك Hls.js
   */
  function applyHlsQualityLevel(quality) {
    if (!hlsInstance || !hlsInstance.levels || hlsInstance.levels.length === 0) return;

    if (quality === 'auto') {
      hlsInstance.currentLevel = -1; // تفعيل التكيف التلقائي (ABR)
      return;
    }

    const levels = hlsInstance.levels;
    let targetIndex = -1;

    if (quality === 'fhd') {
      // البحث عن دقة 1080p أو أعلى
      for (let i = levels.length - 1; i >= 0; i--) {
        if (levels[i].height >= 1000) { targetIndex = i; break; }
      }
      if (targetIndex === -1) targetIndex = levels.length - 1; // أعلى دقة متوفرة
    } else if (quality === 'hd') {
      // البحث عن دقة 720p
      for (let i = 0; i < levels.length; i++) {
        if (levels[i].height >= 700 && levels[i].height < 1000) { targetIndex = i; break; }
      }
      if (targetIndex === -1) {
        targetIndex = Math.min(Math.floor(levels.length / 2), levels.length - 1);
      }
    } else if (quality === 'sd') {
      // البحث عن دقة منخفضة (360p / 480p)
      for (let i = 0; i < levels.length; i++) {
        if (levels[i].height < 700 && levels[i].height > 0) { targetIndex = i; break; }
      }
      if (targetIndex === -1) targetIndex = 0; // أقل دقة متوفرة
    }

    if (targetIndex !== -1) {
      hlsInstance.currentLevel = targetIndex;
    }
  }

  /**
   * تبديل جودة البث وتحديث عناصر الواجهة
   */
  function setStreamQuality(quality) {
    currentSelectedQuality = quality;

    // تحديث الخيار النشط في القائمة
    if (qualityMenu) {
      const items = qualityMenu.querySelectorAll('.quality-item');
      items.forEach(item => {
        if (item.dataset.quality === quality) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    }

    let badgeText = 'Auto';
    let fullText = 'تلقائي (Auto)';

    if (quality === 'fhd') {
      badgeText = '1080p';
      fullText = 'FHD (1080p)';
    } else if (quality === 'hd') {
      badgeText = '720p';
      fullText = 'HD (720p)';
    } else if (quality === 'sd') {
      badgeText = 'SD';
      fullText = 'SD (360p/480p)';
    }

    if (currentQualityBadge) currentQualityBadge.textContent = badgeText;
    if (currentChannelQuality) currentChannelQuality.textContent = fullText;

    if (hlsInstance) {
      applyHlsQualityLevel(quality);
      triggerSecurityAlert(`تم ضبط جودة البث على: ${fullText}`);
    } else {
      // لقنوات TS المباشرة
      triggerSecurityAlert(`تم تعيين وضع الجودة المفضل: ${fullText}`);
    }
  }

  // تفعيل فتح وإغلاق قائمة اختيار الجودة
  if (qualityBtn && qualityMenu) {
    qualityBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      qualityMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
      if (qualitySelectorContainer && !qualitySelectorContainer.contains(e.target)) {
        qualityMenu.classList.add('hidden');
      }
    });

    const qualityItems = qualityMenu.querySelectorAll('.quality-item');
    qualityItems.forEach(item => {
      item.addEventListener('click', () => {
        const q = item.dataset.quality;
        setStreamQuality(q);
        qualityMenu.classList.add('hidden');
      });
    });
  }

  // اختصارات لوحة المفاتيح
  document.addEventListener('keydown', (e) => {
    if (document.activeElement === channelSearchInput || customStreamModal.contains(document.activeElement)) {
      return;
    }
    if (e.code === 'Space') {
      e.preventDefault();
      togglePlayPause();
    } else if (e.code === 'KeyM') {
      videoPlayer.muted = !videoPlayer.muted;
      updateVolumeIcons();
    } else if (e.code === 'KeyF') {
      toggleFullscreen();
    } else if (e.code === 'ArrowUp') {
      e.preventDefault();
      videoPlayer.volume = Math.min(1, videoPlayer.volume + 0.1);
      videoPlayer.muted = false;
      updateVolumeIcons();
    } else if (e.code === 'ArrowDown') {
      e.preventDefault();
      videoPlayer.volume = Math.max(0, videoPlayer.volume - 0.1);
      updateVolumeIcons();
    }
  });

  // فلاتر التصنيفات
  categoriesContainer.addEventListener('click', (e) => {
    const pill = e.target.closest('.cat-pill');
    if (!pill) return;

    document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');

    currentCategory = pill.dataset.category;
    renderChannels();
  });

  // البحث الفوري
  channelSearchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    if (searchQuery.trim().length > 0) {
      clearSearchBtn.classList.remove('hidden');
    } else {
      clearSearchBtn.classList.add('hidden');
    }
    renderChannels();
  });

  clearSearchBtn.addEventListener('click', () => {
    channelSearchInput.value = '';
    searchQuery = '';
    clearSearchBtn.classList.add('hidden');
    renderChannels();
    channelSearchInput.focus();
  });

  if (toggleSidebarBtn) {
    toggleSidebarBtn.addEventListener('click', () => {
      channelsSidebar.classList.toggle('open');
    });
  }

  // ==========================================================================
  // بدء تشغيل النظام
  // ==========================================================================
  function initApp() {
    renderChannels();

    // تشغيل أول قناة افتراضية (قناة MAC Portal TS المباشرة)
    if (CHANNELS_DATA.length > 0) {
      playChannel(CHANNELS_DATA[0]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();
