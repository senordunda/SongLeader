/* ==========================================================================
   Praise for the Lord — Stage 4 Complete Application Logic
   - Hymnal Search, Quick Topics (Inv / LS), Favorites, Custom Tags, With Scans
   - "Don't Sing" Flag + Reason, Personal Notes, 901+ Supplement Toggle
   - Worship Setlist Planner, Key Progression Strip, & Sunday Podium Runner Mode
   - Singing History Log & Automatic "Last Sung" Recency Indicators
   - Top-Center Anchored Zoom (50%–250%), Drag Pan, Fullscreen, Treble Pitch Pipe
   - Complete LocalStorage Persistence + One-Tap JSON Backup / Restore
   ========================================================================== */

(() => {
  "use strict";

  const STORAGE_KEYS = {
    TRANSPOSITIONS: "pftl_transpositions_v1",
    SHOW_SUPPLEMENT: "pftl_show_supplement_v1",
    FAVORITES: "pftl_favorites_v1",
    CUSTOM_TAGS: "pftl_custom_tags_v1",
    DONT_SING: "pftl_dont_sing_v1",
    NOTES: "pftl_notes_v1",
    SETLISTS: "pftl_setlists_v1",
    HISTORY: "pftl_history_v1",
    DARK_MODE: "pftl_dark_mode_v1",
    BIBLE_VERSION: "pftl_bible_version_v1",
    READABILITY: "pftl_readability_v1",
    PRIMARY_HYMNAL: "pftl_primary_hymnal_v1",
    MULTI_BOOK: "pftl_multi_book_v1",
    ENABLED_HYMNALS: "pftl_enabled_hymnals_v1",
    MANUAL_KEYS: "pftl_manual_keys_v1",
    START_NOTES: "pftl_start_notes_v1",
    START_NOTE_DISPLAY: "pftl_start_note_display_v1",
    WAKE_LOCK: "pftl_wake_lock_v1",
    ONBOARDED: "pftl_onboarded_v1",
    WORSHIP_ELEMENTS_ENABLED: "pftl_worship_elements_v1",
    CUSTOM_SONG_ROLES: "pftl_custom_song_roles_v1",
    HIDDEN_DEFAULT_ROLES: "pftl_hidden_default_roles_v1",
  };

  const START_NOTE_DEFS = {
    "low-5": { label: "Sol,", numLabel: "5,", majorOffset: -5, minorOffset: -5 },
    "low-6": { label: "La,",  numLabel: "6,", majorOffset: -3, minorOffset: -4 },
    "low-7": { label: "Ti,",  numLabel: "7,", majorOffset: -1, minorOffset: -2 },
    "1":     { label: "Do",   numLabel: "1",  majorOffset: 0,  minorOffset: 0 },
    "2":     { label: "Re",   numLabel: "2",  majorOffset: 2,  minorOffset: 2 },
    "3":     { label: "Mi",   numLabel: "3",  majorOffset: 4,  minorOffset: 3 },
    "4":     { label: "Fa",   numLabel: "4",  majorOffset: 5,  minorOffset: 5 },
    "5":     { label: "Sol",  numLabel: "5",  majorOffset: 7,  minorOffset: 7 },
    "6":     { label: "La",   numLabel: "6",  majorOffset: 9,  minorOffset: 8 },
    "7":     { label: "Ti",   numLabel: "7",  majorOffset: 11, minorOffset: 10 },
    "8":     { label: "Do'",  numLabel: "8",  majorOffset: 12, minorOffset: 12 },
  };

  const BIBLE_BOOK_ORDER = [
    "Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth",
    "1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra","Nehemiah","Esther",
    "Job","Psalm","Psalms","Proverbs","Ecclesiastes","Song of Solomon",
    "Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah","Jonah",
    "Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi",
    "Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians","Galatians",
    "Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy",
    "Titus","Philemon","Hebrews","James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation"
  ];

  const HYMNALS = {
    pftl: { id: "pftl", code: "PFTL", name: "Praise for the Lord", file: "./pftl_hymns.json", hasSupplement: true },
    sfp:  { id: "sfp",  code: "SFP",  name: "Songs of Faith and Praise", file: "./sfp_hymns.json", hasSupplement: false },
    hfw:  { id: "hfw",  code: "HFW",  name: "Hymns for Worship", file: "./hfw_hymns.json", hasSupplement: false },
    ss:   { id: "ss",   code: "SS",   name: "Sacred Selections", file: "./ss_hymns.json", hasSupplement: false },
    phss: { id: "phss", code: "PHSS", name: "Psalms, Hymns, and Spiritual Songs", file: "./phss_hymns.json", hasSupplement: false },
    sotc: { id: "sotc", code: "SOTC", name: "Songs of the Church", file: "./sotc_hymns.json", hasSupplement: false },
  };
  const HYMNAL_ORDER = ["pftl", "sfp", "hfw", "ss", "phss", "sotc"];

  const SERVICE_SLOTS = [
    "Opening",
    "Song 2",
    "Song 3",
    "Lord's Supper",
    "Offering",
    "Before Sermon",
    "Invitation",
    "Closing",
    "Other",
  ];

  const WORSHIP_ELEMENTS = [
    "Announcements",
    "Prayer",
    "Scripture",
    "Lesson",
    "Lord's Supper",
    "Offering",
    "Other",
  ];

  const MAX_CUSTOM_ROLES = 6;

  const TREBLE_OCTAVE = 4;
  const ZOOM_STOPS = [0.5, 0.65, 0.8, 1.0, 1.15, 1.3, 1.45, 1.6, 1.75, 1.9, 2.05, 2.2, 2.35, 2.5];

  const QUICK_CATEGORIES = {
    invitation: {
      label: "Invitation",
      topics: ["gospel", "invitation"],
    },
    "lords-supper": {
      label: "Lord's Supper",
      topics: ["jesus:death", "lord's supper:remembrance", "lord's supper:observance"],
    },
  };

  const NOTE_TO_SEMITONE = {
    C: 0, "B#": 0,
    "C#": 1, Db: 1, "D♭": 1,
    D: 2,
    "D#": 3, Eb: 3, "E♭": 3,
    E: 4, Fb: 4, "F♭": 4,
    F: 5, "E#": 5,
    "F#": 6, Gb: 6, "G♭": 6,
    G: 7,
    "G#": 8, Ab: 8, "A♭": 8,
    A: 9,
    "A#": 10, Bb: 10, "B♭": 10,
    B: 11, Cb: 11, "C♭": 11,
  };

  const SEMITONE_TO_NAME = [
    "C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"
  ];

  const BIBLE_TRANSLATIONS = {
    // Inline via bible-api.com (public domain, CORS enabled, no API key)
    KJV:  { label: "King James Version",        mode: "inline", apiId: "kjv", versionId: 1 },
    ASV:  { label: "American Standard Version", mode: "inline", apiId: "asv", versionId: 12 },

    // External clean links via Bible.com (YouVersion)
    NKJV: { label: "New King James Version",      mode: "link", versionId: 114 },
    ESV:  { label: "English Standard Version",    mode: "link", versionId: 59 },
    NASB: { label: "New American Standard Bible", mode: "link", versionId: 100 },
  };

  const USFM_BOOKS = {
    genesis: "GEN", gen: "GEN", ge: "GEN",
    exodus: "EXO", exod: "EXO", ex: "EXO",
    leviticus: "LEV", lev: "LEV", le: "LEV",
    numbers: "NUM", num: "NUM", nu: "NUM",
    deuteronomy: "DEU", deut: "DEU", dt: "DEU",
    joshua: "JOS", josh: "JOS",
    judges: "JDG", judg: "JDG", jdg: "JDG",
    ruth: "RUT",
    "1 samuel": "1SA", "1 sam": "1SA", "1sa": "1SA",
    "2 samuel": "2SA", "2 sam": "2SA", "2sa": "2SA",
    "1 kings": "1KI", "1 kgs": "1KI", "1ki": "1KI",
    "2 kings": "2KI", "2 kgs": "2KI", "2ki": "2KI",
    "1 chronicles": "1CH", "1 chron": "1CH", "1 chr": "1CH", "1ch": "1CH",
    "2 chronicles": "2CH", "2 chron": "2CH", "2 chr": "2CH", "2ch": "2CH",
    ezra: "EZR", nehemiah: "NEH", neh: "NEH", esther: "EST", est: "EST", job: "JOB",
    psalms: "PSA", psalm: "PSA", ps: "PSA", psa: "PSA",
    proverbs: "PRO", prov: "PRO", pr: "PRO",
    ecclesiastes: "ECC", eccl: "ECC", ecc: "ECC",
    "song of solomon": "SNG", "song of songs": "SNG", song: "SNG", sos: "SNG",
    isaiah: "ISA", isa: "ISA", jeremiah: "JER", jer: "JER",
    lamentations: "LAM", lam: "LAM", ezekiel: "EZK", ezek: "EZK", eze: "EZK",
    daniel: "DAN", dan: "DAN", hosea: "HOS", hos: "HOS", joel: "JOL",
    amos: "AMO", obadiah: "OBA", obad: "OBA", jonah: "JON", micah: "MIC", mic: "MIC",
    nahum: "NAM", nah: "NAM", habakkuk: "HAB", hab: "HAB",
    zephaniah: "ZEP", zeph: "ZEP", haggai: "HAG", hag: "HAG",
    zechariah: "ZEC", zech: "ZEC", malachi: "MAL", mal: "MAL",
    matthew: "MAT", matt: "MAT", mt: "MAT", mark: "MRK", mk: "MRK",
    luke: "LUK", lk: "LUK", john: "JHN", jn: "JHN", acts: "ACT",
    romans: "ROM", rom: "ROM",
    "1 corinthians": "1CO", "1 cor": "1CO", "1co": "1CO",
    "2 corinthians": "2CO", "2 cor": "2CO", "2co": "2CO",
    galatians: "GAL", gal: "GAL", ephesians: "EPH", eph: "EPH",
    philippians: "PHP", phil: "PHP", php: "PHP", colossians: "COL", col: "COL",
    "1 thessalonians": "1TH", "1 thess": "1TH", "1th": "1TH",
    "2 thessalonians": "2TH", "2 thess": "2TH", "2th": "2TH",
    "1 timothy": "1TI", "1 tim": "1TI", "1ti": "1TI",
    "2 timothy": "2TI", "2 tim": "2TI", "2ti": "2TI",
    titus: "TIT", philemon: "PHM", phlm: "PHM",
    hebrews: "HEB", heb: "HEB", james: "JAS", jas: "JAS",
    "1 peter": "1PE", "1 pet": "1PE", "1pe": "1PE",
    "2 peter": "2PE", "2 pet": "2PE", "2pe": "2PE",
    "1 john": "1JN", "1 jn": "1JN", "1jn": "1JN",
    "2 john": "2JN", "2 jn": "2JN", "2jn": "2JN",
    "3 john": "3JN", "3 jn": "3JN", "3jn": "3JN",
    jude: "JUD", revelation: "REV", rev: "REV",
  };

  const scriptureCache = new Map();

  // =========================================================================
  // Web Audio Pitch Pipe Engine (Treble Range, Sustained Hold + 1-3-5-1 Arpeggio)
  // =========================================================================
  class PitchPipe {
    constructor() {
      this.ctx = null;
      this.activeNodes = null;
      this.arpTimers = [];
    }

    ensureContext() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      return this.ctx;
    }

    midiToFreq(midi) {
      return 440 * Math.pow(2, (midi - 69) / 12);
    }

    semitoneToMidi(semitone) {
      return (TREBLE_OCTAVE + 1) * 12 + ((semitone % 12) + 12) % 12;
    }

    createVoice(ctx, freq, startTime, peakGain = 0.24) {
      const masterGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1450, startTime);

      const osc1 = ctx.createOscillator();
      osc1.type = "triangle";
      osc1.frequency.setValueAtTime(freq, startTime);

      const osc2 = ctx.createOscillator();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(freq * 2, startTime);

      const osc2Gain = ctx.createGain();
      osc2Gain.gain.setValueAtTime(0.18, startTime);

      masterGain.gain.setValueAtTime(0.0001, startTime);
      masterGain.gain.linearRampToValueAtTime(peakGain, startTime + 0.035);

      osc1.connect(filter);
      osc2.connect(osc2Gain);
      osc2Gain.connect(filter);
      filter.connect(masterGain);
      masterGain.connect(ctx.destination);

      osc1.start(startTime);
      osc2.start(startTime);

      return { osc1, osc2, masterGain };
    }

    startSustained(semitone) {
      this.stopSustained();
      this.stopArpeggio();

      const ctx = this.ensureContext();
      const now = ctx.currentTime;
      const freq = this.midiToFreq(this.semitoneToMidi(semitone));
      this.activeNodes = this.createVoice(ctx, freq, now, 0.26);
    }

    stopSustained() {
      if (!this.activeNodes || !this.ctx) return;
      const { osc1, osc2, masterGain } = this.activeNodes;
      this.activeNodes = null;

      const now = this.ctx.currentTime;
      try {
        masterGain.gain.cancelScheduledValues(now);
        masterGain.gain.setValueAtTime(Math.max(masterGain.gain.value, 0.0001), now);
        masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.08);
        osc1.stop(now + 0.09);
        osc2.stop(now + 0.09);
      } catch (_) {}
    }

    stopArpeggio() {
      this.arpTimers.forEach((id) => clearTimeout(id));
      this.arpTimers = [];
    }

    playArpeggio(semitone, isMinor, onFinish) {
      this.stopSustained();
      this.stopArpeggio();

      const ctx = this.ensureContext();
      const baseMidi = this.semitoneToMidi(semitone);
      const intervals = isMinor ? [0, 3, 7, 12] : [0, 4, 7, 12];
      const stepSec = 0.30;
      const now = ctx.currentTime + 0.02;

      intervals.forEach((offset, idx) => {
        const noteStart = now + idx * stepSec;
        const noteDur = idx === intervals.length - 1 ? 0.65 : 0.34;
        const freq = this.midiToFreq(baseMidi + offset);
        const { osc1, osc2, masterGain } = this.createVoice(ctx, freq, noteStart, 0.22);

        masterGain.gain.setValueAtTime(0.22, noteStart + noteDur - 0.08);
        masterGain.gain.linearRampToValueAtTime(0.0001, noteStart + noteDur);
        osc1.stop(noteStart + noteDur + 0.02);
        osc2.stop(noteStart + noteDur + 0.02);
      });

      const totalMs = Math.ceil((intervals.length - 1) * stepSec * 1000 + 680);
      const timerId = setTimeout(() => {
        if (typeof onFinish === "function") onFinish();
      }, totalMs);
      this.arpTimers.push(timerId);
    }

    playStartNote(semitone, offsetSemitones, onFinish) {
      this.stopSustained();
      this.stopArpeggio();

      const ctx = this.ensureContext();
      const baseMidi = this.semitoneToMidi(semitone);
      const now = ctx.currentTime + 0.02;

      // Brief tonic reference (0.36s), then sustained starting melody note (0.85s)
      const tonicDur = 0.36;
      const startNoteBegin = now + 0.40;
      const startNoteDur = 0.85;

      const v1 = this.createVoice(ctx, this.midiToFreq(baseMidi), now, 0.21);
      v1.masterGain.gain.setValueAtTime(0.21, now + tonicDur - 0.06);
      v1.masterGain.gain.linearRampToValueAtTime(0.0001, now + tonicDur);
      v1.osc1.stop(now + tonicDur + 0.02);
      v1.osc2.stop(now + tonicDur + 0.02);

      const v2 = this.createVoice(ctx, this.midiToFreq(baseMidi + offsetSemitones), startNoteBegin, 0.25);
      v2.masterGain.gain.setValueAtTime(0.25, startNoteBegin + startNoteDur - 0.08);
      v2.masterGain.gain.linearRampToValueAtTime(0.0001, startNoteBegin + startNoteDur);
      v2.osc1.stop(startNoteBegin + startNoteDur + 0.02);
      v2.osc2.stop(startNoteBegin + startNoteDur + 0.02);

      const timerId = setTimeout(() => {
        if (typeof onFinish === "function") onFinish();
      }, 1300);
      this.arpTimers.push(timerId);
    }
  }

  // =========================================================================
  // Application State
  // =========================================================================
  const pitchPipe = new PitchPipe();

  const state = {
    bookCache: new Map(), // bookId -> prepared hymn array
    hymns: [],            // active books' hymns
    hymnMap: new Map(),   // all loaded hymns by id (including background-loaded for Setlists/History)
    primaryHymnal: HYMNALS[localStorage.getItem(STORAGE_KEYS.PRIMARY_HYMNAL)] ? localStorage.getItem(STORAGE_KEYS.PRIMARY_HYMNAL) : "pftl",
    multiBookMode: localStorage.getItem(STORAGE_KEYS.MULTI_BOOK) === "true",
    enabledHymnals: loadJSON(STORAGE_KEYS.ENABLED_HYMNALS, ["pftl"]),
    activeBookFilter: "all",
    searchQuery: "",
    topicCategory: "all",
    onlyFavorites: false,
    onlyWithScans: false,
    activeCustomTag: "",
    activeTopicBrowse: "",
    activeBibleBook: "",
    activeRotationFilter: "", // "", "due90", "due60", "never"
    browseTab: "topics",
    showSupplement: localStorage.getItem(STORAGE_KEYS.SHOW_SUPPLEMENT) === "true",
    darkMode: localStorage.getItem(STORAGE_KEYS.DARK_MODE) === "true",
    keepAwake: localStorage.getItem(STORAGE_KEYS.WAKE_LOCK) !== "false",
    wakeLockSentinel: null,
    bibleVersion: normalizeBibleVersion(localStorage.getItem(STORAGE_KEYS.BIBLE_VERSION) || "KJV"),
    readability: localStorage.getItem(STORAGE_KEYS.READABILITY) === "large" ? "large" : "small",
    startNoteDisplay: localStorage.getItem(STORAGE_KEYS.START_NOTE_DISPLAY) === "numbers" ? "numbers" : "solfege",
    activeTab: "hymnal",
    selectedId: null,

    // Persisted user data
    transpositions: loadJSON(STORAGE_KEYS.TRANSPOSITIONS, {}),
    manualKeys: loadJSON(STORAGE_KEYS.MANUAL_KEYS, {}),
    startNotes: loadJSON(STORAGE_KEYS.START_NOTES, {}),
    favorites: new Set(loadJSON(STORAGE_KEYS.FAVORITES, [])),
    customTags: loadJSON(STORAGE_KEYS.CUSTOM_TAGS, {}),
    dontSing: loadJSON(STORAGE_KEYS.DONT_SING, {}),
    notes: loadJSON(STORAGE_KEYS.NOTES, {}),
    setlists: loadJSON(STORAGE_KEYS.SETLISTS, []),
    history: loadJSON(STORAGE_KEYS.HISTORY, []),

    // Derived history index: { [hymnId]: string (YYYY-MM-DD latest) }
    lastSungMap: new Map(),

    // Setlist UI state
    activeSetlistId: null,
    setlistSettingsOpen: false,
    editingCustomRoleIndex: -1,
    worshipElementsEnabled: localStorage.getItem(STORAGE_KEYS.WORSHIP_ELEMENTS_ENABLED) === "true",
    customSongRoles: loadJSON(STORAGE_KEYS.CUSTOM_SONG_ROLES, []).filter((r) => typeof r === "string" && r.trim()).slice(0, MAX_CUSTOM_ROLES),
    hiddenDefaultRoles: loadJSON(STORAGE_KEYS.HIDDEN_DEFAULT_ROLES, []).filter((r) => typeof r === "string"),
    runner: null, // { setlistId, index }
    pickerMode: "setlist", // 'setlist' | 'history'
    historyQuery: "",

    manualKey: "C Major",
    highResLoaded: false,
    cachedHighResUrls: new Set(),
    preloadedImages: new Map(),
    isPrecaching: false,
    zoomLevel: 1.0,
    fsZoomLevel: 1.0,
    isFullscreen: false,
  };

  // =========================================================================
  // DOM References
  // =========================================================================
  const el = {
    landingScreen: document.getElementById("landingScreen"),
    landingBookButtons: Array.from(document.querySelectorAll(".landing-book-btn")),
    brandTitle: document.getElementById("brandTitle"),
    searchInput: document.getElementById("searchInput"),
    bookFilterRow: document.getElementById("bookFilterRow"),
    bookFilterSelect: document.getElementById("bookFilterSelect"),
    clearSearchBtn: document.getElementById("clearSearchBtn"),
    topicTabs: Array.from(document.querySelectorAll(".filter-tab")),
    favFilterBtn: document.getElementById("favFilterBtn"),
    scansFilterBtn: document.getElementById("scansFilterBtn"),
    browseFiltersBtn: document.getElementById("browseFiltersBtn"),
    activeBrowseBar: document.getElementById("activeBrowseBar"),
    activeBrowseLabel: document.getElementById("activeBrowseLabel"),
    clearBrowseFilterBtn: document.getElementById("clearBrowseFilterBtn"),
    browseModal: document.getElementById("browseModal"),
    closeBrowseModalBtn: document.getElementById("closeBrowseModalBtn"),
    browseTabs: Array.from(document.querySelectorAll(".browse-tab")),
    browseSearchWrap: document.getElementById("browseSearchWrap"),
    browseSearchInput: document.getElementById("browseSearchInput"),
    browseResultsList: document.getElementById("browseResultsList"),
    tagFilterRow: document.getElementById("tagFilterRow"),
    tagFilterSelect: document.getElementById("tagFilterSelect"),
    clearTagFilterBtn: document.getElementById("clearTagFilterBtn"),
    resultsSummary: document.getElementById("resultsSummary"),
    hymnList: document.getElementById("hymnList"),
    emptyState: document.getElementById("emptyState"),
    loadErrorBanner: document.getElementById("loadErrorBanner"),
    manualJsonInput: document.getElementById("manualJsonInput"),

    // Setlists tab
    setlistsHome: document.getElementById("setlistsHome"),
    setlistSettingsBtn: document.getElementById("setlistSettingsBtn"),
    newSetlistBtn: document.getElementById("newSetlistBtn"),
    setlistsList: document.getElementById("setlistsList"),
    setlistsEmpty: document.getElementById("setlistsEmpty"),
    setlistEditor: document.getElementById("setlistEditor"),
    backToSetlistsBtn: document.getElementById("backToSetlistsBtn"),
    copySetlistBtn: document.getElementById("copySetlistBtn"),
    startPodiumBtn: document.getElementById("startPodiumBtn"),
    setlistNameInput: document.getElementById("setlistNameInput"),
    setlistDateInput: document.getElementById("setlistDateInput"),
    setlistNotesInput: document.getElementById("setlistNotesInput"),
    keyProgressionBar: document.getElementById("keyProgressionBar"),
    keyProgressionItems: document.getElementById("keyProgressionItems"),
    setlistSongsList: document.getElementById("setlistSongsList"),
    setlistSongsEmpty: document.getElementById("setlistSongsEmpty"),
    setlistFooterActions: document.getElementById("setlistFooterActions"),
    addSongToSetlistBtn: document.getElementById("addSongToSetlistBtn"),
    addElementToSetlistBtn: document.getElementById("addElementToSetlistBtn"),
    precacheHighResBtn: document.getElementById("precacheHighResBtn"),
    logSetlistSungBtn: document.getElementById("logSetlistSungBtn"),
    setlistStatusMsg: document.getElementById("setlistStatusMsg"),
    deleteSetlistBtn: document.getElementById("deleteSetlistBtn"),
    setlistSettings: document.getElementById("setlistSettings"),
    backFromSetlistSettingsBtn: document.getElementById("backFromSetlistSettingsBtn"),
    enableWorshipElementsToggle: document.getElementById("enableWorshipElementsToggle"),
    customRolesCount: document.getElementById("customRolesCount"),
    addCustomRoleForm: document.getElementById("addCustomRoleForm"),
    newCustomRoleInput: document.getElementById("newCustomRoleInput"),
    addCustomRoleBtn: document.getElementById("addCustomRoleBtn"),
    customRoleError: document.getElementById("customRoleError"),
    customRolesList: document.getElementById("customRolesList"),
    defaultRolesToggleList: document.getElementById("defaultRolesToggleList"),

    // History tab
    logSongHistoryBtn: document.getElementById("logSongHistoryBtn"),
    historySearchInput: document.getElementById("historySearchInput"),
    historySummary: document.getElementById("historySummary"),
    historyList: document.getElementById("historyList"),
    historyEmpty: document.getElementById("historyEmpty"),

    // Settings & Backup
    primaryHymnalRow: document.getElementById("primaryHymnalRow"),
    primaryHymnalSelect: document.getElementById("primaryHymnalSelect"),
    multiBookToggle: document.getElementById("multiBookToggle"),
    multiBookList: document.getElementById("multiBookList"),
    multiBookCheckboxes: Array.from(document.querySelectorAll(".multibook-cb")),
    darkModeToggle: document.getElementById("darkModeToggle"),
    wakeLockToggle: document.getElementById("wakeLockToggle"),
    readabilitySelect: document.getElementById("readabilitySelect"),
    startNoteDisplaySelect: document.getElementById("startNoteDisplaySelect"),
    bibleVersionSelect: document.getElementById("bibleVersionSelect"),
    showSupplementRow: document.getElementById("showSupplementRow"),
    showSupplementToggle: document.getElementById("showSupplementToggle"),
    statFavCount: document.getElementById("statFavCount"),
    statTagCount: document.getElementById("statTagCount"),
    statDontSingCount: document.getElementById("statDontSingCount"),
    statSetlistsCount: document.getElementById("statSetlistsCount"),
    statHistoryCount: document.getElementById("statHistoryCount"),
    statNotesCount: document.getElementById("statNotesCount"),
    exportBackupBtn: document.getElementById("exportBackupBtn"),
    importBackupInput: document.getElementById("importBackupInput"),
    backupStatusMsg: document.getElementById("backupStatusMsg"),
    clearDataBtn: document.getElementById("clearDataBtn"),

    navItems: Array.from(document.querySelectorAll(".nav-item")),
    tabPanes: {
      hymnal: document.getElementById("view-hymnal"),
      setlists: document.getElementById("view-setlists"),
      history: document.getElementById("view-history"),
      settings: document.getElementById("view-settings"),
    },

    // Detail pane
    songDetailPane: document.getElementById("songDetailPane"),
    detailEmpty: document.getElementById("detailEmpty"),
    detailContent: document.getElementById("detailContent"),
    detailHeader: document.getElementById("detailHeader"),
    detailScroll: document.getElementById("detailScroll"),
    elementRunnerView: document.getElementById("elementRunnerView"),
    elementRunnerTitle: document.getElementById("elementRunnerTitle"),
    elementRunnerCue: document.getElementById("elementRunnerCue"),
    elementRunnerUpNext: document.getElementById("elementRunnerUpNext"),
    backToListBtn: document.getElementById("backToListBtn"),
    prevHymnBtn: document.getElementById("prevHymnBtn"),
    nextHymnBtn: document.getElementById("nextHymnBtn"),
    detailBookBadge: document.getElementById("detailBookBadge"),
    detailNumber: document.getElementById("detailNumber"),
    detailKeyBadge: document.getElementById("detailKeyBadge"),
    detailFavBtn: document.getElementById("detailFavBtn"),
    detailHymnaryLink: document.getElementById("detailHymnaryLink"),

    setlistRunnerBar: document.getElementById("setlistRunnerBar"),
    runnerPrevBtn: document.getElementById("runnerPrevBtn"),
    runnerSlotLabel: document.getElementById("runnerSlotLabel"),
    runnerPosLabel: document.getElementById("runnerPosLabel"),
    runnerNextBtn: document.getElementById("runnerNextBtn"),
    runnerCloseBtn: document.getElementById("runnerCloseBtn"),

    supplementBanner: document.getElementById("supplementBanner"),
    dontSingBanner: document.getElementById("dontSingBanner"),
    dontSingBannerReason: document.getElementById("dontSingBannerReason"),
    detailTitle: document.getElementById("detailTitle"),
    detailAltTitles: document.getElementById("detailAltTitles"),
    detailFirstLine: document.getElementById("detailFirstLine"),
    detailAddSetlistBtn: document.getElementById("detailAddSetlistBtn"),
    detailMarkSungBtn: document.getElementById("detailMarkSungBtn"),
    detailListenBtn: document.getElementById("detailListenBtn"),
    detailHymnStudyLink: document.getElementById("detailHymnStudyLink"),
    detailLastSungBadge: document.getElementById("detailLastSungBadge"),

    sheetSection: document.getElementById("sheetSection"),
    scanStatusLabel: document.getElementById("scanStatusLabel"),
    zoomOutBtn: document.getElementById("zoomOutBtn"),
    zoomResetBtn: document.getElementById("zoomResetBtn"),
    zoomInBtn: document.getElementById("zoomInBtn"),
    loadHighResBtn: document.getElementById("loadHighResBtn"),
    fullscreenBtn: document.getElementById("fullscreenBtn"),
    sheetViewport: document.getElementById("sheetViewport"),
    sheetPages: document.getElementById("sheetPages"),
    noScanFallback: document.getElementById("noScanFallback"),
    fallbackHymnaryBtn: document.getElementById("fallbackHymnaryBtn"),

    detailCustomTags: document.getElementById("detailCustomTags"),
    addTagForm: document.getElementById("addTagForm"),
    newTagInput: document.getElementById("newTagInput"),
    existingTagsList: document.getElementById("existingTagsList"),
    startNoteSelect: document.getElementById("startNoteSelect"),
    songNotesInput: document.getElementById("songNotesInput"),
    dontSingCheckbox: document.getElementById("dontSingCheckbox"),
    dontSingReasonInput: document.getElementById("dontSingReasonInput"),
    songHistoryGroup: document.getElementById("songHistoryGroup"),
    detailSongHistoryList: document.getElementById("detailSongHistoryList"),

    alsoInGroup: document.getElementById("alsoInGroup"),
    detailAlsoIn: document.getElementById("detailAlsoIn"),
    topicsGroup: document.getElementById("topicsGroup"),
    detailTopics: document.getElementById("detailTopics"),
    scripturesGroup: document.getElementById("scripturesGroup"),
    detailScriptures: document.getElementById("detailScriptures"),

    manualKeyWrap: document.getElementById("manualKeyWrap"),
    manualKeySelect: document.getElementById("manualKeySelect"),
    stepButtons: Array.from(document.querySelectorAll(".btn-step")),
    holdPitchBtn: document.getElementById("holdPitchBtn"),
    holdPitchKey: document.getElementById("holdPitchKey"),
    holdPitchSub: document.getElementById("holdPitchSub"),
    startNoteBtn: document.getElementById("startNoteBtn"),
    arpeggioBtn: document.getElementById("arpeggioBtn"),

    fsOverlay: document.getElementById("fullscreenOverlay"),
    fsPrevHymnBtn: document.getElementById("fsPrevHymnBtn"),
    fsNextHymnBtn: document.getElementById("fsNextHymnBtn"),
    fsBookBadge: document.getElementById("fsBookBadge"),
    fsNumber: document.getElementById("fsNumber"),
    fsTitle: document.getElementById("fsTitle"),
    fsHoldPitchBtn: document.getElementById("fsHoldPitchBtn"),
    fsPitchKey: document.getElementById("fsPitchKey"),
    fsPitchSub: document.getElementById("fsPitchSub"),
    fsStartNoteBtn: document.getElementById("fsStartNoteBtn"),
    fsArpBtn: document.getElementById("fsArpBtn"),
    fsZoomOutBtn: document.getElementById("fsZoomOutBtn"),
    fsZoomResetBtn: document.getElementById("fsZoomResetBtn"),
    fsZoomInBtn: document.getElementById("fsZoomInBtn"),
    fsHighResBtn: document.getElementById("fsHighResBtn"),
    fsCloseBtn: document.getElementById("fsCloseBtn"),
    fsViewport: document.getElementById("fsViewport"),
    fsPages: document.getElementById("fsPages"),

    // Modals
    quickJumpBtn: document.getElementById("quickJumpBtn"),
    quickJumpModal: document.getElementById("quickJumpModal"),
    closeQuickJumpBtn: document.getElementById("closeQuickJumpBtn"),
    cancelQuickJumpBtn: document.getElementById("cancelQuickJumpBtn"),
    quickJumpForm: document.getElementById("quickJumpForm"),
    quickJumpInput: document.getElementById("quickJumpInput"),
    quickJumpError: document.getElementById("quickJumpError"),
    quickJumpChoices: document.getElementById("quickJumpChoices"),

    addToSetlistModal: document.getElementById("addToSetlistModal"),
    closeAddToSetlistBtn: document.getElementById("closeAddToSetlistBtn"),
    cancelAddToSetlistBtn: document.getElementById("cancelAddToSetlistBtn"),
    addToSetlistForm: document.getElementById("addToSetlistForm"),
    addToSetlistSongLabel: document.getElementById("addToSetlistSongLabel"),
    targetSetlistSelect: document.getElementById("targetSetlistSelect"),
    inlineNewSetlistFields: document.getElementById("inlineNewSetlistFields"),
    inlineSetlistName: document.getElementById("inlineSetlistName"),
    inlineSetlistDate: document.getElementById("inlineSetlistDate"),
    targetSlotSelect: document.getElementById("targetSlotSelect"),

    songPickerModal: document.getElementById("songPickerModal"),
    songPickerTitle: document.getElementById("songPickerTitle"),
    closeSongPickerBtn: document.getElementById("closeSongPickerBtn"),
    songPickerInput: document.getElementById("songPickerInput"),
    pickerSlotRow: document.getElementById("pickerSlotRow"),
    pickerSlotSelect: document.getElementById("pickerSlotSelect"),
    songPickerResults: document.getElementById("songPickerResults"),

    markSungModal: document.getElementById("markSungModal"),
    closeMarkSungBtn: document.getElementById("closeMarkSungBtn"),
    cancelMarkSungBtn: document.getElementById("cancelMarkSungBtn"),
    markSungForm: document.getElementById("markSungForm"),
    markSungSongLabel: document.getElementById("markSungSongLabel"),
    markSungDateInput: document.getElementById("markSungDateInput"),
    markSungServiceInput: document.getElementById("markSungServiceInput"),
    scriptureModal: document.getElementById("scriptureModal"),
    scriptureModalTitle: document.getElementById("scriptureModalTitle"),
    scriptureModalVersion: document.getElementById("scriptureModalVersion"),
    closeScriptureModalBtn: document.getElementById("closeScriptureModalBtn"),
    doneScriptureModalBtn: document.getElementById("doneScriptureModalBtn"),
    scriptureModalBody: document.getElementById("scriptureModalBody"),
    scriptureModalExternalLink: document.getElementById("scriptureModalExternalLink"),
    elementPickerModal: document.getElementById("elementPickerModal"),
    closeElementPickerBtn: document.getElementById("closeElementPickerBtn"),
    elementPickerList: document.getElementById("elementPickerList"),
    listenModal: document.getElementById("listenModal"),
    listenModalTitle: document.getElementById("listenModalTitle"),
    closeListenModalBtn: document.getElementById("closeListenModalBtn"),
    listenVideoFrame: document.getElementById("listenVideoFrame"),
    appToast: document.getElementById("appToast"),
  };

  // =========================================================================
  // Helpers & Date Formatting
  // =========================================================================
  function normalizeBibleVersion(ver) {
    const v = String(ver || "KJV").trim().toUpperCase();
    if (v === "NASV") return "NASB";
    return Object.prototype.hasOwnProperty.call(BIBLE_TRANSLATIONS, v) ? v : "KJV";
  }

  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function saveJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (_) {}
  }

  function makeId(prefix = "id") {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  }

  function getTodayISO() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function getNextSundayISO() {
    const d = new Date();
    const diff = (7 - d.getDay()) % 7;
    d.setDate(d.getDate() + diff);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function parseISODateLocal(iso) {
    if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function formatDisplayDate(iso) {
    const dt = parseISODateLocal(iso);
    if (!dt) return iso || "";
    return dt.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }

  function formatRecency(iso) {
    const dt = parseISODateLocal(iso);
    if (!dt) return null;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.round((today - dt) / 86400000);

    if (diffDays < 0) return { text: `Scheduled ${dt.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`, recent: false };
    if (diffDays === 0) return { text: "Sung today", recent: true };
    if (diffDays === 1) return { text: "Sung yesterday", recent: true };
    if (diffDays < 7) return { text: `Sung ${diffDays}d ago`, recent: true };
    const wks = Math.floor(diffDays / 7);
    if (wks <= 6) return { text: `Sung ${wks} wk${wks === 1 ? "" : "s"} ago`, recent: wks <= 3 };
    return { text: `Sung ${dt.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`, recent: false };
  }

  function rebuildLastSungMap() {
    const map = new Map();
    for (const entry of state.history) {
      const id = String(entry.hymnId);
      const prev = map.get(id);
      if (!prev || (entry.date && entry.date > prev)) {
        map.set(id, entry.date);
      }
    }
    state.lastSungMap = map;
  }

  function normalizeTopicKey(str) {
    return (str || "")
      .toLowerCase()
      .replace(/[’'`]/g, "'")
      .replace(/\s*:\s*/g, ":")
      .replace(/\s+/g, " ")
      .trim();
  }

  function parseKeyString(keyStr) {
    if (!keyStr || !keyStr.trim()) return null;
    const cleaned = keyStr.trim();
    const match = cleaned.match(/^([A-Ga-g])([♭♯b#])?\s*(.*)$/);
    if (!match) return null;

    const rawLetter = match[1];
    const accidental = match[2] || "";
    const rest = (match[3] || "").toLowerCase();

    const noteKey = rawLetter.toUpperCase() + accidental.replace("♯", "#").replace("♭", "b");
    const semitone = NOTE_TO_SEMITONE[noteKey];
    if (semitone === undefined) return null;

    const isMinor =
      rest.includes("minor") ||
      (rawLetter === rawLetter.toLowerCase() && !rest.includes("major"));

    return {
      semitone,
      isMinor,
      displayNote: SEMITONE_TO_NAME[semitone],
    };
  }

  function formatKeyBadge(keyStr) {
    const parsed = parseKeyString(keyStr);
    if (!parsed) return "—";
    return parsed.isMinor ? `${parsed.displayNote} Min` : parsed.displayNote;
  }

  function getSongBaseKey(hymn) {
    if (!hymn) return "";
    if (hymn.key && hymn.key.trim()) return hymn.key.trim();
    const saved = state.manualKeys[hymn.id];
    return (typeof saved === "string" && saved.trim()) ? saved.trim() : "";
  }

  function bookHasAnyScans(bookId) {
    const list = state.bookCache.get(bookId);
    if (!Array.isArray(list) || list.length === 0) return false;
    return list.some((h) => h.has_scan);
  }

  function getEffectiveKeyForHymn(hymn) {
    if (!hymn) return "—";
    const baseKey = getSongBaseKey(hymn);
    const parsed = parseKeyString(baseKey);
    if (!parsed) return "—";
    const shift = state.transpositions[hymn.id] || 0;
    const semitone = ((parsed.semitone + shift) % 12 + 12) % 12;
    const name = SEMITONE_TO_NAME[semitone];
    return parsed.isMinor ? `${name} Min` : name;
  }

  function isSupplement(hymn) {
    return hymn && hymn.bookId === "pftl" && typeof hymn.number === "number" && hymn.number > 900;
  }

  function getActiveBookIds() {
    if (!state.multiBookMode) {
      return [state.primaryHymnal];
    }
    const valid = (Array.isArray(state.enabledHymnals) ? state.enabledHymnals : []).filter((id) => Boolean(HYMNALS[id]));
    return valid.length > 0 ? valid : [state.primaryHymnal];
  }

  function isMultiBookActive() {
    return state.multiBookMode && getActiveBookIds().length > 1;
  }

  function getBookIdFromHymnId(hymnId) {
    const s = String(hymnId || "");
    const colonIdx = s.indexOf(":");
    if (colonIdx > 0) {
      const prefix = s.slice(0, colonIdx).toLowerCase();
      if (HYMNALS[prefix]) return prefix;
    }
    return "pftl";
  }

  function shouldShowBookBadgeForHymn(hymn) {
    if (!hymn) return false;
    if (isMultiBookActive()) return true;
    return hymn.bookId !== state.primaryHymnal;
  }

  function updateHymnalSettingsUI() {
    const activeIds = getActiveBookIds();
    const multi = isMultiBookActive();

    if (el.primaryHymnalSelect) el.primaryHymnalSelect.value = state.primaryHymnal;
    if (el.primaryHymnalRow) el.primaryHymnalRow.classList.toggle("hidden", state.multiBookMode);
    if (el.multiBookToggle) el.multiBookToggle.checked = state.multiBookMode;
    if (el.multiBookList) el.multiBookList.classList.toggle("hidden", !state.multiBookMode);

    el.multiBookCheckboxes.forEach((cb) => {
      cb.checked = activeIds.includes(cb.value);
    });

    // Show 901+ Supplement toggle only when PFTL is active
    if (el.showSupplementRow) {
      el.showSupplementRow.classList.toggle("hidden", !activeIds.includes("pftl"));
    }

    // Update top header title
    if (el.brandTitle) {
      if (multi) {
        el.brandTitle.textContent = "SongLeader";
      } else {
        const b = HYMNALS[activeIds[0]] || HYMNALS.pftl;
        el.brandTitle.textContent = b.name;
      }
      requestAnimationFrame(fitBrandTitle);
    }
    document.title = multi ? "SongLeader" : `${(HYMNALS[activeIds[0]] || HYMNALS.pftl).name} — SongLeader`;

    // Update Book Filter dropdown on home screen
    if (multi) {
      el.bookFilterRow.classList.remove("hidden");
      const prev = state.activeBookFilter;
      el.bookFilterSelect.innerHTML = '<option value="all">All Enabled Books</option>';
      activeIds.forEach((id) => {
        const b = HYMNALS[id];
        const opt = document.createElement("option");
        opt.value = id;
        opt.textContent = `${b.code} — ${b.name}`;
        el.bookFilterSelect.appendChild(opt);
      });
      state.activeBookFilter = (prev !== "all" && activeIds.includes(prev)) ? prev : "all";
      el.bookFilterSelect.value = state.activeBookFilter;
    } else {
      state.activeBookFilter = "all";
      el.bookFilterRow.classList.add("hidden");
    }
  }

  function normalizeForSearch(str) {
    return (str || "")
      .toLowerCase()
      .replace(/[’'`]/g, "'")
      .replace(/[^\w\s']/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function getAllUniqueCustomTags() {
    const set = new Set();
    Object.values(state.customTags).forEach((arr) => {
      if (Array.isArray(arr)) {
        arr.forEach((t) => {
          if (t && t.trim()) set.add(t.trim());
        });
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }

  function refreshTagSelectorsAndStats() {
    const allTags = getAllUniqueCustomTags();

    el.existingTagsList.innerHTML = "";
    allTags.forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t;
      el.existingTagsList.appendChild(opt);
    });

    if (allTags.length > 0) {
      el.tagFilterRow.classList.remove("hidden");
      const currentVal = state.activeCustomTag;
      el.tagFilterSelect.innerHTML = '<option value="">All Custom Tags</option>';
      allTags.forEach((t) => {
        const opt = document.createElement("option");
        opt.value = t;
        opt.textContent = t;
        el.tagFilterSelect.appendChild(opt);
      });
      if (currentVal && allTags.includes(currentVal)) {
        el.tagFilterSelect.value = currentVal;
      } else {
        state.activeCustomTag = "";
        el.tagFilterSelect.value = "";
      }
      el.clearTagFilterBtn.classList.toggle("hidden", !state.activeCustomTag);
    } else {
      state.activeCustomTag = "";
      el.tagFilterRow.classList.add("hidden");
    }

    el.statFavCount.textContent = String(state.favorites.size);
    el.statTagCount.textContent = String(allTags.length);
    el.statDontSingCount.textContent = String(Object.keys(state.dontSing).length);
    el.statSetlistsCount.textContent = String(state.setlists.length);
    el.statHistoryCount.textContent = String(state.history.length);
    el.statNotesCount.textContent = String(
      Object.values(state.notes).filter((n) => n && n.trim()).length
    );
  }

  function applyTheme() {
    document.documentElement.setAttribute("data-theme", state.darkMode ? "dark" : "light");
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute("content", state.darkMode ? "#5E1722" : "#7A1F2B");
    }
    if (el.darkModeToggle) {
      el.darkModeToggle.checked = state.darkMode;
    }
  }

  async function syncWakeLock() {
    const shouldHold = state.keepAwake && (Boolean(state.runner) || state.isFullscreen);
    if (!("wakeLock" in navigator)) return;

    if (shouldHold && document.visibilityState === "visible") {
      if (!state.wakeLockSentinel) {
        try {
          state.wakeLockSentinel = await navigator.wakeLock.request("screen");
          state.wakeLockSentinel.addEventListener("release", () => {
            state.wakeLockSentinel = null;
          });
        } catch (_) {}
      }
    } else if (!shouldHold && state.wakeLockSentinel) {
      try {
        await state.wakeLockSentinel.release();
      } catch (_) {}
      state.wakeLockSentinel = null;
    }
  }

  function extractBibleBook(ref) {
    const m = String(ref || "").trim().match(/^([1-3]?\s*[a-zA-Z.\s]+?)\s+\d/);
    if (!m) return "";
    let bk = m[1].replace(/\./g, "").replace(/\s+/g, " ").trim();
    if (/^psalm$/i.test(bk)) bk = "Psalms";
    return bk;
  }

  function daysSinceISO(iso) {
    const dt = parseISODateLocal(iso);
    if (!dt) return Infinity;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.round((today - dt) / 86400000);
  }

  function fitBrandTitle() {
    const titleEl = el.brandTitle;
    if (!titleEl) return;
    // Reset any previous inline override so we start from the natural CSS size
    titleEl.style.fontSize = "";
    const available = titleEl.clientWidth;
    if (available <= 0) return;

    let sizePx = parseFloat(window.getComputedStyle(titleEl).fontSize) || 21;
    const minPx = 14;
    while (titleEl.scrollWidth > titleEl.clientWidth + 1 && sizePx > minPx) {
      sizePx -= 0.5;
      titleEl.style.fontSize = `${sizePx}px`;
    }
  }

  function applyReadability() {
    document.documentElement.setAttribute("data-readability", state.readability === "large" ? "large" : "small");
    if (el.readabilitySelect) {
      el.readabilitySelect.value = state.readability;
    }
    requestAnimationFrame(fitBrandTitle);
  }

  function getBrowsableHymns() {
    return state.showSupplement ? state.hymns : state.hymns.filter((h) => !isSupplement(h));
  }

  function updateHymnNavButtons() {
    if (!state.selectedId) return;
    const list = getBrowsableHymns();
    const idx = list.findIndex((h) => h.id === state.selectedId);
    const hasPrev = idx > 0;
    const hasNext = idx >= 0 && idx < list.length - 1;

    if (el.prevHymnBtn) el.prevHymnBtn.disabled = !hasPrev;
    if (el.nextHymnBtn) el.nextHymnBtn.disabled = !hasNext;
    if (el.fsPrevHymnBtn) el.fsPrevHymnBtn.disabled = !hasPrev;
    if (el.fsNextHymnBtn) el.fsNextHymnBtn.disabled = !hasNext;
  }

  function navigateHymnByOffset(delta) {
    if (!state.selectedId) return;
    const list = getBrowsableHymns();
    const idx = list.findIndex((h) => h.id === state.selectedId);
    if (idx < 0) return;
    const target = list[idx + delta];
    if (!target) return;

    const wasFs = state.isFullscreen;
    openSong(target.id);
    if (wasFs) {
      if (target.has_scan) {
        openFullscreen();
      } else {
        closeFullscreen();
      }
    }
  }

  function buildBibleComUrl(scriptureRef, versionKey = state.bibleVersion) {
    const ref = String(scriptureRef || "").trim();
    const ver = normalizeBibleVersion(versionKey);
    const cfg = BIBLE_TRANSLATIONS[ver] || BIBLE_TRANSLATIONS.KJV;
    const match = ref.match(/^([1-3]?\s*[a-zA-Z.\s]+?)\s+(\d+)(?::([\d\-,\s]+))?$/);
    if (!match) {
      return `https://www.bible.com/search/bible?q=${encodeURIComponent(ref)}`;
    }

    const bookKey = match[1].toLowerCase().replace(/\./g, "").replace(/\s+/g, " ").trim();
    const bookCode = USFM_BOOKS[bookKey];
    const chapter = match[2];
    const verses = match[3] ? `.${match[3].replace(/\s+/g, "")}` : "";

    if (!bookCode) {
      return `https://www.bible.com/search/bible?q=${encodeURIComponent(ref)}`;
    }
    return `https://www.bible.com/bible/${cfg.versionId}/${bookCode}.${chapter}${verses}.${ver}`;
  }

  function extractYouTubeId(url) {
    if (!url) return "";
    const m = String(url).match(/(?:[?&]v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
    return m ? m[1] : "";
  }

  function openListenModal(hymn) {
    if (!hymn || !hymn.youtube_url || !el.listenModal) return;
    const vid = extractYouTubeId(hymn.youtube_url);
    if (!vid) {
      window.open(hymn.youtube_url, "_blank", "noopener,noreferrer");
      return;
    }
    pitchPipe.stopSustained();
    pitchPipe.stopArpeggio();
    el.listenModalTitle.textContent = `#${hymn.number_str} · ${hymn.title}`;
    el.listenVideoFrame.src = `https://www.youtube-nocookie.com/embed/${vid}?rel=0`;
    el.listenModal.classList.remove("hidden");
  }

  function closeListenModal() {
    if (!el.listenModal) return;
    el.listenModal.classList.add("hidden");
    if (el.listenVideoFrame) el.listenVideoFrame.src = "";
  }

  function closeScriptureModal() {
    if (el.scriptureModal) el.scriptureModal.classList.add("hidden");
  }

  function renderScripturePayload(payload) {
    el.scriptureModalTitle.textContent = payload.reference;
    el.scriptureModalVersion.textContent = payload.translation;
    el.scriptureModalBody.innerHTML = "";

    const p = document.createElement("p");
    p.className = "scripture-verse-text";

    if (Array.isArray(payload.verses) && payload.verses.length > 0) {
      payload.verses.forEach((v, idx) => {
        if (idx > 0) p.appendChild(document.createTextNode(" "));
        const num = document.createElement("span");
        num.className = "scripture-verse-num";
        num.textContent = String(v.verse);
        p.appendChild(num);
        const clean = String(v.text || "").replace(/\n+/g, " ").replace(/\s{2,}/g, " ").trim();
        p.appendChild(document.createTextNode(clean));
      });
    } else {
      p.textContent = payload.text || "";
    }

    el.scriptureModalBody.appendChild(p);
  }

  async function openScriptureInline(scriptureRef, versionKey) {
    const ver = normalizeBibleVersion(versionKey);
    const cfg = BIBLE_TRANSLATIONS[ver];
    const fallbackUrl = buildBibleComUrl(scriptureRef, ver);

    if (!cfg || cfg.mode !== "inline") {
      window.open(fallbackUrl, "_blank", "noopener,noreferrer");
      return;
    }

    el.scriptureModalTitle.textContent = scriptureRef;
    el.scriptureModalVersion.textContent = cfg.label;
    el.scriptureModalExternalLink.href = fallbackUrl;
    el.scriptureModalBody.innerHTML = '<p class="scripture-loading">Loading passage…</p>';
    el.scriptureModal.classList.remove("hidden");

    const cacheKey = `${cfg.apiId}:${String(scriptureRef).trim().toLowerCase()}`;
    if (scriptureCache.has(cacheKey)) {
      renderScripturePayload(scriptureCache.get(cacheKey));
      return;
    }

    try {
      const apiUrl = `https://bible-api.com/${encodeURIComponent(scriptureRef)}?translation=${cfg.apiId}`;
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error("Passage not found");
      const data = await res.json();

      const payload = {
        reference: data.reference || scriptureRef,
        translation: data.translation_name || cfg.label,
        verses: Array.isArray(data.verses) ? data.verses : [],
        text: String(data.text || "").replace(/\n+/g, " ").replace(/\s{2,}/g, " ").trim(),
      };
      scriptureCache.set(cacheKey, payload);
      renderScripturePayload(payload);
    } catch (_) {
      el.scriptureModalBody.innerHTML =
        '<p class="scripture-error">Could not load this passage inline. Use the link below to read it on Bible.com.</p>';
    }
  }

  function updateHeaderSubtitle() {
    // Header subtitle removed for a cleaner, larger title
  }

  function prepareBookData(bookId, rawList) {
    const bookMeta = HYMNALS[bookId] || HYMNALS.pftl;
    const cleaned = rawList.map((h) => {
      const num = typeof h.number === "number" ? h.number : parseInt(h.number_str || h.id, 10) || null;
      const numStr = String(h.number_str || num || h.id);
      const id = bookId === "pftl" ? String(h.id || numStr) : (String(h.id || "").includes(":") ? String(h.id) : `${bookId}:${numStr}`);
      const altTitles = Array.isArray(h.alt_titles) ? h.alt_titles : [];
      const topics = Array.isArray(h.topics) ? h.topics : [];
      const scriptures = Array.isArray(h.scriptures) ? h.scriptures : [];
      const scanUrls = Array.isArray(h.scan_urls) ? h.scan_urls : [];

      return {
        ...h,
        id,
        bookId,
        bookCode: bookMeta.code,
        bookName: bookMeta.name,
        number: num,
        number_str: numStr,
        title: h.title || h.first_line || `Hymn #${numStr}`,
        alt_titles: altTitles,
        first_line: h.first_line || "",
        key: h.key || "",
        topics,
        scriptures,
        scan_urls: scanUrls,
        has_scan: scanUrls.length > 0,
        _numStr: numStr.toLowerCase(),
        _titleNorm: normalizeForSearch(h.title),
        _altNorm: normalizeForSearch(altTitles.join(" ")),
        _firstLineNorm: normalizeForSearch(h.first_line),
        _metaNorm: normalizeForSearch([...topics, ...scriptures, bookMeta.code, bookMeta.name].join(" ")),
        _topicSet: new Set(topics.map(normalizeTopicKey)),
      };
    });

    cleaned.sort((a, b) => {
      const na = a.number ?? 999999;
      const nb = b.number ?? 999999;
      if (na !== nb) return na - nb;
      return a.number_str.localeCompare(b.number_str);
    });

    state.bookCache.set(bookId, cleaned);
    cleaned.forEach((h) => state.hymnMap.set(h.id, h));
    return cleaned;
  }

  async function loadBook(bookId) {
    if (state.bookCache.has(bookId)) return state.bookCache.get(bookId);
    const meta = HYMNALS[bookId];
    if (!meta) return [];
    const resp = await fetch(meta.file, { cache: "no-cache" });
    if (!resp.ok) throw new Error(`HTTP ${resp.status} loading ${meta.file}`);
    const data = await resp.json();
    if (!Array.isArray(data)) throw new Error(`Expected array in ${meta.file}`);
    return prepareBookData(bookId, data);
  }

  function getReferencedExternalBookIds() {
    const needed = new Set();
    state.setlists.forEach((sl) => {
      (sl.items || []).forEach((it) => { if (it && it.type !== "element" && it.hymnId) needed.add(getBookIdFromHymnId(it.hymnId)); });
    });
    state.history.forEach((entry) => {
      needed.add(getBookIdFromHymnId(entry.hymnId));
    });
    return Array.from(needed).filter((id) => HYMNALS[id] && !state.bookCache.has(id));
  }

  async function syncActiveBooks() {
    const activeIds = getActiveBookIds();
    updateHymnalSettingsUI();

    try {
      await Promise.all(activeIds.map((id) => loadBook(id)));
      el.loadErrorBanner.classList.add("hidden");
    } catch (err) {
      console.error("Failed to load hymnal data:", err);
      el.loadErrorBanner.classList.remove("hidden");
    }

    // Merge active books in consistent book order, sorted by number within each book
    const combined = [];
    HYMNAL_ORDER.forEach((id) => {
      if (activeIds.includes(id) && state.bookCache.has(id)) {
        combined.push(...state.bookCache.get(id));
      }
    });
    state.hymns = combined;

    rebuildLastSungMap();
    refreshTagSelectorsAndStats();
    renderHymnList();
    renderSetlistsHome();
    if (state.activeSetlistId) renderSetlistEditor();
    renderHistoryTab();
    updateHymnNavButtons();

    // Background-load any other books referenced in saved Setlists or History
    const extraIds = getReferencedExternalBookIds();
    if (extraIds.length > 0) {
      Promise.allSettled(extraIds.map((id) => loadBook(id))).then(() => {
        renderSetlistsHome();
        if (state.activeSetlistId) renderSetlistEditor();
        renderHistoryTab();
      });
    }
  }

  function prepareHymns(rawList) {
    // Used by manual local JSON file picker fallback
    prepareBookData(state.primaryHymnal, rawList);
    syncActiveBooks();
  }

  // =========================================================================
  // Filtering & Ranked Instant Search
  // =========================================================================
  function matchesTopicCategory(hymn, catKey) {
    if (!catKey || catKey === "all") return true;
    const cfg = QUICK_CATEGORIES[catKey];
    if (!cfg) return true;
    return cfg.topics.some((t) => hymn._topicSet.has(t));
  }

  function scoreHymnMatch(h, queryStr) {
    const q = normalizeForSearch(queryStr);
    const rawQ = queryStr.trim().toLowerCase();
    if (!q && !rawQ) return 1;
    const isNumericQuery = /^\d+$/.test(rawQ);
    const songTags = state.customTags[h.id] || [];
    const customTagsNorm = songTags.length ? normalizeForSearch(songTags.join(" ")) : "";
    const noteNorm = state.notes[h.id] ? normalizeForSearch(state.notes[h.id]) : "";

    if (h._numStr === rawQ) return 1000;
    if (isNumericQuery && h._numStr.startsWith(rawQ)) return 800;
    if (isNumericQuery && h._numStr.includes(rawQ)) return 600;
    if (h._titleNorm.startsWith(q) || h._altNorm.startsWith(q)) return 500;
    if (h._titleNorm.includes(q) || h._altNorm.includes(q)) return 400;
    if (h._firstLineNorm.includes(q)) return 300;
    if (customTagsNorm.includes(q)) return 250;
    if (h._metaNorm.includes(q) || noteNorm.includes(q)) return 200;
    return 0;
  }

  function getFilteredHymns() {
    const hasQuery = Boolean(state.searchQuery.trim());
    const matches = [];

    for (const h of state.hymns) {
      if (isMultiBookActive() && state.activeBookFilter !== "all" && h.bookId !== state.activeBookFilter) continue;
      if (!state.showSupplement && isSupplement(h)) continue;
      if (state.onlyFavorites && !state.favorites.has(h.id)) continue;
      if (state.onlyWithScans && !h.has_scan) continue;
      if (!matchesTopicCategory(h, state.topicCategory)) continue;

      const songTags = state.customTags[h.id] || [];
      if (state.activeCustomTag && !songTags.includes(state.activeCustomTag)) continue;
      if (state.activeTopicBrowse && !h.topics.includes(state.activeTopicBrowse)) continue;
      if (state.activeBibleBook) {
        const hasBook = h.scriptures.some((s) => extractBibleBook(s).toLowerCase() === state.activeBibleBook.toLowerCase());
        if (!hasBook) continue;
      }
      if (state.activeRotationFilter) {
        const lastDate = state.lastSungMap.get(h.id);
        if (state.activeRotationFilter === "never") {
          if (lastDate) continue;
        } else if (state.activeRotationFilter === "due90") {
          if (lastDate && daysSinceISO(lastDate) < 90) continue;
        } else if (state.activeRotationFilter === "due60") {
          if (lastDate && daysSinceISO(lastDate) < 60) continue;
        }
      }

      if (!hasQuery) {
        matches.push({ hymn: h, score: 0 });
        continue;
      }

      const score = scoreHymnMatch(h, state.searchQuery);
      if (score > 0) matches.push({ hymn: h, score });
    }

    if (hasQuery) {
      matches.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (a.hymn.number ?? 999999) - (b.hymn.number ?? 999999);
      });
    }

    return matches.map((m) => m.hymn);
  }

  function renderHymnList() {
    const list = getFilteredHymns();
    const parts = [];

    if (isMultiBookActive() && state.activeBookFilter !== "all") {
      parts.push(HYMNALS[state.activeBookFilter].code);
    }
    if (state.topicCategory !== "all") parts.push(QUICK_CATEGORIES[state.topicCategory].label);
    if (state.onlyFavorites) parts.push("Favorites");
    if (state.onlyWithScans) parts.push("With Scans");
    if (state.activeCustomTag) parts.push(`Tag: ${state.activeCustomTag}`);
    if (state.activeTopicBrowse) parts.push(`Topic: ${state.activeTopicBrowse}`);
    if (state.activeBibleBook) parts.push(`Bible: ${state.activeBibleBook}`);
    if (state.activeRotationFilter === "due90") parts.push("Due 90d+");
    else if (state.activeRotationFilter === "due60") parts.push("Due 60d+");
    else if (state.activeRotationFilter === "never") parts.push("Never Sung");

    if (state.searchQuery.trim()) {
      const scopeSuffix = parts.length ? ` in ${parts.join(" · ")}` : "";
      el.resultsSummary.textContent = `${list.length} match${list.length === 1 ? "" : "es"} for "${state.searchQuery.trim()}"${scopeSuffix}`;
    } else if (parts.length) {
      el.resultsSummary.textContent = `Showing ${list.length} songs · ${parts.join(" · ")}`;
    } else if (isMultiBookActive()) {
      const codes = getActiveBookIds().map((id) => HYMNALS[id].code).join(", ");
      el.resultsSummary.textContent = `Showing ${list.length} songs (${codes})`;
    } else if (state.primaryHymnal === "pftl") {
      const rangeLabel = state.showSupplement ? "1–990" : "1–900";
      el.resultsSummary.textContent = `Showing ${list.length} songs (${rangeLabel})`;
    } else {
      el.resultsSummary.textContent = `Showing ${list.length} songs`;
    }

    el.hymnList.innerHTML = "";

    if (list.length === 0) {
      el.emptyState.classList.remove("hidden");
      return;
    }
    el.emptyState.classList.add("hidden");

    const frag = document.createDocumentFragment();
    for (const h of list) {
      const isFav = state.favorites.has(h.id);
      const dsEntry = state.dontSing[h.id];
      const songTags = state.customTags[h.id] || [];
      const lastDate = state.lastSungMap.get(h.id);
      const recency = lastDate ? formatRecency(lastDate) : null;

      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "hymn-row";
      btn.dataset.id = h.id;

      if (isSupplement(h)) btn.classList.add("is-supplement");
      if (dsEntry) btn.classList.add("is-dontsing");
      if (h.id === state.selectedId) btn.classList.add("selected");

      const numCol = document.createElement("div");
      numCol.className = "hymn-num-col";

      const numWrap = document.createElement("span");
      numWrap.className = "hymn-num-wrap";

      if (dsEntry) {
        const dsIcon = document.createElement("span");
        dsIcon.className = "dontsing-icon-inline";
        dsIcon.textContent = "⊘";
        dsIcon.title = "Marked Don't Sing";
        numWrap.appendChild(dsIcon);
      }

      const numSpan = document.createElement("span");
      numSpan.className = "hymn-num";
      numSpan.textContent = h.number_str;
      numWrap.appendChild(numSpan);
      numCol.appendChild(numWrap);

      if (isMultiBookActive()) {
        const bBadge = document.createElement("span");
        bBadge.className = "book-badge";
        bBadge.textContent = h.bookCode;
        numCol.appendChild(bBadge);
      }

      const infoDiv = document.createElement("div");
      infoDiv.className = "hymn-info";

      const titleLine = document.createElement("div");
      titleLine.className = "hymn-title-line";
      titleLine.textContent = h.title;

      if (h.alt_titles.length > 0) {
        const altSpan = document.createElement("span");
        altSpan.className = "hymn-alt";
        altSpan.textContent = ` (${h.alt_titles.join("; ")})`;
        titleLine.appendChild(altSpan);
      }

      infoDiv.appendChild(titleLine);

      if (dsEntry && dsEntry.reason) {
        const reasonLine = document.createElement("div");
        reasonLine.className = "hymn-dontsing-reason";
        reasonLine.textContent = `Don't sing: ${dsEntry.reason}`;
        infoDiv.appendChild(reasonLine);
      } else {
        const subLine = document.createElement("div");
        subLine.className = "hymn-sub-line";
        subLine.textContent = h.first_line;
        infoDiv.appendChild(subLine);
      }

      if (songTags.length > 0) {
        const tagsWrap = document.createElement("div");
        tagsWrap.className = "hymn-custom-tags-mini";
        songTags.slice(0, 3).forEach((t) => {
          const mt = document.createElement("span");
          mt.className = "mini-tag";
          mt.textContent = t;
          tagsWrap.appendChild(mt);
        });
        infoDiv.appendChild(tagsWrap);
      }

      const rightDiv = document.createElement("div");
      rightDiv.className = "hymn-right";

      const rightTop = document.createElement("div");
      rightTop.className = "hymn-right-top";

      if (isFav) {
        const star = document.createElement("span");
        star.className = "fav-star-badge";
        star.textContent = "★";
        star.title = "Favorite";
        rightTop.appendChild(star);
      }

      const keyTag = document.createElement("span");
      keyTag.className = "key-tag";
      keyTag.textContent = formatKeyBadge(getSongBaseKey(h));
      rightTop.appendChild(keyTag);

      rightDiv.appendChild(rightTop);

      if (recency) {
        const recSpan = document.createElement("span");
        recSpan.className = "hymn-recency" + (recency.recent ? " is-recent" : "");
        recSpan.textContent = recency.text;
        rightDiv.appendChild(recSpan);
      }

      if (isSupplement(h)) {
        const suppTag = document.createElement("span");
        suppTag.className = "supp-tag";
        suppTag.textContent = "900+";
        rightDiv.appendChild(suppTag);
      }

      if (!h.has_scan && (isMultiBookActive() || bookHasAnyScans(h.bookId))) {
        const noScan = document.createElement("span");
        noScan.className = "no-scan-dot";
        noScan.textContent = "No scan";
        rightDiv.appendChild(noScan);
      }

      btn.appendChild(numCol);
      btn.appendChild(infoDiv);
      btn.appendChild(rightDiv);
      li.appendChild(btn);
      frag.appendChild(li);
    }

    el.hymnList.appendChild(frag);
  }

  // =========================================================================
  // Worship Setlists (Stage 4)
  // =========================================================================
  function saveSetlists() {
    saveJSON(STORAGE_KEYS.SETLISTS, state.setlists);
    refreshTagSelectorsAndStats();
  }

  function getSetlistById(id) {
    return state.setlists.find((s) => s.id === id) || null;
  }

  function createSetlist(name = "Sunday AM", date = getNextSundayISO()) {
    const sl = {
      id: makeId("sl"),
      name: name.trim() || "Worship Service",
      date: date || getTodayISO(),
      notes: "",
      items: [], // [{ hymnId, slot }]
      loggedAt: null,
    };
    state.setlists.unshift(sl);
    saveSetlists();
    return sl;
  }

  function confirmSpecialSongForSetlist(hymn) {
    if (isSupplement(hymn)) {
      const ok = window.confirm(
        `#${hymn.number_str} "${hymn.title}" is in the 901+ Expanded Supplement and is NOT in our church's 1–900 hymnal.

Add it to this setlist anyway?`
      );
      if (!ok) return false;
    }
    const ds = state.dontSing[hymn.id];
    if (ds) {
      const reasonTxt = ds.reason ? ` (${ds.reason})` : "";
      const ok = window.confirm(
        `#${hymn.number_str} "${hymn.title}" is marked "Don't Sing"${reasonTxt}.

Add it to this setlist anyway?`
      );
      if (!ok) return false;
    }
    return true;
  }

  function addHymnToSetlist(setlistId, hymnId, slot = "Opening") {
    const sl = getSetlistById(setlistId);
    const hymn = state.hymnMap.get(String(hymnId));
    if (!sl || !hymn) return false;
    if (!confirmSpecialSongForSetlist(hymn)) return false;

    sl.items.push({ hymnId: hymn.id, slot });
    saveSetlists();
    renderSetlistsHome();
    if (state.activeSetlistId === sl.id) {
      renderSetlistEditor();
    }
    return true;
  }

  function getSetlistHighResUrls(sl) {
    if (!sl || !Array.isArray(sl.items)) return [];
    const urls = [];
    sl.items.forEach((it) => {
      if (isWorshipElementItem(it)) return;
      const h = state.hymnMap.get(String(it.hymnId));
      if (h && h.has_scan && Array.isArray(h.scan_urls)) {
        h.scan_urls.forEach((u) => {
          const hi = u.replace("/low/", "/high/");
          if (!urls.includes(hi)) urls.push(hi);
        });
      }
    });
    return urls;
  }

  function isHymnHighResCached(hymn) {
    if (!hymn || !hymn.has_scan || hymn.scan_urls.length === 0) return false;
    return hymn.scan_urls.every((u) => state.cachedHighResUrls.has(u.replace("/low/", "/high/")));
  }

  function updatePrecacheButtonUI(sl) {
    if (!el.precacheHighResBtn) return;
    if (state.isPrecaching) return;
    const urls = getSetlistHighResUrls(sl);
    if (urls.length === 0) {
      el.precacheHighResBtn.disabled = true;
      el.precacheHighResBtn.textContent = "No Scans";
      el.precacheHighResBtn.classList.remove("loaded");
      return;
    }
    const allCached = urls.every((u) => state.cachedHighResUrls.has(u));
    if (allCached) {
      el.precacheHighResBtn.disabled = false;
      el.precacheHighResBtn.textContent = "High-Res Cached ✓";
      el.precacheHighResBtn.classList.add("loaded");
    } else {
      el.precacheHighResBtn.disabled = false;
      el.precacheHighResBtn.textContent = `Pre-Cache High-Res (${urls.length})`;
      el.precacheHighResBtn.classList.remove("loaded");
    }
  }

  function precacheSetlistHighRes(setlistId) {
    const sl = getSetlistById(setlistId);
    if (!sl || state.isPrecaching) return;

    const urls = getSetlistHighResUrls(sl);
    if (urls.length === 0) return;

    const toFetch = urls.filter((u) => !state.cachedHighResUrls.has(u));
    if (toFetch.length === 0) {
      el.setlistStatusMsg.textContent = `All ${urls.length} High-Res page${urls.length === 1 ? "" : "s"} are already cached.`;
      el.setlistStatusMsg.classList.remove("hidden");
      updatePrecacheButtonUI(sl);
      return;
    }

    state.isPrecaching = true;
    el.precacheHighResBtn.disabled = true;
    el.precacheHighResBtn.classList.remove("loaded");

    let completed = 0;
    let failed = 0;
    const total = toFetch.length;

    const updateProgress = () => {
      el.precacheHighResBtn.textContent = `Caching (${completed}/${total})…`;
      el.setlistStatusMsg.textContent = `Pre-caching High-Res scans: ${completed} of ${total} page${total === 1 ? "" : "s"}…`;
      el.setlistStatusMsg.classList.remove("hidden");
    };
    updateProgress();

    const finishOne = (url, ok) => {
      completed++;
      if (ok) {
        state.cachedHighResUrls.add(url);
      } else {
        failed++;
      }

      if (completed >= total) {
        state.isPrecaching = false;
        updatePrecacheButtonUI(getSetlistById(state.activeSetlistId));
        if (failed === 0) {
          el.setlistStatusMsg.textContent = `Cached all ${urls.length} High-Res sheet music page${urls.length === 1 ? "" : "s"} for this service.`;
        } else {
          el.setlistStatusMsg.textContent = `Cached ${total - failed} of ${total} High-Res pages (${failed} failed to load).`;
        }
        el.setlistStatusMsg.classList.remove("hidden");

        // If the currently open song is now cached, refresh its viewer to High-Res
        if (state.selectedId) {
          const currentHymn = state.hymnMap.get(state.selectedId);
          if (currentHymn && isHymnHighResCached(currentHymn) && !state.highResLoaded) {
            renderSheetMusic(currentHymn, true);
          }
        }
      } else {
        updateProgress();
      }
    };

    toFetch.forEach((url) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        state.preloadedImages.set(url, img);
        finishOne(url, true);
      };
      img.onerror = () => {
        finishOne(url, false);
      };
      img.src = url;
    });
  }

  function isWorshipElementItem(it) {
    return Boolean(it && it.type === "element");
  }

  function getAvailableSongRoles(includeCurrent) {
    const visibleDefaults = SERVICE_SLOTS.filter((r) => !state.hiddenDefaultRoles.includes(r));
    const list = [...visibleDefaults, ...state.customSongRoles];
    if (list.length === 0) list.push("Other");
    if (includeCurrent && !list.includes(includeCurrent)) {
      list.push(includeCurrent);
    }
    return list;
  }

  function populateSlotSelect(selectEl, selectedValue) {
    if (!selectEl) return;
    const prev = selectedValue !== undefined ? selectedValue : selectEl.value;
    const roles = getAvailableSongRoles(selectedValue !== undefined ? selectedValue : null);
    selectEl.innerHTML = "";
    roles.forEach((roleName) => {
      const opt = document.createElement("option");
      opt.value = roleName;
      opt.textContent = roleName;
      if (prev === roleName) opt.selected = true;
      selectEl.appendChild(opt);
    });
    if (!roles.includes(selectEl.value) && roles.length > 0) {
      selectEl.value = roles[0];
    }
  }

  function syncRoleDropdowns() {
    populateSlotSelect(el.targetSlotSelect);
    populateSlotSelect(el.pickerSlotSelect);
  }

  function syncSetlistFooterElementsUI() {
    if (el.addElementToSetlistBtn) {
      el.addElementToSetlistBtn.classList.toggle("hidden", !state.worshipElementsEnabled);
    }
    if (el.setlistFooterActions) {
      el.setlistFooterActions.classList.toggle("has-elements", state.worshipElementsEnabled);
    }
  }

  function saveSetlistSettings() {
    localStorage.setItem(STORAGE_KEYS.WORSHIP_ELEMENTS_ENABLED, String(state.worshipElementsEnabled));
    saveJSON(STORAGE_KEYS.CUSTOM_SONG_ROLES, state.customSongRoles);
    saveJSON(STORAGE_KEYS.HIDDEN_DEFAULT_ROLES, state.hiddenDefaultRoles);
    syncRoleDropdowns();
    syncSetlistFooterElementsUI();
    if (state.activeSetlistId) renderSetlistEditor();
  }

  function openSetlistSettings() {
    state.setlistSettingsOpen = true;
    state.editingCustomRoleIndex = -1;
    el.setlistsHome.classList.add("hidden");
    el.setlistEditor.classList.add("hidden");
    if (el.setlistSettings) el.setlistSettings.classList.remove("hidden");
    if (el.customRoleError) el.customRoleError.classList.add("hidden");
    renderSetlistSettings();
  }

  function closeSetlistSettings() {
    state.setlistSettingsOpen = false;
    state.editingCustomRoleIndex = -1;
    if (el.setlistSettings) el.setlistSettings.classList.add("hidden");
    el.setlistsHome.classList.remove("hidden");
    renderSetlistsHome();
  }

  function showCustomRoleError(msg) {
    if (!el.customRoleError) return;
    if (!msg) {
      el.customRoleError.textContent = "";
      el.customRoleError.classList.add("hidden");
    } else {
      el.customRoleError.textContent = msg;
      el.customRoleError.classList.remove("hidden");
    }
  }

  function validateCustomRoleName(raw, ignoreIndex = -1) {
    const clean = String(raw || "").trim().replace(/\s+/g, " ");
    if (!clean) return { ok: false, error: "Please enter a role name." };
    const lower = clean.toLowerCase();
    if (SERVICE_SLOTS.some((r) => r.toLowerCase() === lower)) {
      return { ok: false, error: `"${clean}" is already a built-in role.` };
    }
    if (state.customSongRoles.some((r, idx) => idx !== ignoreIndex && r.toLowerCase() === lower)) {
      return { ok: false, error: `"${clean}" already exists.` };
    }
    return { ok: true, value: clean };
  }

  function renderSetlistSettings() {
    if (!el.setlistSettings) return;
    if (el.enableWorshipElementsToggle) {
      el.enableWorshipElementsToggle.checked = state.worshipElementsEnabled;
    }

    // Custom Song Roles
    const count = state.customSongRoles.length;
    if (el.customRolesCount) {
      el.customRolesCount.textContent = `${count} / ${MAX_CUSTOM_ROLES}`;
    }
    const atLimit = count >= MAX_CUSTOM_ROLES;
    if (el.newCustomRoleInput) {
      el.newCustomRoleInput.disabled = atLimit;
      el.newCustomRoleInput.placeholder = atLimit
        ? "Maximum 6 custom roles reached"
        : "New role (e.g. Song 4, Devotional)";
    }
    if (el.addCustomRoleBtn) el.addCustomRoleBtn.disabled = atLimit;

    if (el.customRolesList) {
      el.customRolesList.innerHTML = "";
      state.customSongRoles.forEach((roleName, idx) => {
        const li = document.createElement("li");
        li.className = "custom-role-item";

        if (state.editingCustomRoleIndex === idx) {
          const input = document.createElement("input");
          input.type = "text";
          input.className = "custom-role-edit-input";
          input.maxLength = 32;
          input.value = roleName;

          const actions = document.createElement("div");
          actions.className = "custom-role-actions";

          const commitEdit = () => {
            const check = validateCustomRoleName(input.value, idx);
            if (!check.ok) {
              showCustomRoleError(check.error);
              input.focus();
              return;
            }
            const oldName = state.customSongRoles[idx];
            state.customSongRoles[idx] = check.value;
            if (oldName !== check.value) {
              let touched = false;
              state.setlists.forEach((sl) => {
                (sl.items || []).forEach((it) => {
                  if (!isWorshipElementItem(it) && it.slot === oldName) {
                    it.slot = check.value;
                    touched = true;
                  }
                });
              });
              if (touched) saveSetlists();
            }
            state.editingCustomRoleIndex = -1;
            showCustomRoleError("");
            saveSetlistSettings();
            renderSetlistSettings();
          };

          const saveBtn = document.createElement("button");
          saveBtn.type = "button";
          saveBtn.className = "btn-role-action is-save";
          saveBtn.textContent = "Save";
          saveBtn.addEventListener("click", commitEdit);

          const cancelBtn = document.createElement("button");
          cancelBtn.type = "button";
          cancelBtn.className = "btn-role-action";
          cancelBtn.textContent = "Cancel";
          cancelBtn.addEventListener("click", () => {
            state.editingCustomRoleIndex = -1;
            showCustomRoleError("");
            renderSetlistSettings();
          });

          input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitEdit();
            } else if (e.key === "Escape") {
              e.preventDefault();
              state.editingCustomRoleIndex = -1;
              showCustomRoleError("");
              renderSetlistSettings();
            }
          });

          actions.appendChild(saveBtn);
          actions.appendChild(cancelBtn);
          li.appendChild(input);
          li.appendChild(actions);
          setTimeout(() => {
            input.focus();
            input.select();
          }, 20);
        } else {
          const nameSpan = document.createElement("span");
          nameSpan.className = "custom-role-name";
          nameSpan.textContent = roleName;

          const actions = document.createElement("div");
          actions.className = "custom-role-actions";

          const editBtn = document.createElement("button");
          editBtn.type = "button";
          editBtn.className = "btn-role-action";
          editBtn.textContent = "Edit";
          editBtn.addEventListener("click", () => {
            state.editingCustomRoleIndex = idx;
            showCustomRoleError("");
            renderSetlistSettings();
          });

          const delBtn = document.createElement("button");
          delBtn.type = "button";
          delBtn.className = "btn-role-action is-delete";
          delBtn.textContent = "×";
          delBtn.title = `Delete "${roleName}"`;
          delBtn.addEventListener("click", () => {
            state.customSongRoles.splice(idx, 1);
            if (state.editingCustomRoleIndex === idx) state.editingCustomRoleIndex = -1;
            showCustomRoleError("");
            saveSetlistSettings();
            renderSetlistSettings();
          });

          actions.appendChild(editBtn);
          actions.appendChild(delBtn);
          li.appendChild(nameSpan);
          li.appendChild(actions);
        }

        el.customRolesList.appendChild(li);
      });
    }

    // Hide Default Song Roles
    if (el.defaultRolesToggleList) {
      el.defaultRolesToggleList.innerHTML = "";
      SERVICE_SLOTS.forEach((roleName) => {
        const isHidden = state.hiddenDefaultRoles.includes(roleName);
        const row = document.createElement("label");
        row.className = "default-role-row" + (isHidden ? " is-hidden-role" : "");

        const left = document.createElement("span");
        left.className = "default-role-left";

        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.className = "toggle-checkbox";
        cb.checked = isHidden;
        cb.addEventListener("change", () => {
          if (cb.checked) {
            if (!state.hiddenDefaultRoles.includes(roleName)) {
              state.hiddenDefaultRoles.push(roleName);
            }
          } else {
            state.hiddenDefaultRoles = state.hiddenDefaultRoles.filter((r) => r !== roleName);
          }
          saveSetlistSettings();
          renderSetlistSettings();
        });

        const lbl = document.createElement("span");
        lbl.className = "default-role-label";
        lbl.textContent = roleName;

        left.appendChild(cb);
        left.appendChild(lbl);
        row.appendChild(left);

        if (isHidden) {
          const status = document.createElement("span");
          status.className = "default-role-status";
          status.textContent = "Hidden";
          row.appendChild(status);
        }

        el.defaultRolesToggleList.appendChild(row);
      });
    }
  }

  function addElementToSetlist(setlistId, elementName) {
    const sl = getSetlistById(setlistId);
    if (!sl) return false;
    sl.items.push({ type: "element", element: elementName || "Other", cue: "" });
    saveSetlists();
    renderSetlistsHome();
    if (state.activeSetlistId === sl.id) {
      renderSetlistEditor();
    }
    return true;
  }

  function openElementPickerModal() {
    if (!el.elementPickerModal || !el.elementPickerList) return;
    el.elementPickerList.innerHTML = "";
    WORSHIP_ELEMENTS.forEach((elemName) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "element-picker-row";

      const title = document.createElement("span");
      title.textContent = elemName;

      const badge = document.createElement("span");
      badge.className = "element-picker-badge";
      badge.textContent = "Element";

      btn.appendChild(title);
      btn.appendChild(badge);
      btn.addEventListener("click", () => {
        if (state.activeSetlistId) {
          addElementToSetlist(state.activeSetlistId, elemName);
        }
        closeElementPickerModal();
      });

      li.appendChild(btn);
      el.elementPickerList.appendChild(li);
    });
    el.elementPickerModal.classList.remove("hidden");
  }

  function closeElementPickerModal() {
    if (el.elementPickerModal) el.elementPickerModal.classList.add("hidden");
  }

  function renderSetlistsHome() {
    const sorted = [...state.setlists].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    el.setlistsList.innerHTML = "";

    if (sorted.length === 0) {
      el.setlistsEmpty.classList.remove("hidden");
      return;
    }
    el.setlistsEmpty.classList.add("hidden");

    const frag = document.createDocumentFragment();
    sorted.forEach((sl) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "setlist-card";
      card.dataset.setlistId = sl.id;

      const top = document.createElement("div");
      top.className = "setlist-card-top";

      const title = document.createElement("span");
      title.className = "setlist-card-title";
      title.textContent = sl.name || "Untitled Service";

      const date = document.createElement("span");
      date.className = "setlist-card-date";
      date.textContent = formatDisplayDate(sl.date);

      top.appendChild(title);
      top.appendChild(date);

      const meta = document.createElement("div");
      meta.className = "setlist-card-meta";

      const countTxt = document.createElement("span");
      const songItems = (sl.items || []).filter((it) => !isWorshipElementItem(it));
      const elemCount = (sl.items || []).length - songItems.length;
      const songNums = songItems
        .map((it) => {
          const h = state.hymnMap.get(String(it.hymnId));
          return h ? `#${h.number_str}` : "";
        })
        .filter(Boolean)
        .join(", ");
      const countParts = [];
      if (songItems.length > 0) countParts.push(`${songItems.length} song${songItems.length === 1 ? "" : "s"}`);
      if (elemCount > 0) countParts.push(`${elemCount} element${elemCount === 1 ? "" : "s"}`);
      if (countParts.length === 0) {
        countTxt.textContent = "No songs yet";
      } else {
        countTxt.textContent = songNums ? `${countParts.join(", ")} · ${songNums}` : countParts.join(", ");
      }
      meta.appendChild(countTxt);

      if (sl.loggedAt) {
        const badge = document.createElement("span");
        badge.className = "logged-badge";
        badge.textContent = "Logged";
        meta.appendChild(badge);
      }

      card.appendChild(top);
      card.appendChild(meta);
      frag.appendChild(card);
    });

    el.setlistsList.appendChild(frag);
  }

  function openSetlistEditor(setlistId) {
    const sl = getSetlistById(setlistId);
    if (!sl) return;
    state.activeSetlistId = sl.id;
    state.setlistSettingsOpen = false;
    el.setlistsHome.classList.add("hidden");
    if (el.setlistSettings) el.setlistSettings.classList.add("hidden");
    el.setlistEditor.classList.remove("hidden");
    el.setlistStatusMsg.classList.add("hidden");
    syncSetlistFooterElementsUI();
    renderSetlistEditor();
  }

  function closeSetlistEditor() {
    state.activeSetlistId = null;
    state.setlistSettingsOpen = false;
    el.setlistEditor.classList.add("hidden");
    if (el.setlistSettings) el.setlistSettings.classList.add("hidden");
    el.setlistsHome.classList.remove("hidden");
    renderSetlistsHome();
  }

  function renderSetlistEditor() {
    const sl = getSetlistById(state.activeSetlistId);
    if (!sl) {
      closeSetlistEditor();
      return;
    }

    el.setlistNameInput.value = sl.name || "";
    el.setlistDateInput.value = sl.date || "";
    el.setlistNotesInput.value = sl.notes || "";

    const songItems = (sl.items || []).filter((it) => !isWorshipElementItem(it));
    el.startPodiumBtn.disabled = sl.items.length === 0;
    el.logSetlistSungBtn.disabled = songItems.length === 0;
    el.logSetlistSungBtn.textContent = sl.loggedAt ? "Log Service Again" : "Log Service as Sung";
    syncSetlistFooterElementsUI();
    updatePrecacheButtonUI(sl);

    // Key progression strip (songs only)
    el.keyProgressionItems.innerHTML = "";
    if (songItems.length > 0) {
      el.keyProgressionBar.classList.remove("hidden");
      songItems.forEach((it, idx) => {
        const h = state.hymnMap.get(String(it.hymnId));
        const keyTxt = getEffectiveKeyForHymn(h);
        const span = document.createElement("span");
        span.textContent = keyTxt;
        el.keyProgressionItems.appendChild(span);
        if (idx < songItems.length - 1) {
          const arr = document.createElement("span");
          arr.className = "key-prog-arrow";
          arr.textContent = "→";
          el.keyProgressionItems.appendChild(arr);
        }
      });
    } else {
      el.keyProgressionBar.classList.add("hidden");
    }

    // Song & Worship Element rows
    el.setlistSongsList.innerHTML = "";
    if (sl.items.length === 0) {
      el.setlistSongsEmpty.classList.remove("hidden");
      return;
    }
    el.setlistSongsEmpty.classList.add("hidden");

    const frag = document.createDocumentFragment();
    sl.items.forEach((it, idx) => {
      const isElem = isWorshipElementItem(it);
      const h = isElem ? null : state.hymnMap.get(String(it.hymnId));
      if (!isElem && !h) return;

      const card = document.createElement("div");
      card.className = isElem ? "setlist-song-item setlist-element-item" : "setlist-song-item";

      const top = document.createElement("div");
      top.className = "setlist-song-top";

      const slotSelect = document.createElement("select");
      slotSelect.className = isElem ? "slot-select slot-select-element" : "slot-select";
      if (isElem) {
        WORSHIP_ELEMENTS.forEach((elemName) => {
          const opt = document.createElement("option");
          opt.value = elemName;
          opt.textContent = elemName;
          if ((it.element || "Other") === elemName) opt.selected = true;
          slotSelect.appendChild(opt);
        });
        slotSelect.addEventListener("change", () => {
          it.element = slotSelect.value;
          saveSetlists();
          renderSetlistEditor();
          updateRunnerBar();
        });
      } else {
        populateSlotSelect(slotSelect, it.slot || "Other");
        slotSelect.addEventListener("change", () => {
          it.slot = slotSelect.value;
          saveSetlists();
          updateRunnerBar();
        });
      }

      const controls = document.createElement("div");
      controls.className = "slot-item-controls";

      const upBtn = document.createElement("button");
      upBtn.type = "button";
      upBtn.className = "btn-slot-move";
      upBtn.textContent = "▲";
      upBtn.disabled = idx === 0;
      upBtn.title = "Move up";
      upBtn.addEventListener("click", () => {
        if (idx === 0) return;
        [sl.items[idx - 1], sl.items[idx]] = [sl.items[idx], sl.items[idx - 1]];
        saveSetlists();
        renderSetlistEditor();
      });

      const downBtn = document.createElement("button");
      downBtn.type = "button";
      downBtn.className = "btn-slot-move";
      downBtn.textContent = "▼";
      downBtn.disabled = idx === sl.items.length - 1;
      downBtn.title = "Move down";
      downBtn.addEventListener("click", () => {
        if (idx >= sl.items.length - 1) return;
        [sl.items[idx + 1], sl.items[idx]] = [sl.items[idx], sl.items[idx + 1]];
        saveSetlists();
        renderSetlistEditor();
      });

      const rmBtn = document.createElement("button");
      rmBtn.type = "button";
      rmBtn.className = "btn-slot-remove";
      rmBtn.textContent = "×";
      rmBtn.title = "Remove from setlist";
      rmBtn.addEventListener("click", () => {
        sl.items.splice(idx, 1);
        saveSetlists();
        renderSetlistEditor();
      });

      controls.appendChild(upBtn);
      controls.appendChild(downBtn);
      controls.appendChild(rmBtn);

      const cueInput = document.createElement("input");
      cueInput.type = "text";
      cueInput.className = "slot-cue-input";
      cueInput.placeholder = isElem ? "Details (e.g. leader, passage)…" : "v. 1, 2, 4…";
      cueInput.value = it.cue || "";
      cueInput.title = isElem ? "Worship element details" : "Verse selection or leader cue";

      top.appendChild(slotSelect);
      top.appendChild(cueInput);
      top.appendChild(controls);

      if (isElem) {
        const mainBtn = document.createElement("button");
        mainBtn.type = "button";
        mainBtn.className = "setlist-element-main";
        mainBtn.addEventListener("click", () => startPodiumAt(sl.id, idx));

        const titleEl = document.createElement("span");
        titleEl.className = "setlist-element-title";
        titleEl.textContent = it.element || "Worship Element";

        const detailEl = document.createElement("span");
        detailEl.className = "setlist-element-detail";
        detailEl.textContent = (it.cue || "").trim();

        cueInput.addEventListener("input", () => {
          it.cue = cueInput.value;
          detailEl.textContent = it.cue.trim();
          saveSetlists();
          updateRunnerBar();
        });

        mainBtn.appendChild(titleEl);
        mainBtn.appendChild(detailEl);
        card.appendChild(top);
        card.appendChild(mainBtn);
      } else {
        cueInput.addEventListener("input", () => {
          it.cue = cueInput.value;
          saveSetlists();
          updateRunnerBar();
        });

        const mainBtn = document.createElement("button");
        mainBtn.type = "button";
        mainBtn.className = "setlist-song-main";
        mainBtn.addEventListener("click", () => startPodiumAt(sl.id, idx));

        const numEl = document.createElement("span");
        numEl.className = "setlist-song-num";
        numEl.textContent = shouldShowBookBadgeForHymn(h) ? `${h.bookCode} #${h.number_str}` : `#${h.number_str}`;

        const titleEl = document.createElement("span");
        titleEl.className = "setlist-song-title";
        titleEl.textContent = h.title;

        const keyEl = document.createElement("span");
        keyEl.className = "key-tag";
        keyEl.textContent = getEffectiveKeyForHymn(h);

        mainBtn.appendChild(numEl);
        mainBtn.appendChild(titleEl);
        mainBtn.appendChild(keyEl);

        card.appendChild(top);
        card.appendChild(mainBtn);
      }

      frag.appendChild(card);
    });

    el.setlistSongsList.appendChild(frag);
  }

  // =========================================================================
  // Podium / Setlist Runner Mode
  // =========================================================================
  function setElementRunnerMode(active) {
    if (el.detailHeader) el.detailHeader.classList.toggle("hidden", active);
    if (el.detailScroll) el.detailScroll.classList.toggle("hidden", active);
    if (el.pitchBar) el.pitchBar.classList.toggle("hidden", active);
    if (el.elementRunnerView) el.elementRunnerView.classList.toggle("hidden", !active);
  }

  function renderElementRunnerCard(sl, index) {
    const item = sl.items[index];
    if (!item || !el.elementRunnerView) return;
    el.elementRunnerTitle.textContent = item.element || "Worship Element";
    const cueTxt = (item.cue || "").trim();
    if (cueTxt) {
      el.elementRunnerCue.textContent = cueTxt;
      el.elementRunnerCue.classList.remove("hidden");
    } else {
      el.elementRunnerCue.textContent = "";
      el.elementRunnerCue.classList.add("hidden");
    }

    const nextItem = sl.items[index + 1];
    if (nextItem) {
      let nextLabel = "";
      if (isWorshipElementItem(nextItem)) {
        nextLabel = nextItem.element || "Worship Element";
      } else {
        const nh = state.hymnMap.get(String(nextItem.hymnId));
        nextLabel = nh ? `#${nh.number_str} ${nh.title}` : (nextItem.slot || "Song");
      }
      el.elementRunnerUpNext.innerHTML = "";
      const prefix = document.createTextNode("Up next: ");
      const strong = document.createElement("strong");
      strong.textContent = nextLabel;
      el.elementRunnerUpNext.appendChild(prefix);
      el.elementRunnerUpNext.appendChild(strong);
      el.elementRunnerUpNext.classList.remove("hidden");
    } else {
      el.elementRunnerUpNext.textContent = "";
      el.elementRunnerUpNext.classList.add("hidden");
    }
  }

  function startPodiumAt(setlistId, index) {
    const sl = getSetlistById(setlistId);
    if (!sl || !sl.items[index]) return;
    state.runner = { setlistId, index };
    const item = sl.items[index];
    if (isWorshipElementItem(item)) {
      pitchPipe.stopSustained();
      pitchPipe.stopArpeggio();
      closeFullscreen();
      el.detailEmpty.classList.add("hidden");
      el.detailContent.classList.remove("hidden");
      el.songDetailPane.classList.add("mobile-open");
      setElementRunnerMode(true);
      renderElementRunnerCard(sl, index);
    } else {
      setElementRunnerMode(false);
      openSong(item.hymnId, { keepRunner: true });
    }
    updateRunnerBar();
    syncWakeLock();
  }

  function updateRunnerBar() {
    if (!state.runner) {
      el.setlistRunnerBar.classList.add("hidden");
      el.setlistRunnerBar.classList.remove("is-element");
      return;
    }
    const sl = getSetlistById(state.runner.setlistId);
    if (!sl || !sl.items[state.runner.index]) {
      state.runner = null;
      el.setlistRunnerBar.classList.add("hidden");
      el.setlistRunnerBar.classList.remove("is-element");
      setElementRunnerMode(false);
      return;
    }
    const item = sl.items[state.runner.index];
    const isElem = isWorshipElementItem(item);
    el.setlistRunnerBar.classList.remove("hidden");
    el.setlistRunnerBar.classList.toggle("is-element", isElem);
    const cueTxt = (item.cue || "").trim();
    if (isElem) {
      el.runnerSlotLabel.textContent = item.element || "Worship Element";
      renderElementRunnerCard(sl, state.runner.index);
    } else {
      el.runnerSlotLabel.textContent = cueTxt ? `${item.slot || "Song"} · ${cueTxt}` : (item.slot || "Song");
    }
    el.runnerPosLabel.textContent = `${state.runner.index + 1} of ${sl.items.length} · ${sl.name || "Service"}`;
    el.runnerPrevBtn.disabled = state.runner.index <= 0;
    el.runnerNextBtn.disabled = state.runner.index >= sl.items.length - 1;
  }

  function exitRunner() {
    const wasElementView = el.elementRunnerView && !el.elementRunnerView.classList.contains("hidden");
    state.runner = null;
    el.setlistRunnerBar.classList.add("hidden");
    el.setlistRunnerBar.classList.remove("is-element");
    setElementRunnerMode(false);
    if (wasElementView) {
      if (!state.selectedId) {
        el.detailContent.classList.add("hidden");
        el.detailEmpty.classList.remove("hidden");
      }
      el.songDetailPane.classList.remove("mobile-open");
    }
    syncWakeLock();
  }


  function copySetlistToClipboard(setlistId) {
    const sl = getSetlistById(setlistId);
    if (!sl) return;
    const lines = [];
    const header = sl.date ? `${sl.name || "Worship Service"} — ${formatDisplayDate(sl.date)}` : (sl.name || "Worship Service");
    lines.push(header);
    if (sl.notes && sl.notes.trim()) lines.push(sl.notes.trim());
    lines.push("");

    sl.items.forEach((it) => {
      if (isWorshipElementItem(it)) {
        const cuePart = it.cue && it.cue.trim() ? ` — ${it.cue.trim()}` : "";
        lines.push(`[${it.element || "Element"}]${cuePart}`);
        return;
      }
      const h = state.hymnMap.get(String(it.hymnId));
      if (!h) return;
      const numLabel = shouldShowBookBadgeForHymn(h) ? `${h.bookCode} #${h.number_str}` : `#${h.number_str}`;
      const keyTxt = getEffectiveKeyForHymn(h);
      const keyPart = keyTxt && keyTxt !== "—" ? ` (${keyTxt})` : "";
      const cuePart = it.cue && it.cue.trim() ? ` — ${it.cue.trim()}` : "";
      lines.push(`${it.slot || "Song"}: ${numLabel} ${h.title}${keyPart}${cuePart}`);
    });

    const text = lines.join("\n");
    const done = () => showToast("Setlist copied to clipboard!", 2000);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => {
        fallbackCopyText(text);
        done();
      });
    } else {
      fallbackCopyText(text);
      done();
    }
  }

  function fallbackCopyText(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (_) {}
    ta.remove();
  }

  function updateBrowseFilterUI() {
    let label = "";
    if (state.activeTopicBrowse) label = `Topic: ${state.activeTopicBrowse}`;
    else if (state.activeBibleBook) label = `Bible: ${state.activeBibleBook}`;
    else if (state.activeRotationFilter === "due90") label = "Rotation: Not sung in 90+ days";
    else if (state.activeRotationFilter === "due60") label = "Rotation: Not sung in 60+ days";
    else if (state.activeRotationFilter === "never") label = "Rotation: Never sung";

    const hasActive = Boolean(label);
    el.activeBrowseLabel.textContent = label;
    el.activeBrowseBar.classList.toggle("hidden", !hasActive);
    el.browseFiltersBtn.classList.toggle("active", hasActive);
    el.browseFiltersBtn.setAttribute("aria-pressed", String(hasActive));
  }

  function clearBrowseFilters() {
    state.activeTopicBrowse = "";
    state.activeBibleBook = "";
    state.activeRotationFilter = "";
    updateBrowseFilterUI();
    renderHymnList();
  }

  function openBrowseModal() {
    el.browseSearchInput.value = "";
    renderBrowseModalContent();
    el.browseModal.classList.remove("hidden");
  }

  function closeBrowseModal() {
    el.browseModal.classList.add("hidden");
  }

  function renderBrowseModalContent() {
    el.browseTabs.forEach((t) => {
      const act = t.dataset.browseTab === state.browseTab;
      t.classList.toggle("active", act);
      t.setAttribute("aria-selected", String(act));
    });

    const isRotation = state.browseTab === "rotation";
    el.browseSearchWrap.classList.toggle("hidden", isRotation);
    el.browseResultsList.innerHTML = "";

    const pool = getBrowsableHymns();
    const q = normalizeForSearch(el.browseSearchInput.value);
    const frag = document.createDocumentFragment();

    if (state.browseTab === "topics") {
      const counts = new Map();
      pool.forEach((h) => {
        h.topics.forEach((t) => counts.set(t, (counts.get(t) || 0) + 1));
      });
      const items = Array.from(counts.entries())
        .filter(([t]) => !q || normalizeForSearch(t).includes(q))
        .sort((a, b) => a[0].localeCompare(b[0]));

      items.forEach(([topic, cnt]) => {
        const li = document.createElement("li");
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "browse-item-row";
        btn.innerHTML = `<span>${topic}</span><span class="browse-count">${cnt}</span>`;
        btn.addEventListener("click", () => {
          state.activeTopicBrowse = topic;
          state.activeBibleBook = "";
          state.activeRotationFilter = "";
          updateBrowseFilterUI();
          renderHymnList();
          closeBrowseModal();
        });
        li.appendChild(btn);
        frag.appendChild(li);
      });
    } else if (state.browseTab === "bible") {
      const counts = new Map();
      pool.forEach((h) => {
        const seen = new Set();
        h.scriptures.forEach((s) => {
          const bk = extractBibleBook(s);
          if (bk && !seen.has(bk)) {
            seen.add(bk);
            counts.set(bk, (counts.get(bk) || 0) + 1);
          }
        });
      });
      const items = Array.from(counts.entries())
        .filter(([bk]) => !q || normalizeForSearch(bk).includes(q))
        .sort((a, b) => {
          const ia = BIBLE_BOOK_ORDER.indexOf(a[0]);
          const ib = BIBLE_BOOK_ORDER.indexOf(b[0]);
          if (ia !== -1 && ib !== -1) return ia - ib;
          if (ia !== -1) return -1;
          if (ib !== -1) return 1;
          return a[0].localeCompare(b[0]);
        });

      items.forEach(([bk, cnt]) => {
        const li = document.createElement("li");
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "browse-item-row";
        btn.innerHTML = `<span>${bk}</span><span class="browse-count">${cnt}</span>`;
        btn.addEventListener("click", () => {
          state.activeBibleBook = bk;
          state.activeTopicBrowse = "";
          state.activeRotationFilter = "";
          updateBrowseFilterUI();
          renderHymnList();
          closeBrowseModal();
        });
        li.appendChild(btn);
        frag.appendChild(li);
      });
    } else {
      const due90 = pool.filter((h) => { const d = state.lastSungMap.get(h.id); return !d || daysSinceISO(d) >= 90; }).length;
      const due60 = pool.filter((h) => { const d = state.lastSungMap.get(h.id); return !d || daysSinceISO(d) >= 60; }).length;
      const never = pool.filter((h) => !state.lastSungMap.get(h.id)).length;
      const favDue90 = pool.filter((h) => state.favorites.has(h.id) && (!state.lastSungMap.get(h.id) || daysSinceISO(state.lastSungMap.get(h.id)) >= 90)).length;

      const options = [
        { key: "fav90", title: "Favorites Due for Rotation (90+ days)", sub: "Turns on ★ Favorites + Not sung in 90+ days", count: favDue90 },
        { key: "due90", title: "Not Sung in 90+ Days", sub: "Includes songs never logged", count: due90 },
        { key: "due60", title: "Not Sung in 60+ Days", sub: "Includes songs never logged", count: due60 },
        { key: "never", title: "Never Sung", sub: "Songs with no singing history yet", count: never },
      ];

      options.forEach((opt) => {
        const li = document.createElement("li");
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "browse-item-row";
        btn.innerHTML = `<span>${opt.title}<span class="browse-item-sub">${opt.sub}</span></span><span class="browse-count">${opt.count}</span>`;
        btn.addEventListener("click", () => {
          state.activeTopicBrowse = "";
          state.activeBibleBook = "";
          if (opt.key === "fav90") {
            state.onlyFavorites = true;
            el.favFilterBtn.classList.add("active");
            el.favFilterBtn.setAttribute("aria-pressed", "true");
            state.activeRotationFilter = "due90";
          } else {
            state.activeRotationFilter = opt.key;
          }
          updateBrowseFilterUI();
          renderHymnList();
          closeBrowseModal();
        });
        li.appendChild(btn);
        frag.appendChild(li);
      });
    }

    el.browseResultsList.appendChild(frag);
  }

  // =========================================================================
  // Singing History (Stage 4)
  // =========================================================================
  function saveHistory() {
    state.history.sort((a, b) => {
      const cmp = (b.date || "").localeCompare(a.date || "");
      if (cmp !== 0) return cmp;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
    saveJSON(STORAGE_KEYS.HISTORY, state.history);
    rebuildLastSungMap();
    refreshTagSelectorsAndStats();
    renderHymnList();
    renderHistoryTab();
    if (state.selectedId && state.hymnMap.has(state.selectedId)) {
      renderSongHistoryInDetail(state.hymnMap.get(state.selectedId));
    }
  }

  function logSongSung(hymnId, dateISO, serviceLabel = "") {
    const h = state.hymnMap.get(String(hymnId));
    if (!h) return;
    state.history.unshift({
      id: makeId("hist"),
      hymnId: h.id,
      date: dateISO || getTodayISO(),
      service: serviceLabel.trim(),
      createdAt: Date.now(),
    });
    saveHistory();
  }

  function deleteHistoryEntry(entryId) {
    state.history = state.history.filter((e) => e.id !== entryId);
    saveHistory();
  }

  function renderSongHistoryInDetail(hymn) {
    const entries = state.history.filter((e) => String(e.hymnId) === hymn.id);
    const lastDate = state.lastSungMap.get(hymn.id);

    if (lastDate) {
      const rec = formatRecency(lastDate);
      el.detailLastSungBadge.textContent = rec ? rec.text : `Last sung ${formatDisplayDate(lastDate)}`;
      el.detailLastSungBadge.classList.remove("hidden");
    } else {
      el.detailLastSungBadge.classList.add("hidden");
    }

    el.detailSongHistoryList.innerHTML = "";
    if (entries.length === 0) {
      el.songHistoryGroup.classList.add("hidden");
      return;
    }

    el.songHistoryGroup.classList.remove("hidden");
    entries.slice(0, 8).forEach((entry) => {
      const li = document.createElement("li");
      li.className = "song-history-item";

      const left = document.createElement("span");
      left.textContent = entry.service
        ? `${formatDisplayDate(entry.date)} · ${entry.service}`
        : formatDisplayDate(entry.date);

      const del = document.createElement("button");
      del.type = "button";
      del.className = "btn-history-del";
      del.textContent = "×";
      del.title = "Remove history entry";
      del.addEventListener("click", () => deleteHistoryEntry(entry.id));

      li.appendChild(left);
      li.appendChild(del);
      el.detailSongHistoryList.appendChild(li);
    });
  }

  function renderHistoryTab() {
    const q = normalizeForSearch(state.historyQuery);
    const filtered = state.history.filter((entry) => {
      const h = state.hymnMap.get(String(entry.hymnId));
      if (!h) return false;
      if (!q) return true;
      const hay = normalizeForSearch(`${h.number_str} ${h.title} ${h.alt_titles.join(" ")} ${entry.service || ""} ${entry.date || ""}`);
      return hay.includes(q);
    });

    el.historySummary.textContent = filtered.length
      ? `${filtered.length} logged song${filtered.length === 1 ? "" : "s"}`
      : "No matching history entries";

    el.historyList.innerHTML = "";
    if (filtered.length === 0) {
      el.historyEmpty.classList.remove("hidden");
      return;
    }
    el.historyEmpty.classList.add("hidden");

    // Group by date
    const groups = new Map();
    filtered.forEach((entry) => {
      const d = entry.date || "Unknown Date";
      if (!groups.has(d)) groups.set(d, []);
      groups.get(d).push(entry);
    });

    const frag = document.createDocumentFragment();
    groups.forEach((entries, dateISO) => {
      const groupDiv = document.createElement("div");
      groupDiv.className = "history-date-group";

      const heading = document.createElement("div");
      heading.className = "history-date-heading";
      const rec = formatRecency(dateISO);
      heading.innerHTML = `<span>${formatDisplayDate(dateISO)}</span><span>${rec ? rec.text : ""}</span>`;
      groupDiv.appendChild(heading);

      entries.forEach((entry) => {
        const h = state.hymnMap.get(String(entry.hymnId));
        if (!h) return;

        const row = document.createElement("div");
        row.className = "history-entry-row";

        const num = document.createElement("span");
        num.className = "history-entry-num";
        num.textContent = shouldShowBookBadgeForHymn(h) ? `${h.bookCode} #${h.number_str}` : `#${h.number_str}`;
        num.addEventListener("click", () => openSong(h.id));

        const info = document.createElement("div");
        info.className = "history-entry-info";
        info.addEventListener("click", () => openSong(h.id));

        const title = document.createElement("div");
        title.className = "history-entry-title";
        title.textContent = h.title;
        info.appendChild(title);

        if (entry.service) {
          const svc = document.createElement("div");
          svc.className = "history-entry-service";
          svc.textContent = entry.service;
          info.appendChild(svc);
        }

        const delBtn = document.createElement("button");
        delBtn.type = "button";
        delBtn.className = "btn-history-del";
        delBtn.textContent = "×";
        delBtn.title = "Delete history entry";
        delBtn.addEventListener("click", () => deleteHistoryEntry(entry.id));

        row.appendChild(num);
        row.appendChild(info);
        row.appendChild(delBtn);
        groupDiv.appendChild(row);
      });

      frag.appendChild(groupDiv);
    });

    el.historyList.appendChild(frag);
  }

  // =========================================================================
  // Modals: Add to Setlist, Song Picker, Mark as Sung
  // =========================================================================
  function openAddToSetlistModal(hymnId) {
    const hymn = state.hymnMap.get(String(hymnId));
    if (!hymn) return;

    el.addToSetlistSongLabel.textContent = `#${hymn.number_str} · ${hymn.title}`;
    el.targetSetlistSelect.innerHTML = "";

    const sorted = [...state.setlists].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    sorted.forEach((sl) => {
      const opt = document.createElement("option");
      opt.value = sl.id;
      opt.textContent = `${sl.name} (${formatDisplayDate(sl.date)})`;
      el.targetSetlistSelect.appendChild(opt);
    });

    const newOpt = document.createElement("option");
    newOpt.value = "__new__";
    newOpt.textContent = "+ Create New Service Setlist…";
    el.targetSetlistSelect.appendChild(newOpt);

    if (sorted.length === 0) {
      el.targetSetlistSelect.value = "__new__";
      el.inlineNewSetlistFields.classList.remove("hidden");
    } else {
      el.targetSetlistSelect.value = sorted[0].id;
      el.inlineNewSetlistFields.classList.add("hidden");
    }

    populateSlotSelect(el.targetSlotSelect);
    el.inlineSetlistName.value = "Sunday AM";
    el.inlineSetlistDate.value = getNextSundayISO();
    el.addToSetlistModal.classList.remove("hidden");
  }

  function closeAddToSetlistModal() {
    el.addToSetlistModal.classList.add("hidden");
  }

  function openSongPicker(mode) {
    state.pickerMode = mode; // 'setlist' | 'history'
    el.songPickerTitle.textContent = mode === "setlist" ? "Add Song to Service" : "Log Song to History";
    el.pickerSlotRow.classList.toggle("hidden", mode !== "setlist");
    if (mode === "setlist") populateSlotSelect(el.pickerSlotSelect);
    el.songPickerInput.value = "";
    renderSongPickerResults();
    el.songPickerModal.classList.remove("hidden");
    setTimeout(() => el.songPickerInput.focus(), 40);
  }

  function closeSongPicker() {
    el.songPickerModal.classList.add("hidden");
  }

  function renderSongPickerResults() {
    const q = el.songPickerInput.value;
    const matches = [];

    for (const h of state.hymns) {
      if (!state.showSupplement && isSupplement(h)) continue;
      const score = scoreHymnMatch(h, q);
      if (score > 0) matches.push({ hymn: h, score });
    }

    if (q.trim()) {
      matches.sort((a, b) => (b.score - a.score) || ((a.hymn.number ?? 999999) - (b.hymn.number ?? 999999)));
    }

    el.songPickerResults.innerHTML = "";
    const top = matches.slice(0, 60);
    const frag = document.createDocumentFragment();

    top.forEach(({ hymn: h }) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "picker-row";
      if (state.dontSing[h.id]) btn.classList.add("is-dontsing");
      if (isSupplement(h)) btn.classList.add("is-supplement");

      const num = document.createElement("span");
      num.className = "hymn-num";
      num.textContent = (state.dontSing[h.id] ? "⊘ " : "") + (isMultiBookActive() ? `${h.bookCode} ${h.number_str}` : h.number_str);

      const info = document.createElement("div");
      info.className = "hymn-info";
      const t = document.createElement("div");
      t.className = "hymn-title-line";
      t.textContent = h.title;
      info.appendChild(t);

      const lastDate = state.lastSungMap.get(h.id);
      if (lastDate) {
        const rec = formatRecency(lastDate);
        const sub = document.createElement("div");
        sub.className = "hymn-sub-line";
        sub.textContent = rec ? rec.text : "";
        info.appendChild(sub);
      }

      const key = document.createElement("span");
      key.className = "key-tag";
      key.textContent = formatKeyBadge(getSongBaseKey(h));

      btn.appendChild(num);
      btn.appendChild(info);
      btn.appendChild(key);

      btn.addEventListener("click", () => {
        if (state.pickerMode === "setlist") {
          const added = addHymnToSetlist(state.activeSetlistId, h.id, el.pickerSlotSelect.value);
          if (added) closeSongPicker();
        } else {
          closeSongPicker();
          openMarkSungModal(h.id);
        }
      });

      li.appendChild(btn);
      frag.appendChild(li);
    });

    el.songPickerResults.appendChild(frag);
  }

  let markSungTargetId = null;
  function openMarkSungModal(hymnId) {
    const h = state.hymnMap.get(String(hymnId));
    if (!h) return;
    markSungTargetId = h.id;
    el.markSungSongLabel.textContent = `#${h.number_str} · ${h.title}`;
    el.markSungDateInput.value = getTodayISO();
    el.markSungServiceInput.value = "Sunday AM";
    el.markSungModal.classList.remove("hidden");
  }

  function closeMarkSungModal() {
    el.markSungModal.classList.add("hidden");
    markSungTargetId = null;
  }

  // =========================================================================
  // Top-Center Anchored Zoom & Click-and-Drag Panning
  // =========================================================================
  function getNextZoomStop(current, direction) {
    if (direction > 0) {
      for (const s of ZOOM_STOPS) {
        if (s > current + 0.001) return s;
      }
      return ZOOM_STOPS[ZOOM_STOPS.length - 1];
    } else {
      for (let i = ZOOM_STOPS.length - 1; i >= 0; i--) {
        if (ZOOM_STOPS[i] < current - 0.001) return ZOOM_STOPS[i];
      }
      return ZOOM_STOPS[0];
    }
  }

  function applyCenteredZoom(viewport, pagesEl, resetBtn, level, isFs) {
    const prevLevel = isFs ? state.fsZoomLevel : state.zoomLevel;
    const clamped = Math.max(ZOOM_STOPS[0], Math.min(ZOOM_STOPS[ZOOM_STOPS.length - 1], level));

    const prevScrollWidth = viewport.scrollWidth;
    const clientWidth = viewport.clientWidth || 1;
    let centerRatio = 0.5;
    if (prevLevel > 1.0 && prevScrollWidth > clientWidth) {
      centerRatio = (viewport.scrollLeft + clientWidth / 2) / prevScrollWidth;
    }

    if (isFs) {
      state.fsZoomLevel = clamped;
    } else {
      state.zoomLevel = clamped;
    }

    const baseFitWidth = Math.max(240, clientWidth - 16);
    const targetWidthPx = Math.round(baseFitWidth * clamped);
    pagesEl.style.width = `${targetWidthPx}px`;

    const pct = `${Math.round(clamped * 100)}%`;
    resetBtn.textContent = clamped === 1.0 ? "Fit" : pct;

    const pannable = clamped > 1.0;
    viewport.classList.toggle("is-pannable", pannable);

    requestAnimationFrame(() => {
      const newScrollWidth = viewport.scrollWidth;
      if (newScrollWidth > clientWidth) {
        const targetScrollLeft = Math.round(centerRatio * newScrollWidth - clientWidth / 2);
        viewport.scrollLeft = Math.max(0, Math.min(newScrollWidth - clientWidth, targetScrollLeft));
      } else {
        viewport.scrollLeft = 0;
      }
    });
  }

  function enableDragPan(viewport) {
    let isDown = false;
    let startX = 0;
    let startY = 0;
    let startScrollLeft = 0;
    let startScrollTop = 0;

    viewport.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      if (viewport.scrollWidth <= viewport.clientWidth && viewport.scrollHeight <= viewport.clientHeight) return;

      isDown = true;
      startX = e.clientX;
      startY = e.clientY;
      startScrollLeft = viewport.scrollLeft;
      startScrollTop = viewport.scrollTop;
      viewport.classList.add("is-dragging");
      viewport.setPointerCapture(e.pointerId);
      e.preventDefault();
    });

    viewport.addEventListener("pointermove", (e) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      viewport.scrollLeft = startScrollLeft - dx;
      viewport.scrollTop = startScrollTop - dy;
    });

    const stopDrag = (e) => {
      if (!isDown) return;
      isDown = false;
      viewport.classList.remove("is-dragging");
      try {
        viewport.releasePointerCapture(e.pointerId);
      } catch (_) {}
    };

    viewport.addEventListener("pointerup", stopDrag);
    viewport.addEventListener("pointercancel", stopDrag);
  }

  // =========================================================================
  // Song Detail, Personalization & Sheet Music Viewer
  // =========================================================================
  function renderPersonalUI(hymn) {
    const isFav = state.favorites.has(hymn.id);
    el.detailFavBtn.textContent = isFav ? "★" : "☆";
    el.detailFavBtn.classList.toggle("is-fav", isFav);
    el.detailFavBtn.setAttribute("aria-pressed", String(isFav));

    const dsEntry = state.dontSing[hymn.id];
    const isDS = Boolean(dsEntry);
    el.dontSingCheckbox.checked = isDS;
    el.dontSingReasonInput.classList.toggle("hidden", !isDS);
    el.dontSingReasonInput.value = isDS ? (dsEntry.reason || "") : "";

    el.dontSingBanner.classList.toggle("hidden", !isDS);
    el.dontSingBannerReason.textContent =
      isDS && dsEntry.reason ? ` — ${dsEntry.reason}` : "";

    if (el.startNoteSelect) el.startNoteSelect.value = state.startNotes[hymn.id] || "";
    el.songNotesInput.value = state.notes[hymn.id] || "";

    el.detailCustomTags.innerHTML = "";
    const songTags = state.customTags[hymn.id] || [];
    songTags.forEach((tag) => {
      const chip = document.createElement("span");
      chip.className = "custom-tag-chip";

      const txt = document.createElement("span");
      txt.textContent = tag;

      const rm = document.createElement("button");
      rm.type = "button";
      rm.className = "custom-tag-remove";
      rm.setAttribute("aria-label", `Remove tag ${tag}`);
      rm.textContent = "×";
      rm.addEventListener("click", () => removeCustomTag(hymn.id, tag));

      chip.appendChild(txt);
      chip.appendChild(rm);
      el.detailCustomTags.appendChild(chip);
    });

    renderSongHistoryInDetail(hymn);
  }

  function toggleFavorite(hymnId) {
    if (state.favorites.has(hymnId)) {
      state.favorites.delete(hymnId);
    } else {
      state.favorites.add(hymnId);
    }
    saveJSON(STORAGE_KEYS.FAVORITES, Array.from(state.favorites));

    const hymn = state.hymnMap.get(hymnId);
    if (hymn && state.selectedId === hymnId) {
      renderPersonalUI(hymn);
    }
    refreshTagSelectorsAndStats();
    renderHymnList();
  }

  function addCustomTag(hymnId, rawTag) {
    const tag = rawTag.trim().replace(/\s+/g, " ");
    if (!tag) return;

    const current = state.customTags[hymnId] ? [...state.customTags[hymnId]] : [];
    const exists = current.some((t) => t.toLowerCase() === tag.toLowerCase());
    if (!exists) {
      current.push(tag);
      state.customTags[hymnId] = current;
      saveJSON(STORAGE_KEYS.CUSTOM_TAGS, state.customTags);
    }

    const hymn = state.hymnMap.get(hymnId);
    if (hymn && state.selectedId === hymnId) {
      renderPersonalUI(hymn);
    }
    refreshTagSelectorsAndStats();
    renderHymnList();
  }

  function removeCustomTag(hymnId, tagToRemove) {
    const current = state.customTags[hymnId] || [];
    const next = current.filter((t) => t !== tagToRemove);
    if (next.length > 0) {
      state.customTags[hymnId] = next;
    } else {
      delete state.customTags[hymnId];
    }
    saveJSON(STORAGE_KEYS.CUSTOM_TAGS, state.customTags);

    const hymn = state.hymnMap.get(hymnId);
    if (hymn && state.selectedId === hymnId) {
      renderPersonalUI(hymn);
    }
    refreshTagSelectorsAndStats();
    renderHymnList();
  }

  function openSong(hymnId, options = {}) {
    const hymn = state.hymnMap.get(String(hymnId));
    if (!hymn) return;

    if (!options.keepRunner) {
      exitRunner();
    }
    setElementRunnerMode(false);

    pitchPipe.stopSustained();
    pitchPipe.stopArpeggio();

    state.selectedId = hymn.id;
    state.highResLoaded = false;
    state.zoomLevel = 1.0;
    state.fsZoomLevel = 1.0;

    document.querySelectorAll(".hymn-row.selected").forEach((r) => r.classList.remove("selected"));
    const activeRow = el.hymnList.querySelector(`.hymn-row[data-id="${CSS.escape(hymn.id)}"]`);
    if (activeRow) activeRow.classList.add("selected");

    el.detailEmpty.classList.add("hidden");
    el.detailContent.classList.remove("hidden");
    el.songDetailPane.classList.add("mobile-open");

    const showDetailBook = shouldShowBookBadgeForHymn(hymn);
    el.detailBookBadge.textContent = hymn.bookCode || "PFTL";
    el.detailBookBadge.classList.toggle("hidden", !showDetailBook);
    el.detailNumber.textContent = `#${hymn.number_str}`;
    const baseKeyStr = getSongBaseKey(hymn);
    el.detailKeyBadge.textContent = baseKeyStr ? formatKeyBadge(baseKeyStr) : "No Key";
    el.detailHymnaryLink.href = hymn.hymnary_url || "#";

    if (el.detailListenBtn) {
      el.detailListenBtn.classList.toggle("hidden", !hymn.youtube_url);
    }

    if (el.detailHymnStudyLink) {
      if (hymn.hymnstudies_url) {
        el.detailHymnStudyLink.href = hymn.hymnstudies_url;
        el.detailHymnStudyLink.classList.remove("hidden");
      } else {
        el.detailHymnStudyLink.href = "#";
        el.detailHymnStudyLink.classList.add("hidden");
      }
    }

    el.supplementBanner.classList.toggle("hidden", !isSupplement(hymn));

    el.detailTitle.textContent = hymn.title;
    if (hymn.alt_titles.length > 0) {
      el.detailAltTitles.textContent = `Also known as: ${hymn.alt_titles.join(" · ")}`;
      el.detailAltTitles.classList.remove("hidden");
    } else {
      el.detailAltTitles.classList.add("hidden");
    }
    el.detailFirstLine.textContent = hymn.first_line ? `"${hymn.first_line}"` : "";

    renderPersonalUI(hymn);
    renderSheetMusic(hymn, isHymnHighResCached(hymn));
    renderMetadata(hymn);
    updatePitchUI();
    updateHymnNavButtons();

    el.detailScroll.scrollTop = 0;
  }

  function closeSongMobile() {
    pitchPipe.stopSustained();
    pitchPipe.stopArpeggio();
    closeFullscreen();
    el.songDetailPane.classList.remove("mobile-open");
  }

  function syncHighResButtons(status) {
    const btns = [el.loadHighResBtn, el.fsHighResBtn];
    btns.forEach((btn) => {
      if (status === "loading") {
        btn.disabled = true;
        btn.textContent = "Loading…";
        btn.classList.remove("loaded");
      } else if (status === "loaded") {
        btn.disabled = true;
        btn.textContent = "High-Res ✓";
        btn.classList.add("loaded");
      } else {
        btn.disabled = false;
        btn.textContent = "High-Res";
        btn.classList.remove("loaded");
      }
    });
  }

  function buildPageElements(hymn, urls, onLoad, onError) {
    const frag = document.createDocumentFragment();
    const totalPages = urls.length;

    urls.forEach((url, idx) => {
      const wrap = document.createElement("div");
      wrap.className = "sheet-page-wrap";

      const img = document.createElement("img");
      img.className = "sheet-page-img";
      img.alt = `${hymn.title} — Page ${idx + 1}`;
      img.loading = "eager";
      img.draggable = false;
      img.src = url;

      if (onLoad) img.addEventListener("load", onLoad);
      if (onError) img.addEventListener("error", onError);

      wrap.appendChild(img);

      if (totalPages > 1) {
        const cap = document.createElement("span");
        cap.className = "sheet-page-caption";
        cap.textContent = `Page ${idx + 1} of ${totalPages}`;
        wrap.appendChild(cap);
      }

      frag.appendChild(wrap);
    });

    return frag;
  }

  function renderSheetMusic(hymn, useHighRes) {
    el.sheetPages.innerHTML = "";
    el.sheetViewport.scrollLeft = 0;
    el.sheetViewport.scrollTop = 0;

    const bookHasScans = bookHasAnyScans(hymn.bookId);
    if (!bookHasScans && !hymn.has_scan) {
      el.sheetSection.classList.add("hidden");
      el.loadHighResBtn.classList.add("hidden");
      el.fullscreenBtn.classList.add("hidden");
      return;
    }
    el.sheetSection.classList.remove("hidden");

    if (!hymn.has_scan || hymn.scan_urls.length === 0) {
      el.sheetPages.classList.add("hidden");
      el.noScanFallback.classList.remove("hidden");
      el.loadHighResBtn.classList.add("hidden");
      el.fullscreenBtn.classList.add("hidden");
      el.fallbackHymnaryBtn.href = hymn.hymnary_url || "#";
      el.scanStatusLabel.textContent = "Sheet Music";
      return;
    }

    el.sheetPages.classList.remove("hidden");
    el.noScanFallback.classList.add("hidden");
    el.loadHighResBtn.classList.remove("hidden");
    el.fullscreenBtn.classList.remove("hidden");

    const urls = hymn.scan_urls.map((u) => (useHighRes ? u.replace("/low/", "/high/") : u));
    const totalPages = urls.length;

    if (useHighRes) {
      syncHighResButtons("loading");
      el.scanStatusLabel.textContent = "Loading High-Res (~15s)…";
    } else {
      syncHighResButtons("idle");
      el.scanStatusLabel.textContent = totalPages > 1 ? `Sheet Music (${totalPages} pages)` : "Sheet Music";
    }

    let loadedCount = 0;
    let failedCount = 0;

    const onLoad = () => {
      loadedCount++;
      if (useHighRes && loadedCount + failedCount === totalPages) {
        state.highResLoaded = true;
        urls.forEach((u) => state.cachedHighResUrls.add(u));
        syncHighResButtons("loaded");
        el.scanStatusLabel.textContent = totalPages > 1 ? `Sheet Music · High-Res (${totalPages} pages)` : "Sheet Music · High-Res";
        if (state.activeSetlistId) updatePrecacheButtonUI(getSetlistById(state.activeSetlistId));
      }
    };

    const onError = () => {
      failedCount++;
      if (failedCount === totalPages) {
        el.sheetPages.classList.add("hidden");
        el.noScanFallback.classList.remove("hidden");
        el.fallbackHymnaryBtn.href = hymn.hymnary_url || "#";
      }
    };

    el.sheetPages.appendChild(buildPageElements(hymn, urls, onLoad, onError));
    applyCenteredZoom(el.sheetViewport, el.sheetPages, el.zoomResetBtn, 1.0, false);

    if (state.isFullscreen) {
      el.fsPages.innerHTML = "";
      el.fsPages.appendChild(buildPageElements(hymn, urls));
      applyCenteredZoom(el.fsViewport, el.fsPages, el.fsZoomResetBtn, state.fsZoomLevel, true);
    }
  }

  function openFullscreen() {
    const hymn = state.hymnMap.get(state.selectedId);
    if (!hymn || !hymn.has_scan) return;

    state.isFullscreen = true;
    const showFsBook = shouldShowBookBadgeForHymn(hymn);
    el.fsBookBadge.textContent = hymn.bookCode || "PFTL";
    el.fsBookBadge.classList.toggle("hidden", !showFsBook);
    el.fsNumber.textContent = `#${hymn.number_str}`;
    el.fsTitle.textContent = hymn.title;

    const urls = hymn.scan_urls.map((u) => (state.highResLoaded ? u.replace("/low/", "/high/") : u));
    el.fsPages.innerHTML = "";
    el.fsPages.appendChild(buildPageElements(hymn, urls));

    el.fsOverlay.classList.remove("hidden");
    el.fsViewport.scrollTop = 0;
    el.fsViewport.scrollLeft = 0;

    requestAnimationFrame(() => {
      applyCenteredZoom(el.fsViewport, el.fsPages, el.fsZoomResetBtn, 1.0, true);
    });
    syncWakeLock();
  }

  function closeFullscreen() {
    if (!state.isFullscreen) return;
    state.isFullscreen = false;
    pitchPipe.stopSustained();
    pitchPipe.stopArpeggio();
    el.fsOverlay.classList.add("hidden");
    syncWakeLock();
  }

  function renderMetadata(hymn) {
    el.detailAlsoIn.innerHTML = "";
    if (Array.isArray(hymn.also_in) && hymn.also_in.length > 0) {
      el.alsoInGroup.classList.remove("hidden");
      hymn.also_in.forEach((ref) => {
        const meta = HYMNALS[ref.book];
        if (!meta) return;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "meta-tag also-in-btn";
        btn.title = `Open #${ref.num} in ${meta.name}`;
        btn.textContent = `${meta.code} #${ref.num}`;
        btn.addEventListener("click", async () => {
          await loadBook(ref.book);
          openSong(ref.id);
        });
        el.detailAlsoIn.appendChild(btn);
      });
    } else {
      el.alsoInGroup.classList.add("hidden");
    }

    el.detailTopics.innerHTML = "";
    el.detailScriptures.innerHTML = "";

    if (hymn.topics.length > 0) {
      el.topicsGroup.classList.remove("hidden");
      hymn.topics.forEach((t) => {
        const span = document.createElement("span");
        span.className = "meta-tag";
        span.textContent = t;
        el.detailTopics.appendChild(span);
      });
    } else {
      el.topicsGroup.classList.add("hidden");
    }

    if (hymn.scriptures.length > 0) {
      el.scripturesGroup.classList.remove("hidden");
      const verCfg = BIBLE_TRANSLATIONS[normalizeBibleVersion(state.bibleVersion)] || BIBLE_TRANSLATIONS.KJV;
      const isInline = verCfg.mode === "inline";

      hymn.scriptures.forEach((s) => {
        if (isInline) {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "meta-tag scripture-link";
          btn.title = `Read ${s} (${state.bibleVersion}) inline`;
          btn.textContent = s;
          btn.addEventListener("click", () => openScriptureInline(s, state.bibleVersion));
          el.detailScriptures.appendChild(btn);
        } else {
          const link = document.createElement("a");
          link.className = "meta-tag scripture-link";
          link.href = buildBibleComUrl(s, state.bibleVersion);
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.title = `Read ${s} (${state.bibleVersion}) on Bible.com`;

          const txt = document.createElement("span");
          txt.textContent = s;
          const arr = document.createElement("span");
          arr.className = "scripture-link-arrow";
          arr.setAttribute("aria-hidden", "true");
          arr.textContent = "↗";

          link.appendChild(txt);
          link.appendChild(arr);
          el.detailScriptures.appendChild(link);
        }
      });
    } else {
      el.scripturesGroup.classList.add("hidden");
    }
  }

  // =========================================================================
  // Backup & Restore (JSON — includes Setlists & History)
  // =========================================================================
  function showBackupStatus(msg) {
    el.backupStatusMsg.textContent = msg;
    el.backupStatusMsg.classList.remove("hidden");
  }

  function exportBackup() {
    const payload = {
      app: "pftl-song-leader",
      version: 2,
      exportedAt: new Date().toISOString(),
      data: {
        favorites: Array.from(state.favorites),
        customTags: state.customTags,
        dontSing: state.dontSing,
        notes: state.notes,
        transpositions: state.transpositions,
        manualKeys: state.manualKeys,
        startNotes: state.startNotes,
        startNoteDisplay: state.startNoteDisplay,
        keepAwake: state.keepAwake,
        setlists: state.setlists,
        history: state.history,
        showSupplement: state.showSupplement,
        darkMode: state.darkMode,
        readability: state.readability,
        bibleVersion: state.bibleVersion,
        primaryHymnal: state.primaryHymnal,
        multiBookMode: state.multiBookMode,
        enabledHymnals: state.enabledHymnals,
        worshipElementsEnabled: state.worshipElementsEnabled,
        customSongRoles: state.customSongRoles,
        hiddenDefaultRoles: state.hiddenDefaultRoles,
      },
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const dateStr = getTodayISO();
    const a = document.createElement("a");
    a.href = url;
    a.download = `pftl_backup_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    showBackupStatus(`Exported backup to pftl_backup_${dateStr}.json`);
  }

  function importBackupFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const d = parsed && parsed.data ? parsed.data : parsed;
        if (!d || typeof d !== "object") throw new Error("Invalid backup structure");

        if (Array.isArray(d.favorites)) {
          state.favorites = new Set(d.favorites.map(String));
          saveJSON(STORAGE_KEYS.FAVORITES, Array.from(state.favorites));
        }
        if (d.customTags && typeof d.customTags === "object") {
          state.customTags = d.customTags;
          saveJSON(STORAGE_KEYS.CUSTOM_TAGS, state.customTags);
        }
        if (d.dontSing && typeof d.dontSing === "object") {
          state.dontSing = d.dontSing;
          saveJSON(STORAGE_KEYS.DONT_SING, state.dontSing);
        }
        if (d.notes && typeof d.notes === "object") {
          state.notes = d.notes;
          saveJSON(STORAGE_KEYS.NOTES, state.notes);
        }
        if (d.transpositions && typeof d.transpositions === "object") {
          state.transpositions = d.transpositions;
          saveJSON(STORAGE_KEYS.TRANSPOSITIONS, state.transpositions);
        }
        if (d.manualKeys && typeof d.manualKeys === "object") {
          state.manualKeys = d.manualKeys;
          saveJSON(STORAGE_KEYS.MANUAL_KEYS, state.manualKeys);
        }
        if (d.startNotes && typeof d.startNotes === "object") {
          state.startNotes = d.startNotes;
          saveJSON(STORAGE_KEYS.START_NOTES, state.startNotes);
        }
        if (typeof d.keepAwake === "boolean") {
          state.keepAwake = d.keepAwake;
          if (el.wakeLockToggle) el.wakeLockToggle.checked = state.keepAwake;
          localStorage.setItem(STORAGE_KEYS.WAKE_LOCK, String(state.keepAwake));
        }
        if (Array.isArray(d.setlists)) {
          state.setlists = d.setlists;
          saveJSON(STORAGE_KEYS.SETLISTS, state.setlists);
        }
        if (Array.isArray(d.history)) {
          state.history = d.history;
          saveJSON(STORAGE_KEYS.HISTORY, state.history);
        }
        if (typeof d.showSupplement === "boolean") {
          state.showSupplement = d.showSupplement;
          el.showSupplementToggle.checked = state.showSupplement;
          localStorage.setItem(STORAGE_KEYS.SHOW_SUPPLEMENT, String(state.showSupplement));
        }
        if (typeof d.darkMode === "boolean") {
          state.darkMode = d.darkMode;
          localStorage.setItem(STORAGE_KEYS.DARK_MODE, String(state.darkMode));
          applyTheme();
        }
        if (d.readability === "large" || d.readability === "small") {
          state.readability = d.readability;
          localStorage.setItem(STORAGE_KEYS.READABILITY, state.readability);
          applyReadability();
        }
        if (d.startNoteDisplay === "numbers" || d.startNoteDisplay === "solfege") {
          state.startNoteDisplay = d.startNoteDisplay;
          if (el.startNoteDisplaySelect) el.startNoteDisplaySelect.value = state.startNoteDisplay;
          localStorage.setItem(STORAGE_KEYS.START_NOTE_DISPLAY, state.startNoteDisplay);
        }
        if (typeof d.bibleVersion === "string" && d.bibleVersion.trim()) {
          state.bibleVersion = normalizeBibleVersion(d.bibleVersion);
          el.bibleVersionSelect.value = state.bibleVersion;
          localStorage.setItem(STORAGE_KEYS.BIBLE_VERSION, state.bibleVersion);
        }
        if (typeof d.primaryHymnal === "string" && HYMNALS[d.primaryHymnal]) {
          state.primaryHymnal = d.primaryHymnal;
          localStorage.setItem(STORAGE_KEYS.PRIMARY_HYMNAL, state.primaryHymnal);
        }
        if (typeof d.multiBookMode === "boolean") {
          state.multiBookMode = d.multiBookMode;
          localStorage.setItem(STORAGE_KEYS.MULTI_BOOK, String(state.multiBookMode));
        }
        if (Array.isArray(d.enabledHymnals) && d.enabledHymnals.length > 0) {
          state.enabledHymnals = d.enabledHymnals.filter((id) => Boolean(HYMNALS[id]));
          saveJSON(STORAGE_KEYS.ENABLED_HYMNALS, state.enabledHymnals);
        }
        if (typeof d.worshipElementsEnabled === "boolean") {
          state.worshipElementsEnabled = d.worshipElementsEnabled;
          localStorage.setItem(STORAGE_KEYS.WORSHIP_ELEMENTS_ENABLED, String(state.worshipElementsEnabled));
        }
        if (Array.isArray(d.customSongRoles)) {
          state.customSongRoles = d.customSongRoles.filter((r) => typeof r === "string" && r.trim()).slice(0, MAX_CUSTOM_ROLES);
          saveJSON(STORAGE_KEYS.CUSTOM_SONG_ROLES, state.customSongRoles);
        }
        if (Array.isArray(d.hiddenDefaultRoles)) {
          state.hiddenDefaultRoles = d.hiddenDefaultRoles.filter((r) => typeof r === "string");
          saveJSON(STORAGE_KEYS.HIDDEN_DEFAULT_ROLES, state.hiddenDefaultRoles);
        }
        syncRoleDropdowns();
        syncSetlistFooterElementsUI();

        rebuildLastSungMap();
        updateHeaderSubtitle();
        refreshTagSelectorsAndStats();
        renderHymnList();
        renderSetlistsHome();
        renderHistoryTab();
        if (state.activeSetlistId) renderSetlistEditor();
        if (state.selectedId && state.hymnMap.has(state.selectedId)) {
          renderPersonalUI(state.hymnMap.get(state.selectedId));
          updatePitchUI();
        }

        showBackupStatus("Backup restored successfully!");
      } catch (err) {
        showBackupStatus("Import failed: " + err.message);
      }
    };
    reader.readAsText(file);
  }

  function resetAllPersonalData() {
    const ok = window.confirm(
      "Clear all Favorites, Custom Tags, Don't Sing flags, Personal Notes, Transpositions, Setlists, and Singing History on this device? This cannot be undone unless you exported a backup."
    );
    if (!ok) return;

    state.favorites = new Set();
    state.customTags = {};
    state.dontSing = {};
    state.notes = {};
    state.transpositions = {};
    state.manualKeys = {};
    state.startNotes = {};
    state.setlists = [];
    state.history = [];
    state.activeSetlistId = null;
    state.worshipElementsEnabled = false;
    state.customSongRoles = [];
    state.hiddenDefaultRoles = [];
    exitRunner();

    saveJSON(STORAGE_KEYS.FAVORITES, []);
    saveJSON(STORAGE_KEYS.CUSTOM_TAGS, {});
    saveJSON(STORAGE_KEYS.DONT_SING, {});
    saveJSON(STORAGE_KEYS.NOTES, {});
    saveJSON(STORAGE_KEYS.TRANSPOSITIONS, {});
    saveJSON(STORAGE_KEYS.MANUAL_KEYS, {});
    saveJSON(STORAGE_KEYS.START_NOTES, {});
    saveJSON(STORAGE_KEYS.SETLISTS, []);
    saveJSON(STORAGE_KEYS.HISTORY, []);
    localStorage.setItem(STORAGE_KEYS.WORSHIP_ELEMENTS_ENABLED, "false");
    saveJSON(STORAGE_KEYS.CUSTOM_SONG_ROLES, []);
    saveJSON(STORAGE_KEYS.HIDDEN_DEFAULT_ROLES, []);
    syncRoleDropdowns();
    syncSetlistFooterElementsUI();

    rebuildLastSungMap();
    refreshTagSelectorsAndStats();
    renderHymnList();
    closeSetlistEditor();
    renderHistoryTab();
    if (state.selectedId && state.hymnMap.has(state.selectedId)) {
      renderPersonalUI(state.hymnMap.get(state.selectedId));
      updatePitchUI();
    }
    showBackupStatus("All personal data has been reset.");
  }

  // =========================================================================
  // Pitch Pipe UI & Transposition Logic
  // =========================================================================
  function getActivePitchInfo() {
    const hymn = state.hymnMap.get(state.selectedId);
    const listedParsed = hymn ? parseKeyString(hymn.key) : null;
    const savedManualStr = hymn ? (state.manualKeys[hymn.id] || "") : "";
    const savedManualParsed = parseKeyString(savedManualStr);
    const base = listedParsed || savedManualParsed || parseKeyString(state.manualKey) || { semitone: 0, isMinor: false };
    const shift = hymn ? (state.transpositions[hymn.id] || 0) : 0;
    const transposedSemitone = ((base.semitone + shift) % 12 + 12) % 12;
    const noteName = SEMITONE_TO_NAME[transposedSemitone];

    return {
      hasListedKey: Boolean(listedParsed),
      hasSavedManualKey: Boolean(savedManualParsed),
      savedManualKey: savedManualStr,
      semitone: transposedSemitone,
      noteName,
      isMinor: base.isMinor,
      displayKey: base.isMinor ? `${noteName} Min` : noteName,
      shift,
    };
  }

  function updatePitchUI() {
    const info = getActivePitchInfo();

    el.manualKeyWrap.classList.toggle("hidden", info.hasListedKey);
    if (!info.hasListedKey && el.manualKeySelect) {
      el.manualKeySelect.value = info.hasSavedManualKey ? info.savedManualKey : "";
    }

    let subLabel = "Original";
    if (!info.hasListedKey) {
      if (info.shift !== 0) {
        subLabel = info.shift > 0 ? `+${info.shift}` : `${info.shift}`;
      } else {
        subLabel = info.hasSavedManualKey ? "Saved" : "Manual";
      }
    } else if (info.shift !== 0) {
      subLabel = info.shift > 0 ? `+${info.shift}` : `${info.shift}`;
    }

    el.holdPitchKey.textContent = info.displayKey;
    el.holdPitchSub.textContent = subLabel;

    el.fsPitchKey.textContent = info.displayKey;
    el.fsPitchSub.textContent = subLabel === "Original" ? "Orig" : subLabel;

    el.stepButtons.forEach((btn) => {
      const val = Number(btn.dataset.shift);
      btn.classList.toggle("active", val === info.shift);
    });

    const snKey = state.selectedId ? (state.startNotes[state.selectedId] || "") : "";
    const snDef = START_NOTE_DEFS[snKey];
    [el.startNoteBtn, el.fsStartNoteBtn].forEach((btn) => {
      if (!btn) return;
      if (snDef) {
        const snLabel = state.startNoteDisplay === "numbers" ? snDef.numLabel : snDef.label;
        btn.textContent = `♪ ${snLabel}`;
        btn.classList.remove("hidden");
      } else {
        btn.classList.add("hidden");
      }
    });
  }

  // =========================================================================
  // Quick-Jump Modal
  // =========================================================================
  function openQuickJump() {
    el.quickJumpError.classList.add("hidden");
    el.quickJumpChoices.classList.add("hidden");
    el.quickJumpChoices.innerHTML = "";
    el.quickJumpInput.value = "";
    el.quickJumpModal.classList.remove("hidden");
    setTimeout(() => el.quickJumpInput.focus(), 40);
  }

  function closeQuickJump() {
    el.quickJumpModal.classList.add("hidden");
  }

  function handleQuickJumpSubmit(e) {
    e.preventDefault();
    const raw = el.quickJumpInput.value.trim();
    if (!raw) return;

    el.quickJumpError.classList.add("hidden");
    el.quickJumpChoices.classList.add("hidden");
    el.quickJumpChoices.innerHTML = "";

    const rawLower = raw.toLowerCase();
    const normNum = String(parseInt(raw, 10));
    const activeIds = getActiveBookIds();

    const matches = state.hymns.filter((h) => {
      if (!activeIds.includes(h.bookId)) return false;
      return h._numStr === rawLower || (normNum !== "NaN" && h._numStr === normNum);
    });

    if (matches.length === 0) {
      const scopeName = isMultiBookActive() ? "your enabled hymnals" : (HYMNALS[state.primaryHymnal]?.name || "the hymnal");
      el.quickJumpError.textContent = `Hymn #${raw} was not found in ${scopeName}.`;
      el.quickJumpError.classList.remove("hidden");
      return;
    }

    if (matches.length === 1) {
      closeQuickJump();
      switchTab("hymnal");
      openSong(matches[0].id);
      return;
    }

    // Multiple books contain this number — show quick picker
    matches.forEach((h) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "qj-choice-btn";

      const badge = document.createElement("span");
      badge.className = "book-badge";
      badge.textContent = h.bookCode;

      const title = document.createElement("span");
      title.className = "qj-choice-title";
      title.textContent = `#${h.number_str} · ${h.title}`;

      btn.appendChild(badge);
      btn.appendChild(title);
      btn.addEventListener("click", () => {
        closeQuickJump();
        switchTab("hymnal");
        openSong(h.id);
      });
      el.quickJumpChoices.appendChild(btn);
    });
    el.quickJumpChoices.classList.remove("hidden");
  }

  // =========================================================================
  // Navigation
  // =========================================================================
  function switchTab(tabName) {
    state.activeTab = tabName;
    el.navItems.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === tabName);
    });
    Object.entries(el.tabPanes).forEach(([key, pane]) => {
      pane.classList.toggle("active-tab", key === tabName);
    });
    if (tabName === "settings") {
      refreshTagSelectorsAndStats();
    } else if (tabName === "setlists") {
      renderSetlistsHome();
      if (state.activeSetlistId) renderSetlistEditor();
    } else if (tabName === "history") {
      renderHistoryTab();
    }
  }

  // =========================================================================
  // Event Binding
  // =========================================================================
  function bindHoldButton(btn) {
    const startHold = (e) => {
      e.preventDefault();
      const info = getActivePitchInfo();
      btn.classList.add("playing");
      el.arpeggioBtn.classList.remove("playing");
      pitchPipe.startSustained(info.semitone);
    };

    const endHold = () => {
      if (!btn.classList.contains("playing")) return;
      btn.classList.remove("playing");
      pitchPipe.stopSustained();
    };

    btn.addEventListener("pointerdown", startHold);
    btn.addEventListener("pointerup", endHold);
    btn.addEventListener("pointercancel", endHold);
    btn.addEventListener("pointerleave", endHold);
    btn.addEventListener("contextmenu", (e) => e.preventDefault());
    window.addEventListener("pointerup", endHold);
    window.addEventListener("blur", endHold);
  }

  function bindEvents() {
    // Search & Filters
    el.searchInput.addEventListener("input", () => {
      state.searchQuery = el.searchInput.value;
      el.clearSearchBtn.classList.toggle("hidden", !state.searchQuery);
      renderHymnList();
    });

    [el.searchInput, el.historySearchInput, el.songPickerInput].forEach((inp) => {
      if (!inp) return;
      inp.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          inp.blur();
        }
      });
    });

    el.clearSearchBtn.addEventListener("click", () => {
      state.searchQuery = "";
      el.searchInput.value = "";
      el.clearSearchBtn.classList.add("hidden");
      renderHymnList();
      el.searchInput.focus();
    });

    el.topicTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const cat = tab.dataset.category;
        state.topicCategory = (cat !== "all" && state.topicCategory === cat) ? "all" : cat;
        el.topicTabs.forEach((t) => {
          const active = t.dataset.category === state.topicCategory;
          t.classList.toggle("active", active);
          t.setAttribute("aria-selected", String(active));
        });
        renderHymnList();
      });
    });

    el.favFilterBtn.addEventListener("click", () => {
      state.onlyFavorites = !state.onlyFavorites;
      el.favFilterBtn.classList.toggle("active", state.onlyFavorites);
      el.favFilterBtn.setAttribute("aria-pressed", String(state.onlyFavorites));
      renderHymnList();
    });

    el.scansFilterBtn.addEventListener("click", () => {
      state.onlyWithScans = !state.onlyWithScans;
      el.scansFilterBtn.classList.toggle("active", state.onlyWithScans);
      el.scansFilterBtn.setAttribute("aria-pressed", String(state.onlyWithScans));
      renderHymnList();
    });

    el.browseFiltersBtn.addEventListener("click", openBrowseModal);
    el.clearBrowseFilterBtn.addEventListener("click", clearBrowseFilters);
    el.closeBrowseModalBtn.addEventListener("click", closeBrowseModal);
    el.browseModal.addEventListener("click", (e) => {
      if (e.target === el.browseModal) closeBrowseModal();
    });
    el.browseTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        state.browseTab = tab.dataset.browseTab;
        el.browseSearchInput.value = "";
        renderBrowseModalContent();
      });
    });
    el.browseSearchInput.addEventListener("input", renderBrowseModalContent);

    el.tagFilterSelect.addEventListener("change", () => {
      state.activeCustomTag = el.tagFilterSelect.value;
      el.clearTagFilterBtn.classList.toggle("hidden", !state.activeCustomTag);
      renderHymnList();
    });

    el.clearTagFilterBtn.addEventListener("click", () => {
      state.activeCustomTag = "";
      el.tagFilterSelect.value = "";
      el.clearTagFilterBtn.classList.add("hidden");
      renderHymnList();
    });

    // Setlists Tab Events
    if (el.setlistSettingsBtn) {
      el.setlistSettingsBtn.addEventListener("click", openSetlistSettings);
    }
    if (el.backFromSetlistSettingsBtn) {
      el.backFromSetlistSettingsBtn.addEventListener("click", closeSetlistSettings);
    }
    if (el.enableWorshipElementsToggle) {
      el.enableWorshipElementsToggle.addEventListener("change", () => {
        state.worshipElementsEnabled = el.enableWorshipElementsToggle.checked;
        saveSetlistSettings();
      });
    }
    if (el.addCustomRoleForm) {
      el.addCustomRoleForm.addEventListener("submit", (e) => {
        e.preventDefault();
        if (state.customSongRoles.length >= MAX_CUSTOM_ROLES) {
          showCustomRoleError(`You can create up to ${MAX_CUSTOM_ROLES} custom song roles.`);
          return;
        }
        const check = validateCustomRoleName(el.newCustomRoleInput.value);
        if (!check.ok) {
          showCustomRoleError(check.error);
          return;
        }
        state.customSongRoles.push(check.value);
        el.newCustomRoleInput.value = "";
        showCustomRoleError("");
        saveSetlistSettings();
        renderSetlistSettings();
      });
    }
    if (el.addElementToSetlistBtn) {
      el.addElementToSetlistBtn.addEventListener("click", openElementPickerModal);
    }
    if (el.closeElementPickerBtn) {
      el.closeElementPickerBtn.addEventListener("click", closeElementPickerModal);
    }
    if (el.elementPickerModal) {
      el.elementPickerModal.addEventListener("click", (e) => {
        if (e.target === el.elementPickerModal) closeElementPickerModal();
      });
    }

    el.newSetlistBtn.addEventListener("click", () => {
      const sl = createSetlist("Sunday AM", getNextSundayISO());
      openSetlistEditor(sl.id);
    });

    el.setlistsList.addEventListener("click", (e) => {
      const card = e.target.closest(".setlist-card");
      if (!card) return;
      openSetlistEditor(card.dataset.setlistId);
    });

    el.backToSetlistsBtn.addEventListener("click", closeSetlistEditor);

    el.setlistNameInput.addEventListener("input", () => {
      const sl = getSetlistById(state.activeSetlistId);
      if (!sl) return;
      sl.name = el.setlistNameInput.value;
      saveSetlists();
      updateRunnerBar();
    });

    el.setlistDateInput.addEventListener("change", () => {
      const sl = getSetlistById(state.activeSetlistId);
      if (!sl) return;
      sl.date = el.setlistDateInput.value;
      saveSetlists();
    });

    el.setlistNotesInput.addEventListener("input", () => {
      const sl = getSetlistById(state.activeSetlistId);
      if (!sl) return;
      sl.notes = el.setlistNotesInput.value;
      saveSetlists();
    });

    el.addSongToSetlistBtn.addEventListener("click", () => openSongPicker("setlist"));
    el.precacheHighResBtn.addEventListener("click", () => {
      if (state.activeSetlistId) precacheSetlistHighRes(state.activeSetlistId);
    });

    el.copySetlistBtn.addEventListener("click", () => {
      if (state.activeSetlistId) copySetlistToClipboard(state.activeSetlistId);
    });
    el.startPodiumBtn.addEventListener("click", () => {
      if (state.activeSetlistId) startPodiumAt(state.activeSetlistId, 0);
    });

    el.logSetlistSungBtn.addEventListener("click", () => {
      const sl = getSetlistById(state.activeSetlistId);
      if (!sl) return;
      const songItems = (sl.items || []).filter((it) => !isWorshipElementItem(it) && it.hymnId);
      if (songItems.length === 0) return;

      if (sl.loggedAt) {
        const ok = window.confirm("This service was already logged to history. Log all songs again?");
        if (!ok) return;
      }

      const dateISO = sl.date || getTodayISO();
      const serviceLabel = sl.name || "Worship Service";
      songItems.forEach((it) => {
        state.history.unshift({
          id: makeId("hist"),
          hymnId: String(it.hymnId),
          date: dateISO,
          service: serviceLabel,
          createdAt: Date.now(),
        });
      });
      sl.loggedAt = new Date().toISOString();
      saveSetlists();
      saveHistory();
      renderSetlistEditor();

      el.setlistStatusMsg.textContent = `Logged ${songItems.length} song${songItems.length === 1 ? "" : "s"} to History (${formatDisplayDate(dateISO)}).`;
      el.setlistStatusMsg.classList.remove("hidden");
    });

    el.deleteSetlistBtn.addEventListener("click", () => {
      const sl = getSetlistById(state.activeSetlistId);
      if (!sl) return;
      if (!window.confirm(`Delete setlist "${sl.name || "Untitled Service"}"?`)) return;
      state.setlists = state.setlists.filter((s) => s.id !== sl.id);
      if (state.runner && state.runner.setlistId === sl.id) exitRunner();
      saveSetlists();
      closeSetlistEditor();
    });

    // Podium Runner Bar
    el.runnerPrevBtn.addEventListener("click", () => {
      if (!state.runner || state.runner.index <= 0) return;
      startPodiumAt(state.runner.setlistId, state.runner.index - 1);
    });

    el.runnerNextBtn.addEventListener("click", () => {
      if (!state.runner) return;
      const sl = getSetlistById(state.runner.setlistId);
      if (!sl || state.runner.index >= sl.items.length - 1) return;
      startPodiumAt(state.runner.setlistId, state.runner.index + 1);
    });

    el.runnerCloseBtn.addEventListener("click", exitRunner);

    // History Tab Events
    el.logSongHistoryBtn.addEventListener("click", () => openSongPicker("history"));
    el.historySearchInput.addEventListener("input", () => {
      state.historyQuery = el.historySearchInput.value;
      renderHistoryTab();
    });

    // Song Detail Quick Actions (+ Setlist & Mark Sung)
    el.detailAddSetlistBtn.addEventListener("click", () => {
      if (state.selectedId) openAddToSetlistModal(state.selectedId);
    });

    el.detailMarkSungBtn.addEventListener("click", () => {
      if (state.selectedId) openMarkSungModal(state.selectedId);
    });

    if (el.detailListenBtn) {
      el.detailListenBtn.addEventListener("click", () => {
        if (!state.selectedId) return;
        const h = state.hymnMap.get(state.selectedId);
        if (h && h.youtube_url) openListenModal(h);
      });
    }
    if (el.closeListenModalBtn) el.closeListenModalBtn.addEventListener("click", closeListenModal);
    if (el.listenModal) {
      el.listenModal.addEventListener("click", (e) => {
        if (e.target === el.listenModal) closeListenModal();
      });
    }

    // Add to Setlist Modal
    el.targetSetlistSelect.addEventListener("change", () => {
      el.inlineNewSetlistFields.classList.toggle("hidden", el.targetSetlistSelect.value !== "__new__");
    });
    el.closeAddToSetlistBtn.addEventListener("click", closeAddToSetlistModal);
    el.cancelAddToSetlistBtn.addEventListener("click", closeAddToSetlistModal);
    el.addToSetlistModal.addEventListener("click", (e) => {
      if (e.target === el.addToSetlistModal) closeAddToSetlistModal();
    });
    el.addToSetlistForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!state.selectedId) return;
      let targetId = el.targetSetlistSelect.value;
      if (targetId === "__new__") {
        const sl = createSetlist(el.inlineSetlistName.value, el.inlineSetlistDate.value);
        targetId = sl.id;
      }
      const added = addHymnToSetlist(targetId, state.selectedId, el.targetSlotSelect.value);
      if (added) closeAddToSetlistModal();
    });

    // Song Picker Modal
    el.closeSongPickerBtn.addEventListener("click", closeSongPicker);
    el.songPickerModal.addEventListener("click", (e) => {
      if (e.target === el.songPickerModal) closeSongPicker();
    });
    el.songPickerInput.addEventListener("input", renderSongPickerResults);

    // Mark as Sung Modal
    el.closeMarkSungBtn.addEventListener("click", closeMarkSungModal);
    el.cancelMarkSungBtn.addEventListener("click", closeMarkSungModal);
    el.markSungModal.addEventListener("click", (e) => {
      if (e.target === el.markSungModal) closeMarkSungModal();
    });
    el.markSungForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!markSungTargetId) return;
      logSongSung(markSungTargetId, el.markSungDateInput.value, el.markSungServiceInput.value);
      closeMarkSungModal();
    });

    // Settings: Hymnal Selection & Multi-Book Mode
    el.primaryHymnalSelect.addEventListener("change", () => {
      state.primaryHymnal = el.primaryHymnalSelect.value;
      try {
        localStorage.setItem(STORAGE_KEYS.PRIMARY_HYMNAL, state.primaryHymnal);
      } catch (_) {}
      syncActiveBooks();
    });

    el.multiBookToggle.addEventListener("change", () => {
      state.multiBookMode = el.multiBookToggle.checked;
      if (state.multiBookMode && (!Array.isArray(state.enabledHymnals) || state.enabledHymnals.length === 0)) {
        state.enabledHymnals = [state.primaryHymnal];
        saveJSON(STORAGE_KEYS.ENABLED_HYMNALS, state.enabledHymnals);
      }
      try {
        localStorage.setItem(STORAGE_KEYS.MULTI_BOOK, String(state.multiBookMode));
      } catch (_) {}
      syncActiveBooks();
    });

    el.multiBookCheckboxes.forEach((cb) => {
      cb.addEventListener("change", () => {
        const checked = el.multiBookCheckboxes.filter((c) => c.checked).map((c) => c.value);
        if (checked.length === 0) {
          // Keep at least one book enabled
          cb.checked = true;
          return;
        }
        state.enabledHymnals = checked;
        saveJSON(STORAGE_KEYS.ENABLED_HYMNALS, state.enabledHymnals);
        syncActiveBooks();
      });
    });

    el.bookFilterSelect.addEventListener("change", () => {
      state.activeBookFilter = el.bookFilterSelect.value;
      renderHymnList();
    });

    // Settings & Backup
    el.darkModeToggle.checked = state.darkMode;
    el.darkModeToggle.addEventListener("change", () => {
      state.darkMode = el.darkModeToggle.checked;
      try {
        localStorage.setItem(STORAGE_KEYS.DARK_MODE, String(state.darkMode));
      } catch (_) {}
      applyTheme();
    });

    if (el.wakeLockToggle) {
      el.wakeLockToggle.checked = state.keepAwake;
      el.wakeLockToggle.addEventListener("change", () => {
        state.keepAwake = el.wakeLockToggle.checked;
        try {
          localStorage.setItem(STORAGE_KEYS.WAKE_LOCK, String(state.keepAwake));
        } catch (_) {}
        syncWakeLock();
      });
    }
    document.addEventListener("visibilitychange", syncWakeLock);

    el.readabilitySelect.value = state.readability;
    el.readabilitySelect.addEventListener("change", () => {
      state.readability = el.readabilitySelect.value === "large" ? "large" : "small";
      try {
        localStorage.setItem(STORAGE_KEYS.READABILITY, state.readability);
      } catch (_) {}
      applyReadability();
      if (state.selectedId && !el.sheetPages.classList.contains("hidden")) {
        applyCenteredZoom(el.sheetViewport, el.sheetPages, el.zoomResetBtn, state.zoomLevel, false);
      }
    });

    if (el.startNoteDisplaySelect) {
      el.startNoteDisplaySelect.value = state.startNoteDisplay;
      el.startNoteDisplaySelect.addEventListener("change", () => {
        state.startNoteDisplay = el.startNoteDisplaySelect.value === "numbers" ? "numbers" : "solfege";
        try {
          localStorage.setItem(STORAGE_KEYS.START_NOTE_DISPLAY, state.startNoteDisplay);
        } catch (_) {}
        updatePitchUI();
      });
    }

    el.bibleVersionSelect.value = state.bibleVersion;
    el.bibleVersionSelect.addEventListener("change", () => {
      state.bibleVersion = normalizeBibleVersion(el.bibleVersionSelect.value);
      try {
        localStorage.setItem(STORAGE_KEYS.BIBLE_VERSION, state.bibleVersion);
      } catch (_) {}
      if (state.selectedId && state.hymnMap.has(state.selectedId)) {
        renderMetadata(state.hymnMap.get(state.selectedId));
      }
    });

    el.showSupplementToggle.checked = state.showSupplement;
    el.showSupplementToggle.addEventListener("change", () => {
      state.showSupplement = el.showSupplementToggle.checked;
      try {
        localStorage.setItem(STORAGE_KEYS.SHOW_SUPPLEMENT, String(state.showSupplement));
      } catch (_) {}
      updateHeaderSubtitle();
      renderHymnList();
      updateHymnNavButtons();
    });

    el.exportBackupBtn.addEventListener("click", exportBackup);
    el.importBackupInput.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) importBackupFile(file);
      e.target.value = "";
    });
    el.clearDataBtn.addEventListener("click", resetAllPersonalData);

    // List click delegation
    el.hymnList.addEventListener("click", (e) => {
      const row = e.target.closest(".hymn-row");
      if (!row) return;
      openSong(row.dataset.id);
    });

    // Detail Header: Back, Prev/Next Hymn, & Favorite
    el.backToListBtn.addEventListener("click", closeSongMobile);
    el.prevHymnBtn.addEventListener("click", () => navigateHymnByOffset(-1));
    el.nextHymnBtn.addEventListener("click", () => navigateHymnByOffset(1));
    el.fsPrevHymnBtn.addEventListener("click", () => navigateHymnByOffset(-1));
    el.fsNextHymnBtn.addEventListener("click", () => navigateHymnByOffset(1));
    el.detailFavBtn.addEventListener("click", () => {
      if (state.selectedId) toggleFavorite(state.selectedId);
    });

    // Personal Organization: Tags, Notes, Don't Sing
    el.addTagForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!state.selectedId) return;
      addCustomTag(state.selectedId, el.newTagInput.value);
      el.newTagInput.value = "";
    });

    el.startNoteSelect.addEventListener("change", () => {
      if (!state.selectedId) return;
      const val = el.startNoteSelect.value;
      if (val) state.startNotes[state.selectedId] = val;
      else delete state.startNotes[state.selectedId];
      saveJSON(STORAGE_KEYS.START_NOTES, state.startNotes);
      updatePitchUI();
    });

    el.songNotesInput.addEventListener("input", () => {
      if (!state.selectedId) return;
      const val = el.songNotesInput.value;
      if (val.trim()) {
        state.notes[state.selectedId] = val;
      } else {
        delete state.notes[state.selectedId];
      }
      saveJSON(STORAGE_KEYS.NOTES, state.notes);
      refreshTagSelectorsAndStats();
    });

    el.dontSingCheckbox.addEventListener("change", () => {
      if (!state.selectedId) return;
      if (el.dontSingCheckbox.checked) {
        state.dontSing[state.selectedId] = { reason: el.dontSingReasonInput.value.trim() };
        el.dontSingReasonInput.classList.remove("hidden");
        setTimeout(() => el.dontSingReasonInput.focus(), 30);
      } else {
        delete state.dontSing[state.selectedId];
        el.dontSingReasonInput.classList.add("hidden");
        el.dontSingReasonInput.value = "";
      }
      saveJSON(STORAGE_KEYS.DONT_SING, state.dontSing);
      renderPersonalUI(state.hymnMap.get(state.selectedId));
      refreshTagSelectorsAndStats();
      renderHymnList();
    });

    el.dontSingReasonInput.addEventListener("input", () => {
      if (!state.selectedId || !el.dontSingCheckbox.checked) return;
      state.dontSing[state.selectedId] = { reason: el.dontSingReasonInput.value.trim() };
      saveJSON(STORAGE_KEYS.DONT_SING, state.dontSing);
      el.dontSingBannerReason.textContent =
        el.dontSingReasonInput.value.trim() ? ` — ${el.dontSingReasonInput.value.trim()}` : "";
      renderHymnList();
    });

    // Sheet music zoom (50%..250% top-center anchored)
    el.zoomInBtn.addEventListener("click", () => {
      const next = getNextZoomStop(state.zoomLevel, 1);
      applyCenteredZoom(el.sheetViewport, el.sheetPages, el.zoomResetBtn, next, false);
    });
    el.zoomOutBtn.addEventListener("click", () => {
      const next = getNextZoomStop(state.zoomLevel, -1);
      applyCenteredZoom(el.sheetViewport, el.sheetPages, el.zoomResetBtn, next, false);
    });
    el.zoomResetBtn.addEventListener("click", () => {
      applyCenteredZoom(el.sheetViewport, el.sheetPages, el.zoomResetBtn, 1.0, false);
    });

    el.fsZoomInBtn.addEventListener("click", () => {
      const next = getNextZoomStop(state.fsZoomLevel, 1);
      applyCenteredZoom(el.fsViewport, el.fsPages, el.fsZoomResetBtn, next, true);
    });
    el.fsZoomOutBtn.addEventListener("click", () => {
      const next = getNextZoomStop(state.fsZoomLevel, -1);
      applyCenteredZoom(el.fsViewport, el.fsPages, el.fsZoomResetBtn, next, true);
    });
    el.fsZoomResetBtn.addEventListener("click", () => {
      applyCenteredZoom(el.fsViewport, el.fsPages, el.fsZoomResetBtn, 1.0, true);
    });

    window.addEventListener("resize", () => {
      fitBrandTitle();
      if (state.selectedId && !el.sheetPages.classList.contains("hidden")) {
        applyCenteredZoom(el.sheetViewport, el.sheetPages, el.zoomResetBtn, state.zoomLevel, false);
      }
      if (state.isFullscreen) {
        applyCenteredZoom(el.fsViewport, el.fsPages, el.fsZoomResetBtn, state.fsZoomLevel, true);
      }
    });

    enableDragPan(el.sheetViewport);
    enableDragPan(el.fsViewport);

    const triggerHighRes = () => {
      const hymn = state.hymnMap.get(state.selectedId);
      if (!hymn || state.highResLoaded) return;
      renderSheetMusic(hymn, true);
    };
    el.loadHighResBtn.addEventListener("click", triggerHighRes);
    el.fsHighResBtn.addEventListener("click", triggerHighRes);

    el.fullscreenBtn.addEventListener("click", openFullscreen);
    el.fsCloseBtn.addEventListener("click", closeFullscreen);

    // Transposition buttons
    el.stepButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!state.selectedId) return;
        const shift = Number(btn.dataset.shift);
        if (shift === 0) {
          delete state.transpositions[state.selectedId];
        } else {
          state.transpositions[state.selectedId] = shift;
        }
        saveJSON(STORAGE_KEYS.TRANSPOSITIONS, state.transpositions);
        updatePitchUI();
        if (state.activeSetlistId) renderSetlistEditor();
      });
    });

    el.manualKeySelect.addEventListener("change", () => {
      const val = el.manualKeySelect.value;
      if (state.selectedId) {
        if (val) {
          state.manualKeys[state.selectedId] = val;
          state.manualKey = val;
        } else {
          delete state.manualKeys[state.selectedId];
        }
        saveJSON(STORAGE_KEYS.MANUAL_KEYS, state.manualKeys);
        const hymn = state.hymnMap.get(state.selectedId);
        if (hymn) {
          const baseKeyStr = getSongBaseKey(hymn);
          el.detailKeyBadge.textContent = baseKeyStr ? formatKeyBadge(baseKeyStr) : "No Key";
        }
        renderHymnList();
        if (state.activeSetlistId) renderSetlistEditor();
      } else if (val) {
        state.manualKey = val;
      }
      updatePitchUI();
    });

    bindHoldButton(el.holdPitchBtn);
    bindHoldButton(el.fsHoldPitchBtn);

    const triggerArp = (btn) => {
      const info = getActivePitchInfo();
      btn.classList.add("playing");
      pitchPipe.playArpeggio(info.semitone, info.isMinor, () => {
        btn.classList.remove("playing");
      });
    };
    el.arpeggioBtn.addEventListener("click", () => triggerArp(el.arpeggioBtn));
    el.fsArpBtn.addEventListener("click", () => triggerArp(el.fsArpBtn));

    const triggerStartNote = (btn) => {
      if (!state.selectedId) return;
      const snKey = state.startNotes[state.selectedId];
      const def = START_NOTE_DEFS[snKey];
      if (!def) return;
      const info = getActivePitchInfo();
      const offset = info.isMinor ? def.minorOffset : def.majorOffset;
      btn.classList.add("playing");
      pitchPipe.playStartNote(info.semitone, offset, () => {
        btn.classList.remove("playing");
      });
    };
    el.startNoteBtn.addEventListener("click", () => triggerStartNote(el.startNoteBtn));
    el.fsStartNoteBtn.addEventListener("click", () => triggerStartNote(el.fsStartNoteBtn));

    // Bottom Navigation
    el.navItems.forEach((item) => {
      item.addEventListener("click", () => {
        closeSongMobile();
        switchTab(item.dataset.tab);
      });
    });

    // Quick-Jump Modal
    el.quickJumpBtn.addEventListener("click", openQuickJump);
    el.closeQuickJumpBtn.addEventListener("click", closeQuickJump);
    el.cancelQuickJumpBtn.addEventListener("click", closeQuickJump);
    el.quickJumpForm.addEventListener("submit", handleQuickJumpSubmit);
    el.quickJumpModal.addEventListener("click", (e) => {
      if (e.target === el.quickJumpModal) closeQuickJump();
    });

    // Scripture Reader Modal
    el.closeScriptureModalBtn.addEventListener("click", closeScriptureModal);
    el.doneScriptureModalBtn.addEventListener("click", closeScriptureModal);
    el.scriptureModal.addEventListener("click", (e) => {
      if (e.target === el.scriptureModal) closeScriptureModal();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (!el.browseModal.classList.contains("hidden")) closeBrowseModal();
        else if (!el.scriptureModal.classList.contains("hidden")) closeScriptureModal();
        else if (!el.quickJumpModal.classList.contains("hidden")) closeQuickJump();
        else if (!el.addToSetlistModal.classList.contains("hidden")) closeAddToSetlistModal();
        else if (!el.songPickerModal.classList.contains("hidden")) closeSongPicker();
        else if (!el.markSungModal.classList.contains("hidden")) closeMarkSungModal();
        else if (el.elementPickerModal && !el.elementPickerModal.classList.contains("hidden")) closeElementPickerModal();
        else if (el.listenModal && !el.listenModal.classList.contains("hidden")) closeListenModal();
        else if (state.isFullscreen) closeFullscreen();
      }
    });

    el.manualJsonInput.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(String(reader.result));
          if (Array.isArray(parsed)) {
            el.loadErrorBanner.classList.add("hidden");
            prepareHymns(parsed);
          }
        } catch (err) {
          alert("Could not parse JSON file: " + err.message);
        }
      };
      reader.readAsText(file);
    });
  }

  // =========================================================================
  // Data Loading & Init
  // =========================================================================
  // =========================================================================
  // Native-Style Phone Back Navigation & Double-Back Exit Guard
  // =========================================================================
  let backGuardReady = false;
  let backGuardPushed = false;
  let exitGuardTimer = null;
  let toastTimer = null;

  function showToast(msg, durationMs = 2200) {
    if (!el.appToast) return;
    el.appToast.textContent = msg;
    el.appToast.classList.remove("hidden");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.appToast.classList.add("hidden");
    }, durationMs);
  }

  function hideToast() {
    if (toastTimer) {
      clearTimeout(toastTimer);
      toastTimer = null;
    }
    if (el.appToast) el.appToast.classList.add("hidden");
  }

  function armBackGuard() {
    if (backGuardPushed) return;
    try {
      if (!backGuardReady) {
        history.replaceState({ pftlRoot: true }, "");
        backGuardReady = true;
      }
      history.pushState({ pftlGuard: true }, "");
      backGuardPushed = true;
    } catch (_) {
      // Ignore if History API is restricted
    }
  }

  function cancelExitGuardAndRearm() {
    if (exitGuardTimer) {
      clearTimeout(exitGuardTimer);
      exitGuardTimer = null;
      hideToast();
      armBackGuard();
    }
  }

  function isMobileViewport() {
    return window.innerWidth < 860;
  }

  function setupBackNavigation() {
    // Arm the history guard on first user interaction (required by mobile browsers)
    const onFirstInteraction = () => {
      armBackGuard();
      window.removeEventListener("pointerdown", onFirstInteraction, true);
      window.removeEventListener("keydown", onFirstInteraction, true);
    };
    window.addEventListener("pointerdown", onFirstInteraction, true);
    window.addEventListener("keydown", onFirstInteraction, true);

    // If user interacts again while the "Press back again to exit" toast is active, re-arm
    window.addEventListener("pointerdown", () => {
      if (exitGuardTimer) cancelExitGuardAndRearm();
    }, true);

    window.addEventListener("popstate", () => {
      backGuardPushed = false;

      // 1. Close any open modal first
      if (!el.browseModal.classList.contains("hidden")) {
        closeBrowseModal();
        armBackGuard();
        return;
      }
      if (!el.scriptureModal.classList.contains("hidden")) {
        closeScriptureModal();
        armBackGuard();
        return;
      }
      if (!el.quickJumpModal.classList.contains("hidden")) {
        closeQuickJump();
        armBackGuard();
        return;
      }
      if (!el.addToSetlistModal.classList.contains("hidden")) {
        closeAddToSetlistModal();
        armBackGuard();
        return;
      }
      if (!el.songPickerModal.classList.contains("hidden")) {
        closeSongPicker();
        armBackGuard();
        return;
      }
      if (!el.markSungModal.classList.contains("hidden")) {
        closeMarkSungModal();
        armBackGuard();
        return;
      }
      if (el.elementPickerModal && !el.elementPickerModal.classList.contains("hidden")) {
        closeElementPickerModal();
        armBackGuard();
        return;
      }
      if (el.listenModal && !el.listenModal.classList.contains("hidden")) {
        closeListenModal();
        armBackGuard();
        return;
      }

      // 2. Exit Fullscreen sheet music overlay
      if (state.isFullscreen) {
        closeFullscreen();
        armBackGuard();
        return;
      }

      // 3. On mobile, close the Song Detail overlay back to the list/setlist
      if (isMobileViewport() && el.songDetailPane.classList.contains("mobile-open")) {
        closeSongMobile();
        armBackGuard();
        return;
      }

      // 4. Inside Setlist Settings or Setlist Editor -> go back to Setlists directory
      if (state.activeTab === "setlists" && state.setlistSettingsOpen) {
        closeSetlistSettings();
        armBackGuard();
        return;
      }
      if (state.activeTab === "setlists" && state.activeSetlistId) {
        closeSetlistEditor();
        armBackGuard();
        return;
      }

      // 5. On any secondary tab -> return to Hymnal home tab
      if (state.activeTab !== "hymnal") {
        switchTab("hymnal");
        armBackGuard();
        return;
      }

      // 6. Already at root Hymnal screen -> double-back to exit guard
      // Because we do NOT immediately re-push the guard state here,
      // pressing Back a second time within 2.2s will naturally exit the app.
      showToast("Press back again to exit", 2200);
      if (exitGuardTimer) clearTimeout(exitGuardTimer);
      exitGuardTimer = setTimeout(() => {
        exitGuardTimer = null;
        armBackGuard();
      }, 2200);
    });
  }

  function isFirstVisitUser() {
    try {
      if (localStorage.getItem(STORAGE_KEYS.ONBOARDED) === "true") return false;
      // Treat existing returning users (who already have any saved pftl_ settings/data) as onboarded
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("pftl_")) {
          localStorage.setItem(STORAGE_KEYS.ONBOARDED, "true");
          return false;
        }
      }
      return true;
    } catch (_) {
      return false;
    }
  }

  function showLandingScreenIfNeeded() {
    if (!el.landingScreen) return false;
    if (!isFirstVisitUser()) return false;
    el.landingScreen.classList.remove("hidden");
    return true;
  }

  async function selectInitialHymnal(bookId) {
    if (!HYMNALS[bookId]) return;
    state.primaryHymnal = bookId;
    state.multiBookMode = false;
    state.enabledHymnals = [bookId];
    try {
      localStorage.setItem(STORAGE_KEYS.PRIMARY_HYMNAL, bookId);
      localStorage.setItem(STORAGE_KEYS.MULTI_BOOK, "false");
      saveJSON(STORAGE_KEYS.ENABLED_HYMNALS, [bookId]);
      localStorage.setItem(STORAGE_KEYS.ONBOARDED, "true");
    } catch (_) {}
    if (el.landingScreen) el.landingScreen.classList.add("hidden");
    await syncActiveBooks();
  }

  async function init() {
    applyTheme();
    applyReadability();
    syncRoleDropdowns();
    syncSetlistFooterElementsUI();
    bindEvents();
    setupBackNavigation();
    updatePitchUI();

    el.landingBookButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        selectInitialHymnal(btn.dataset.book);
      });
    });

    if (showLandingScreenIfNeeded()) {
      return;
    }

    await syncActiveBooks();
  }

  init();
})();
