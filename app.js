/**
 * FluffyLore — Инженерное ядро редактора диалогов и компилятора Tellraw
 */

// Константы цветов Minecraft
const MC_COLORS = {
  '0': { name: 'black', hex: '#000000', label: '0 Черный' },
  '1': { name: 'dark_blue', hex: '#0000AA', label: '1 Темно-синий' },
  '2': { name: 'dark_green', hex: '#00AA00', label: '2 Темно-зеленый' },
  '3': { name: 'dark_aqua', hex: '#00AAAA', label: '3 Бирюзовый' },
  '4': { name: 'dark_red', hex: '#AA0000', label: '4 Темно-красный' },
  '5': { name: 'dark_purple', hex: '#AA00AA', label: '5 Фиолетовый' },
  '6': { name: 'gold', hex: '#FFAA00', label: '6 Золотой' },
  '7': { name: 'gray', hex: '#AAAAAA', label: '7 Серый' },
  '8': { name: 'dark_gray', hex: '#555555', label: '8 Темно-серый' },
  '9': { name: 'blue', hex: '#5555FF', label: '9 Синий' },
  'a': { name: 'green', hex: '#55FF55', label: 'a Светло-зеленый' },
  'b': { name: 'aqua', hex: '#55FFFF', label: 'b Голубой' },
  'c': { name: 'red', hex: '#FF5555', label: 'c Светло-красный' },
  'd': { name: 'light_purple', hex: '#FF55FF', label: 'd Розовый' },
  'e': { name: 'yellow', hex: '#FFFF55', label: 'e Желтый' },
  'f': { name: 'white', hex: '#FFFFFF', label: 'f Белый' }
};

// Константы форматирования Minecraft
const MC_FORMATS = {
  'l': { name: 'bold', label: '&l Жирный' },
  'o': { name: 'italic', label: '&o Курсив' },
  'n': { name: 'underlined', label: '&n Подчеркнутый' },
  'm': { name: 'strikethrough', label: '&m Зачеркнутый' },
  'k': { name: 'obfuscated', label: '&k Магия' },
  'r': { name: 'reset', label: '&r Сброс' }
};

const DEFAULT_SAMPLE_DIALOGUE = `[title] &6&lГлава 1: Пробуждение
[subtitle] &eВстреча в лесу кицунэ
/playsound entity.player.levelup master @a ~ ~ ~ 1 1
[wait: 20]

Широ: Эй, Сенко! Смотри, как великая богиня Широ умеет повелевать молниями!
Сенко: Широ-сама, пожалуйста, поосторожнее! Вы же разобьёте сервиз для чая~
*Широ с гордым видом складывает руки на груди и виляет белым пушистым хвостом*
[actionbar] &aШиро хочет жареный тофу!
Широ: Хмф! Ладно-ладно, если ты угостишь меня тем вкуснейшим жареным тофу, я буду паинькой!
Сенко: Хи-хи, уже накрыто на стол. Приятного аппетита!`;

// Состояние приложения
const state = {
  characters: [
    {
      id: 'char_senko',
      trigger: 'Сенко',
      displayName: '&6&lСенко',
      separator: ': ',
      msgColor: '&e',
      prefix: '',
      enabled: true
    },
    {
      id: 'char_shiro',
      trigger: 'Широ',
      displayName: '&f&lШиро',
      separator: ': ',
      msgColor: '&b',
      prefix: '',
      enabled: true
    },
    {
      id: 'char_narrator',
      trigger: '*',
      displayName: '',
      separator: '',
      msgColor: '&7&o',
      prefix: '',
      enabled: true
    }
  ],
  selector: '@a',
  useBuilderSelector: true,
  builderSelector: {
    base: '@a',
    player: '',
    tag: '',
    distance: '',
    limit: '',
    sort: '',
    team: '',
    gamemode: '',
    custom: ''
  },
  hexFormat: 'no-hash', // 'no-hash' (ffaa00) | 'hash' (#ffaa00)
  chatBgMode: 'world',  // 'world' | 'dark' | 'black'
  chatOpacity: 65,      // 20..100
  format: 'tellraw',
  titleTimes: {
    fadeIn: 10,  // 0.5с (10 тиков)
    stay: 70,     // 3.5с (70 тиков)
    fadeOut: 20   // 1.0с (20 тиков)
  },
  playSoundEnabled: false,
  playSoundName: 'entity.experience_orb.pickup',
  editorHintsEnabled: true,
  lastFocusedInput: null,
  activeUpperTab: 'tab-chars',
  activeLowerTab: 'tab-preview',
  globalMode: 'editor', // 'editor' | 'animator'
  activeOneCmdLayer: 0,
  animator: {
    isPlaying: false,
    currentTick: 0,
    totalTicks: 0,
    playbackSpeed: 1,
    chatMode: 'closed', // 'closed' | 'open'
    bgMode: 'world',    // 'world' | 'dark' | 'black'
    timerId: null,
    events: [],
    activeChatMessages: [],
    activeSounds: []
  }
};

// DOM Элементы
let els = {};

function initDomRefs() {
  els = {
    scriptInput: document.getElementById('script-input'),
    editorContainerWrap: document.getElementById('editor-container-wrap'),
    autocompletePopup: document.getElementById('autocomplete-popup'),
    chkEditorHints: document.getElementById('chk-editor-hints'),
    lineNumbers: document.getElementById('line-numbers'),
    editorHighlightLayer: document.getElementById('editor-highlight-layer'),
    lineCountBadge: document.getElementById('line-count-badge'),
    charCountBadge: document.getElementById('char-count-badge'),
    commandCountBadge: document.getElementById('command-count-badge'),
    charRulesList: document.getElementById('character-rules-list'),
    mcViewport: document.getElementById('mc-viewport'),
    mcChatScreen: document.getElementById('mc-chat-screen'),
    exportCodeOutput: document.getElementById('export-code-output'),
    onecmdLayersBar: document.getElementById('onecmd-layers-bar'),
    paletteColors: document.getElementById('palette-colors'),
    paletteFormats: document.getElementById('palette-formats'),
    hexColorPicker: document.getElementById('hex-color-picker'),
    btnInsertHex: document.getElementById('btn-insert-hex'),
    btnAddCharacter: document.getElementById('btn-add-character'),
    btnResetChars: document.getElementById('btn-reset-chars'),
    exportSelector: document.getElementById('export-selector'),
    exportFormat: document.getElementById('export-format'),
    hexFormatSelect: document.getElementById('hex-format-select'),
    manualSelectorWrap: document.getElementById('manual-selector-wrap'),
    chkPlaysound: document.getElementById('chk-playsound'),
    playsoundInput: document.getElementById('playsound-input'),
    inpTitleFadeIn: document.getElementById('inp-title-fadein'),
    inpTitleStay: document.getElementById('inp-title-stay'),
    inpTitleFadeOut: document.getElementById('inp-title-fadeout'),
    btnCopyAll: document.getElementById('btn-copy-all'),
    btnDownloadMcfunction: document.getElementById('btn-download-mcfunction'),
    copyStatusTip: document.getElementById('copy-status-tip'),
    btnSampleData: document.getElementById('btn-sample-data'),
    btnOpenHelp: document.getElementById('btn-open-help'),
    modalHelpBackdrop: document.getElementById('modal-help-backdrop'),
    btnCloseHelp: document.getElementById('btn-close-help'),
    btnOkHelp: document.getElementById('btn-ok-help'),
    btnCopyAiRules: document.getElementById('btn-copy-ai-rules'),
    btnExportProject: document.getElementById('btn-export-project'),
    fileImportProject: document.getElementById('file-import-project'),
    btnClearAll: document.getElementById('btn-clear-all'),
    resizerMain: document.getElementById('resizer-main'),
    resizerSub: document.getElementById('resizer-sub'),
    panelLeft: document.getElementById('panel-left'),
    panelTopSection: document.getElementById('panel-top-section'),
    workspace: document.getElementById('workspace'),
    
    // Вкладки
    tabBtnChars: document.getElementById('tab-btn-chars'),
    tabBtnSelector: document.getElementById('tab-btn-selector'),
    tabChars: document.getElementById('tab-chars'),
    tabSelector: document.getElementById('tab-selector'),
    tabBtnPreview: document.getElementById('tab-btn-preview'),
    tabBtnExport: document.getElementById('tab-btn-export'),
    tabPreview: document.getElementById('tab-preview'),
    tabExport: document.getElementById('tab-export'),
    previewControlsBar: document.getElementById('preview-controls-bar'),
    exportControlsBar: document.getElementById('export-controls-bar'),
    
    // Селектор конструктор
    selBaseTarget: document.getElementById('sel-base-target'),
    wrapPlayerName: document.getElementById('wrap-player-name'),
    selPlayerName: document.getElementById('sel-player-name'),
    selTag: document.getElementById('sel-tag'),
    selDistance: document.getElementById('sel-distance'),
    selLimit: document.getElementById('sel-limit'),
    selSort: document.getElementById('sel-sort'),
    selTeam: document.getElementById('sel-team'),
    selGamemode: document.getElementById('sel-gamemode'),
    selCustomArgs: document.getElementById('sel-custom-args'),
    selectorResultPreview: document.getElementById('selector-result-preview'),
    btnCopySelector: document.getElementById('btn-copy-selector'),
    chkUseBuilderSelector: document.getElementById('chk-use-builder-selector'),

    // Чат контролы
    chatBgMode: document.getElementById('chat-bg-mode'),
    chatOpacitySlider: document.getElementById('chat-opacity-slider'),
    chatOpacityVal: document.getElementById('chat-opacity-val'),

    // Кинотеатр-Аниматор
    btnModeEditor: document.getElementById('btn-mode-editor'),
    btnModeAnimator: document.getElementById('btn-mode-animator'),
    animatorView: document.getElementById('animator-view'),
    animViewport: document.getElementById('anim-viewport'),
    animBossbarWrap: document.getElementById('anim-bossbar-wrap'),
    animBossbarTitle: document.getElementById('anim-bossbar-title'),
    animBossbarBar: document.getElementById('anim-bossbar-bar'),
    animBossbarFill: document.getElementById('anim-bossbar-fill'),
    animTitleBox: document.getElementById('anim-title-box'),
    animTitleText: document.getElementById('anim-title-text'),
    animSubtitleBox: document.getElementById('anim-subtitle-box'),
    animSubtitleText: document.getElementById('anim-subtitle-text'),
    animChatWrap: document.getElementById('anim-chat-wrap'),
    animChatMessages: document.getElementById('anim-chat-messages'),
    animChatInputBar: document.getElementById('anim-chat-input-bar'),
    animSoundSubtitles: document.getElementById('anim-sound-subtitles'),
    animActionbarBox: document.getElementById('anim-actionbar-box'),
    animActionbarText: document.getElementById('anim-actionbar-text'),
    btnPlayPause: document.getElementById('btn-play-pause'),
    btnPlayIcon: document.getElementById('btn-play-icon'),
    btnPlayText: document.getElementById('btn-play-text'),
    btnPlayerStepNext: document.getElementById('btn-player-step-next'),
    btnPlayerStop: document.getElementById('btn-player-stop'),
    animCurrentTime: document.getElementById('anim-current-time'),
    animTotalTime: document.getElementById('anim-total-time'),
    animTicksBadge: document.getElementById('anim-ticks-badge'),
    animTimelineSlider: document.getElementById('anim-timeline-slider'),
    animStepLabel: document.getElementById('anim-step-label'),
    animChatModeSelect: document.getElementById('anim-chat-mode-select'),
    animSpeedSelect: document.getElementById('anim-speed-select'),
    animBgSelect: document.getElementById('anim-bg-select')
  };
}

// --- Инициализация интерфейса ---
function init() {
  initDomRefs();
  buildColorPalette();
  loadFromLocalStorage();
  applyChatViewportControls();
  renderCharacterRules();
  computeSelector();
  setupTabs();
  setupSelectorBuilderEvents();
  setupChatControls();
  setupHelpModal();
  setupAutocomplete();
  setupGlobalModes();
  setupAnimatorControls();
  setupEventListeners();
  setupResizers();
  updateEditor();
  startObfuscationLoop();
}

// Построение палитры кнопок цветов
function buildColorPalette() {
  els.paletteColors.innerHTML = '';
  Object.keys(MC_COLORS).forEach(code => {
    const info = MC_COLORS[code];
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'color-chip';
    btn.style.backgroundColor = info.hex;
    btn.style.color = (code === '0' || code === '8') ? '#aaa' : '#fff';
    btn.textContent = code;
    btn.title = `&${code} (${info.label})`;
    btn.addEventListener('click', () => insertCodeAtCursor(`&${code}`));
    els.paletteColors.appendChild(btn);
  });

  els.paletteFormats.innerHTML = '';
  Object.keys(MC_FORMATS).forEach(code => {
    const info = MC_FORMATS[code];
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'format-chip';
    btn.textContent = `&${code}`;
    btn.title = info.label;
    btn.addEventListener('click', () => insertCodeAtCursor(`&${code}`));
    els.paletteFormats.appendChild(btn);
  });
}

// Вставка кода в текущее активное текстовое поле
function insertCodeAtCursor(code) {
  let target = state.lastFocusedInput || els.scriptInput;
  if (!target) return;

  const start = target.selectionStart || 0;
  const end = target.selectionEnd || 0;
  const val = target.value;

  target.value = val.substring(0, start) + code + val.substring(end);
  target.selectionStart = target.selectionEnd = start + code.length;
  target.focus();

  if (target === els.scriptInput) {
    updateEditor();
  } else {
    target.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

// --- Управление вкладками ---
function setupTabs() {
  // Верхние вкладки
  const upperTabs = [
    { btn: els.tabBtnChars, content: els.tabChars, id: 'tab-chars' },
    { btn: els.tabBtnSelector, content: els.tabSelector, id: 'tab-selector' }
  ];

  upperTabs.forEach(tab => {
    if (!tab.btn) return;
    tab.btn.addEventListener('click', () => {
      upperTabs.forEach(t => {
        t.btn.classList.toggle('active', t.id === tab.id);
        t.content.classList.toggle('active', t.id === tab.id);
      });
      state.activeUpperTab = tab.id;
      saveToLocalStorage();
    });
  });

  // Нижние вкладки
  const lowerTabs = [
    { btn: els.tabBtnPreview, content: els.tabPreview, id: 'tab-preview' },
    { btn: els.tabBtnExport, content: els.tabExport, id: 'tab-export' }
  ];

  lowerTabs.forEach(tab => {
    if (!tab.btn) return;
    tab.btn.addEventListener('click', () => {
      lowerTabs.forEach(t => {
        t.btn.classList.toggle('active', t.id === tab.id);
        t.content.classList.toggle('active', t.id === tab.id);
      });
      state.activeLowerTab = tab.id;
      updateControlBarsVisibility();
      saveToLocalStorage();
    });
  });

  updateControlBarsVisibility();
}

function updateControlBarsVisibility() {
  if (state.activeLowerTab === 'tab-preview') {
    if (els.previewControlsBar) els.previewControlsBar.style.display = 'flex';
    if (els.exportControlsBar) els.exportControlsBar.style.display = 'none';
  } else {
    if (els.previewControlsBar) els.previewControlsBar.style.display = 'none';
    if (els.exportControlsBar) els.exportControlsBar.style.display = 'flex';
  }
}

// --- Конструктор селектора Minecraft ---
function computeSelector() {
  const base = els.selBaseTarget ? els.selBaseTarget.value : '@a';
  const player = els.selPlayerName ? els.selPlayerName.value.trim() : '';
  const tag = els.selTag ? els.selTag.value.trim() : '';
  const distance = els.selDistance ? els.selDistance.value.trim() : '';
  const limit = els.selLimit ? els.selLimit.value.trim() : '';
  const sort = els.selSort ? els.selSort.value.trim() : '';
  const team = els.selTeam ? els.selTeam.value.trim() : '';
  const gamemode = els.selGamemode ? els.selGamemode.value.trim() : '';
  const custom = els.selCustomArgs ? els.selCustomArgs.value.trim() : '';

  state.builderSelector = { base, player, tag, distance, limit, sort, team, gamemode, custom };

  let args = [];

  if (tag) {
    args.push(tag.startsWith('tag=') ? tag : `tag=${tag}`);
  }
  if (distance) {
    args.push(distance.startsWith('distance=') ? distance : `distance=${distance}`);
  }
  if (limit) {
    args.push(limit.startsWith('limit=') ? limit : `limit=${limit}`);
  }
  if (sort) {
    args.push(`sort=${sort}`);
  }
  if (team) {
    args.push(team.startsWith('team=') ? team : `team=${team}`);
  }
  if (gamemode) {
    args.push(`gamemode=${gamemode}`);
  }
  if (custom) {
    const customList = custom.split(',').map(s => s.trim()).filter(Boolean);
    args.push(...customList);
  }

  let finalSelector = '@a';

  if (base === 'player') {
    if (args.length > 0) {
      const nameArg = player ? `name=${player}` : '';
      const allArgs = nameArg ? [nameArg, ...args] : args;
      finalSelector = `@p[${allArgs.join(',')}]`;
    } else {
      finalSelector = player || 'Player';
    }
  } else {
    if (args.length > 0) {
      finalSelector = `${base}[${args.join(',')}]`;
    } else {
      finalSelector = base;
    }
  }

  if (els.selectorResultPreview) {
    els.selectorResultPreview.textContent = finalSelector;
  }

  return finalSelector;
}

function setupSelectorBuilderEvents() {
  const inputs = [
    els.selBaseTarget, els.selPlayerName, els.selTag, els.selDistance,
    els.selLimit, els.selSort, els.selTeam, els.selGamemode, els.selCustomArgs
  ];

  inputs.forEach(input => {
    if (!input) return;
    input.addEventListener('input', () => {
      computeSelector();
      updateEditor();
    });
    input.addEventListener('change', () => {
      computeSelector();
      updateEditor();
    });
  });

  if (els.selBaseTarget) {
    els.selBaseTarget.addEventListener('change', () => {
      const isPlayer = els.selBaseTarget.value === 'player';
      if (els.wrapPlayerName) {
        els.wrapPlayerName.style.display = isPlayer ? 'flex' : 'none';
      }
      computeSelector();
      updateEditor();
    });
  }

  if (els.btnCopySelector) {
    els.btnCopySelector.addEventListener('click', async () => {
      const sel = els.selectorResultPreview.textContent;
      try {
        await navigator.clipboard.writeText(sel);
        showCopyToast(`📋 Селектор ${sel} скопирован!`);
      } catch (err) {
        const ta = document.createElement('textarea');
        ta.value = sel;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showCopyToast(`📋 Селектор ${sel} скопирован!`);
      }
    });
  }

  if (els.chkUseBuilderSelector) {
    els.chkUseBuilderSelector.addEventListener('change', (e) => {
      state.useBuilderSelector = e.target.checked;
      if (els.manualSelectorWrap) {
        els.manualSelectorWrap.style.display = state.useBuilderSelector ? 'none' : 'flex';
      }
      updateEditor();
    });
  }
}

// --- Управление видовым экраном чата ---
function setupChatControls() {
  if (els.chatBgMode) {
    els.chatBgMode.addEventListener('change', (e) => {
      state.chatBgMode = e.target.value;
      applyChatViewportControls();
      saveToLocalStorage();
    });
  }

  if (els.chatOpacitySlider) {
    els.chatOpacitySlider.addEventListener('input', (e) => {
      state.chatOpacity = parseInt(e.target.value, 10);
      applyChatViewportControls();
      saveToLocalStorage();
    });
  }

  if (els.hexFormatSelect) {
    els.hexFormatSelect.addEventListener('change', (e) => {
      state.hexFormat = e.target.value;
      updateEditor();
    });
  }
}

function applyChatViewportControls() {
  if (els.mcViewport) {
    els.mcViewport.classList.remove('bg-world', 'bg-dark', 'bg-black');
    els.mcViewport.classList.add(`bg-${state.chatBgMode || 'world'}`);
  }

  if (els.mcChatScreen) {
    const alpha = (state.chatOpacity || 65) / 100;
    els.mcChatScreen.style.backgroundColor = `rgba(0, 0, 0, ${alpha})`;
  }

  if (els.chatOpacityVal) {
    els.chatOpacityVal.textContent = `${state.chatOpacity || 65}%`;
  }
  if (els.chatOpacitySlider) {
    els.chatOpacitySlider.value = state.chatOpacity || 65;
  }
  if (els.chatBgMode) {
    els.chatBgMode.value = state.chatBgMode || 'world';
  }
}

function getEffectiveSelector() {
  if (state.useBuilderSelector) {
    return computeSelector();
  }
  return els.exportSelector ? els.exportSelector.value : '@a';
}

// --- Парсинг цветов и форматирования Minecraft ---
function parseMinecraftTokens(rawText, inheritedColor = null, inheritedFormats = {}) {
  const tokens = [];
  let currentColor = inheritedColor;
  let currentFormats = { ...inheritedFormats };
  let buffer = '';

  const flush = () => {
    if (buffer.length > 0) {
      tokens.push({
        text: buffer,
        color: currentColor,
        bold: !!currentFormats.bold,
        italic: !!currentFormats.italic,
        underlined: !!currentFormats.underlined,
        strikethrough: !!currentFormats.strikethrough,
        obfuscated: !!currentFormats.obfuscated
      });
      buffer = '';
    }
  };

  let i = 0;
  while (i < rawText.length) {
    // Проверка HEX формата &#rrggbb
    if (rawText.startsWith('&#', i) && i + 8 <= rawText.length) {
      const hexCandidate = rawText.substr(i + 2, 6);
      if (/^[0-9a-fA-F]{6}$/.test(hexCandidate)) {
        flush();
        currentColor = '#' + hexCandidate.toLowerCase();
        i += 8;
        continue;
      }
    }

    // Классический & или § код
    const ch = rawText[i];
    if ((ch === '&' || ch === '§') && i + 1 < rawText.length) {
      const code = rawText[i + 1].toLowerCase();

      if (MC_COLORS[code]) {
        flush();
        currentColor = MC_COLORS[code].name;
        currentFormats = {};
        i += 2;
        continue;
      } else if (MC_FORMATS[code]) {
        flush();
        if (code === 'r') {
          currentColor = inheritedColor || 'white';
          currentFormats = {};
        } else {
          currentFormats[MC_FORMATS[code].name] = true;
        }
        i += 2;
        continue;
      }
    }

    buffer += ch;
    i++;
  }

  flush();
  return tokens;
}

// Преобразование токенов в HTML для игрового Minecraft чата
function tokensToHtml(tokens) {
  if (!tokens || tokens.length === 0) return '';
  return tokens.map(tok => {
    let style = '';
    let colorCss = '#ffffff';

    if (tok.color) {
      if (tok.color.startsWith('#')) {
        colorCss = tok.color;
      } else {
        const found = Object.values(MC_COLORS).find(c => c.name === tok.color);
        if (found) colorCss = found.hex;
      }
    }
    style += `color: ${colorCss}; `;
    if (tok.bold) style += 'font-weight: bold; ';
    if (tok.italic) style += 'font-style: italic; ';
    let textDec = [];
    if (tok.underlined) textDec.push('underline');
    if (tok.strikethrough) textDec.push('line-through');
    if (textDec.length > 0) style += `text-decoration: ${textDec.join(' ')}; `;

    const safeText = escapeHtml(tok.text);
    if (tok.obfuscated) {
      return `<span class="mc-obfuscated" style="${style}" data-text="${safeText}">${safeText}</span>`;
    }
    return `<span style="${style}">${safeText}</span>`;
  }).join('');
}

// Сериализация цвета для Tellraw JSON с учётом опции хэша
function serializeTellrawColor(color) {
  if (!color) return null;
  if (color.startsWith('#')) {
    const rawHex = color.substring(1).toLowerCase();
    return state.hexFormat === 'hash' ? `#${rawHex}` : rawHex;
  }
  return color;
}

// Преобразование токенов в Minecraft Tellraw JSON структуру
function tokensToTellrawJson(tokens) {
  if (!tokens || tokens.length === 0) return '[""]';

  const parts = [''];
  tokens.forEach(tok => {
    if (!tok.text) return;
    const obj = { text: tok.text };
    if (tok.color) {
      obj.color = serializeTellrawColor(tok.color);
    }
    if (tok.bold) obj.bold = true;
    if (tok.italic) obj.italic = true;
    if (tok.underlined) obj.underlined = true;
    if (tok.strikethrough) obj.strikethrough = true;
    if (tok.obfuscated) obj.obfuscated = true;
    parts.push(obj);
  });

  return JSON.stringify(parts);
}

// Преобразование в §-legacy код (для плагинов или старых версий)
function tokensToLegacyString(tokens) {
  if (!tokens) return '';
  return tokens.map(tok => {
    let prefix = '';
    if (tok.color) {
      const entry = Object.entries(MC_COLORS).find(([k, v]) => v.name === tok.color);
      if (entry) {
        prefix += `§${entry[0]}`;
      } else if (tok.color.startsWith('#')) {
        prefix += `§x` + tok.color.slice(1).split('').map(c => `§${c}`).join('');
      }
    }
    if (tok.bold) prefix += '§l';
    if (tok.italic) prefix += '§o';
    if (tok.underlined) prefix += '§n';
    if (tok.strikethrough) prefix += '§m';
    if (tok.obfuscated) prefix += '§k';
    return prefix + tok.text;
  }).join('');
}

// --- Обработка строк сценария ---
function processScriptLines(text) {
  const lines = text.split('\n');
  const results = [];

  for (let idx = 0; idx < lines.length; idx++) {
    const rawLine = lines[idx];
    const trimmed = rawLine.trim();
    if (trimmed === '') {
      continue;
    }

    // 1. Прямая игровая команда со слэшем (например: /playsound ...)
    if (trimmed.startsWith('/')) {
      results.push({
        lineIndex: idx + 1,
        rawLine,
        type: 'command',
        command: trimmed
      });
      continue;
    }

    // 2. Маркер паузы / задержки: [wait: 20] или [delay: 40]
    const waitMatch = trimmed.match(/^\[(wait|delay):\s*(\d+)\s*\]$/i);
    if (waitMatch) {
      const ticks = parseInt(waitMatch[2], 10) || 20;
      results.push({
        lineIndex: idx + 1,
        rawLine,
        type: 'wait',
        ticks: ticks
      });
      continue;
    }

    // 3. Проверка тега bossbar: [bossbar: red] Текст или [bossbar] Текст
    const bossbarMatch = rawLine.match(/^\s*\[bossbar(?::\s*([a-zA-Z]+))?\]\s*(.*)$/i);
    if (bossbarMatch) {
      const barColor = (bossbarMatch[1] || 'purple').toLowerCase();
      const barText = bossbarMatch[2] || '';
      const tokens = parseMinecraftTokens(barText);
      results.push({
        lineIndex: idx + 1,
        rawLine,
        type: 'bossbar',
        color: barColor,
        text: barText,
        tokens: tokens
      });
      continue;
    }

    // 4. Проверка тега показа: [title], [subtitle], [actionbar], [chat]
    let targetTag = 'chat';
    let lineToParse = rawLine;

    const tagMatch = rawLine.match(/^\s*\[(title|subtitle|actionbar|chat)\]\s*(.*)$/i);
    if (tagMatch) {
      targetTag = tagMatch[1].toLowerCase();
      lineToParse = tagMatch[2];
    }

    let matchedRule = null;
    let characterName = '';
    let speechText = lineToParse;

    // Авторская ремарка в звездочках *действие*
    if (lineToParse.trim().startsWith('*') && lineToParse.trim().endsWith('*') && lineToParse.trim().length > 1) {
      const narratorRule = state.characters.find(c => c.trigger === '*' && c.enabled);
      if (narratorRule) {
        matchedRule = narratorRule;
        speechText = lineToParse.trim();
      }
    } else {
      for (const rule of state.characters) {
        if (!rule.enabled || !rule.trigger || rule.trigger === '*') continue;

        const trig = rule.trigger;
        const pattern = new RegExp(`^(${escapeRegExp(trig)})([:»>—\\-]\\s*|\\s+)(.*)$`, 'i');
        const match = lineToParse.match(pattern);

        if (match) {
          matchedRule = rule;
          characterName = rule.displayName || match[1];
          speechText = match[3] || '';
          break;
        }
      }
    }

    let combinedTokens = [];

    if (matchedRule && matchedRule.trigger !== '*') {
      const prefixStr = matchedRule.prefix || '';
      const nameStr = matchedRule.displayName || matchedRule.trigger;
      const sepStr = matchedRule.separator !== undefined ? matchedRule.separator : ': ';

      const nameTokens = parseMinecraftTokens(prefixStr + nameStr + sepStr);

      let defaultMsgColor = null;
      let defaultFormats = {};
      if (matchedRule.msgColor) {
        const parsedBase = parseMinecraftTokens(matchedRule.msgColor + ' ');
        if (parsedBase[0]) {
          defaultMsgColor = parsedBase[0].color;
          defaultFormats = {
            bold: parsedBase[0].bold,
            italic: parsedBase[0].italic,
            underlined: parsedBase[0].underlined,
            strikethrough: parsedBase[0].strikethrough,
            obfuscated: parsedBase[0].obfuscated
          };
        }
      }

      const speechTokens = parseMinecraftTokens(speechText, defaultMsgColor, defaultFormats);
      combinedTokens = [...nameTokens, ...speechTokens];
    } else if (matchedRule && matchedRule.trigger === '*') {
      let defaultColor = 'gray';
      let defaultFormats = { italic: true };
      if (matchedRule.msgColor) {
        const parsedBase = parseMinecraftTokens(matchedRule.msgColor + ' ');
        if (parsedBase[0]) {
          defaultColor = parsedBase[0].color;
          defaultFormats = { italic: !!parsedBase[0].italic, bold: !!parsedBase[0].bold };
        }
      }
      combinedTokens = parseMinecraftTokens(speechText, defaultColor, defaultFormats);
    } else {
      combinedTokens = parseMinecraftTokens(lineToParse);
    }

    results.push({
      lineIndex: idx + 1,
      rawLine,
      type: 'dialogue',
      tag: targetTag,
      tokens: combinedTokens
    });
  }

  return results;
}

// --- Подсветка комфортности чтения для строк с [wait: X] ---
function updateReadingComfortHighlight(lines, processed) {
  if (!els.editorHighlightLayer) return;

  // Очистка или пустое состояние
  if (!lines || lines.length === 0) {
    els.editorHighlightLayer.innerHTML = '';
    return;
  }

  // Создаем карту: номер строки (1-based) -> processed item
  const lineToItem = new Map();
  processed.forEach(item => {
    lineToItem.set(item.lineIndex, item);
  });

  const htmlRows = [];

  for (let idx = 0; idx < lines.length; idx++) {
    const lineNum = idx + 1;
    const item = lineToItem.get(lineNum);

    if (!item || item.type !== 'wait') {
      // Обычная строка без подсветки
      htmlRows.push('<div class="editor-hl-line"></div>');
      continue;
    }

    // Ищем предыдущую реплику / текст (dialogue или bossbar), чтобы узнать объём текста
    let prevTextLength = 0;
    let prevItemType = '';

    for (let p = lineNum - 2; p >= 0; p--) {
      const prevLineNum = p + 1;
      const prevItem = lineToItem.get(prevLineNum);
      if (prevItem && (prevItem.type === 'dialogue' || prevItem.type === 'bossbar')) {
        // Вычисляем чистую длину текста без служебных кодов
        const cleanText = prevItem.tokens ? prevItem.tokens.map(t => t.text || '').join('') : '';
        prevTextLength = cleanText.trim().length;
        prevItemType = prevItem.type;
        break;
      }
    }

    if (prevTextLength === 0) {
      // До wait не было реплики (например, wait в начале файла или после команды)
      htmlRows.push('<div class="editor-hl-line"></div>');
      continue;
    }

    // Расчёт идеального времени:
    // Базовое время на реакцию/фокус глаза: ~8 тиков (0.4с)
    // Динамическая скорость: чем длиннее реплика, тем быстрее человек скользит взглядом:
    // для коротких реплик ~1.4 тика/символ, для длинных монологов ~1.0-1.1 тика/символ
    const perCharTicks = prevTextLength > 80 ? 1.05 : (prevTextLength > 40 ? 1.25 : 1.45);
    const idealTicks = Math.round(8 + (prevTextLength * perCharTicks));
    const actualTicks = item.ticks;

    // Считаем коэффициент отклонения от идеала: ratio = actual / ideal
    const ratio = actualTicks / idealTicks;

    let bgStyle = '';
    let badgeHtml = '';

    // Если задержка около идеальной (в коридоре 0.85 .. 1.25) — подсветка выключена!
    if (ratio >= 0.85 && ratio <= 1.25) {
      bgStyle = ''; // подсветка отключена, всё идеально
    } else {
      let severity = 0; // 0..1 (отклонение от идеала)
      let isFast = false;

      if (ratio < 0.85) {
        // Слишком быстро: игрок не успеет дочитать
        isFast = true;
        severity = Math.min(1, (0.85 - ratio) / 0.6); // 0..1
      } else {
        // Слишком долго: игрок будет скучать в ожидании следующей реплики
        isFast = false;
        severity = Math.min(1, (ratio - 1.25) / 1.5); // 0..1
      }

      // Цветовая интерполяция:
      // от мягкого оранжевого rgba(255, 170, 0, 0.15) до насыщенного красного rgba(255, 60, 60, 0.35)
      const red = 255;
      const green = Math.round(170 * (1 - severity));
      const blue = Math.round(20 * (1 - severity));
      const alpha = (0.12 + (severity * 0.22)).toFixed(2);
      const borderAlpha = (0.3 + (severity * 0.4)).toFixed(2);

      bgStyle = `background: rgba(${red}, ${green}, ${blue}, ${alpha}); border-left: 3px solid rgba(${red}, ${green}, ${blue}, ${borderAlpha});`;

      const idealSec = (idealTicks / 20).toFixed(1);
      const labelText = isFast
        ? `⚠️ Слишком быстро (нужно ~${idealTicks}т / ${idealSec}с)`
        : `⏳ Долгая пауза (хватит ~${idealTicks}т / ${idealSec}с)`;

      const badgeColor = severity > 0.6 ? '#ff5555' : '#ffaa00';
      badgeHtml = `<span class="editor-hl-badge" style="background: rgba(0,0,0,0.7); color: ${badgeColor}; border: 1px solid ${badgeColor}55;">${labelText}</span>`;
    }

    htmlRows.push(`<div class="editor-hl-line" style="${bgStyle}">${badgeHtml}</div>`);
  }

  els.editorHighlightLayer.innerHTML = htmlRows.join('');
}

// --- Главное обновление редактора ---
function updateEditor() {
  const scriptText = els.scriptInput ? els.scriptInput.value : '';
  const lines = scriptText.split('\n');

  if (els.lineNumbers) {
    els.lineNumbers.textContent = Array.from({ length: lines.length }, (_, i) => i + 1).join('\n');
  }
  if (els.lineCountBadge) {
    els.lineCountBadge.textContent = `${lines.length} ${getNoun(lines.length, 'строка', 'строки', 'строк')}`;
  }

  const processed = processScriptLines(scriptText);
  if (els.commandCountBadge) {
    els.commandCountBadge.textContent = `${processed.length} ${getNoun(processed.length, 'команда', 'команды', 'команд')}`;
  }

  // Превью чата
  if (els.mcChatScreen) {
    if (processed.length === 0) {
      els.mcChatScreen.innerHTML = '<div class="mc-chat-empty">Здесь появится диалог в реальном времени...</div>';
    } else {
      els.mcChatScreen.innerHTML = processed.map(item => {
        if (item.type === 'command') {
          return `<div class="mc-chat-cmd-line"><span class="mc-badge mc-badge-cmd">⚙️ /cmd</span>${escapeHtml(item.command)}</div>`;
        }
        if (item.type === 'wait') {
          return `<div class="mc-chat-wait-line"><span class="mc-badge mc-badge-wait">⏳ ${item.ticks} тиков (${(item.ticks / 20).toFixed(1)}с)</span>Пауза сценария</div>`;
        }
        if (item.type === 'bossbar') {
          return `<div class="mc-chat-line"><span class="mc-badge mc-badge-title">👑 Боссбар [${item.color}]</span>${tokensToHtml(item.tokens)}</div>`;
        }

        const html = tokensToHtml(item.tokens);
        let badgeHtml = '';
        if (item.tag === 'title') {
          badgeHtml = '<span class="mc-badge mc-badge-title">🎬 Тайтл</span>';
        } else if (item.tag === 'subtitle') {
          badgeHtml = '<span class="mc-badge mc-badge-subtitle">📄 Сабтайтл</span>';
        } else if (item.tag === 'actionbar') {
          badgeHtml = '<span class="mc-badge mc-badge-actionbar">⚡ Экшнбар</span>';
        }

        return `<div class="mc-chat-line">${badgeHtml}${html}</div>`;
      }).join('');
      els.mcChatScreen.scrollTop = els.mcChatScreen.scrollHeight;
    }
  }

  // Генерация команд
  const selector = getEffectiveSelector();
  const commandLines = [];

  processed.forEach(item => {
    if (item.type === 'command') {
      commandLines.push(item.command);
      return;
    }

    if (item.type === 'wait') {
      commandLines.push(`# [Задержка: ${item.ticks} тиков (${(item.ticks / 20).toFixed(1)} сек)]`);
      return;
    }

    if (item.type === 'bossbar') {
      const json = tokensToTellrawJson(item.tokens);
      commandLines.push(`bossbar set fluffy_boss name ${json}`);
      commandLines.push(`bossbar set fluffy_boss color ${item.color}`);
      commandLines.push(`bossbar set fluffy_boss players ${selector}`);
      commandLines.push(`bossbar set fluffy_boss visible true`);
      return;
    }

    // Проигрывание звука перед обычными репликами чата (если включено)
    if (state.playSoundEnabled && state.playSoundName.trim() && item.tag === 'chat') {
      commandLines.push(`playsound ${state.playSoundName.trim()} voice ${selector} ~ ~ ~ 1 1`);
    }

    const json = tokensToTellrawJson(item.tokens);

    if (item.tag === 'title') {
      // Если тайминги кастомные (отличаются от дефолта Minecraft 10 70 20), добавляем /title times
      const { fadeIn, stay, fadeOut } = state.titleTimes || { fadeIn: 10, stay: 70, fadeOut: 20 };
      if (fadeIn !== 10 || stay !== 70 || fadeOut !== 20) {
        commandLines.push(`title ${selector} times ${fadeIn} ${stay} ${fadeOut}`);
      }
      commandLines.push(`title ${selector} title ${json}`);
    } else if (item.tag === 'subtitle') {
      commandLines.push(`title ${selector} subtitle ${json}`);
    } else if (item.tag === 'actionbar') {
      commandLines.push(`title ${selector} actionbar ${json}`);
    } else {
      // Обычный чат
      if (state.format === 'tellraw' || state.format === 'onecommand') {
        commandLines.push(`tellraw ${selector} ${json}`);
      } else if (state.format === 'json') {
        commandLines.push(json);
      } else if (state.format === 'legacy') {
        commandLines.push(tokensToLegacyString(item.tokens));
      }
    }
  });

  if (els.exportCodeOutput) {
    if (state.format === 'onecommand') {
      renderOneCommandOutput(processed, selector);
    } else {
      if (els.onecmdLayersBar) els.onecmdLayersBar.style.display = 'none';
      els.exportCodeOutput.textContent = commandLines.join('\n');
    }
  }

  // Обновление слоя подсветки задержек чтения [wait]
  updateReadingComfortHighlight(lines, processed);

  saveToLocalStorage();
}

// --- Многослойный генератор One Command Box (с безопасной глубиной NBT до 30 блоков) ---
function buildOneCommandLayers(processed, selector) {
  if (!processed || processed.length === 0) {
    return [{ title: 'Пусто', text: '# Сценарий пуст. Добавьте реплики в редакторе!' }];
  }

  // 1. Формируем список игровых действий и пауз между ними
  const actions = [];
  let pendingDelay = 0;

  processed.forEach(item => {
    if (item.type === 'wait') {
      pendingDelay += item.ticks;
      return;
    }

    let cmd = '';
    if (item.type === 'command') {
      cmd = item.command.startsWith('/') ? item.command.slice(1) : item.command;
    } else if (item.type === 'bossbar') {
      const json = tokensToTellrawJson(item.tokens);
      cmd = `bossbar set fluffy_boss name ${json}`;
    } else if (item.type === 'dialogue') {
      const json = tokensToTellrawJson(item.tokens);
      if (item.tag === 'title') {
        const { fadeIn, stay, fadeOut } = state.titleTimes || { fadeIn: 10, stay: 70, fadeOut: 20 };
        if (fadeIn !== 10 || stay !== 70 || fadeOut !== 20) {
          actions.push({
            command: `title ${selector} times ${fadeIn} ${stay} ${fadeOut}`,
            delayBefore: pendingDelay
          });
          pendingDelay = 0;
        }
        cmd = `title ${selector} title ${json}`;
      } else if (item.tag === 'subtitle') {
        cmd = `title ${selector} subtitle ${json}`;
      } else if (item.tag === 'actionbar') {
        cmd = `title ${selector} actionbar ${json}`;
      } else {
        cmd = `tellraw ${selector} ${json}`;
      }
    }

    if (cmd) {
      actions.push({
        command: cmd,
        delayBefore: pendingDelay
      });
      pendingDelay = 0;
    }
  });

  if (actions.length === 0) {
    return [{ title: 'Пусто', text: '# Нет команд для размещения в схеме.' }];
  }

  // 2. Раскладка цепочки по горизонтали в плоскости (X / Z)
  // Прямая линия редстоуна: Сигнал идет строго непрерывной цепочкой
  // Каждый шаг: Повторитель (repeater) или Редстоун-пыль (redstone_wire) или Командный блок (command_block)
  // В Minecraft сигнал из повторителя входит в командный блок, а чтобы сигнал шел ДАЛЬШЕ из командного блока,
  // за командным блоком СРАЗУ должен стоять повторитель или провод!
  const MAX_ROW_LENGTH = 12;
  const allSetblocks = [];
  let curX = 1;
  let curZ = 0;
  let dirX = 1;

  // Стартовая площадка: платформа под первый КБ
  allSetblocks.push(`setblock ~1 ~-1 ~0 smooth_stone`);
  // Кнопка на боку стартового блока, запускающая цепь на восток:
  allSetblocks.push(`setblock ~1 ~ ~0 stone_button[face=wall,facing=west]`);

  actions.forEach((act, actIdx) => {
    // 2.1. Если перед действием есть задержка [wait: N]
    if (actIdx > 0 && act.delayBefore > 0) {
      let ticksLeft = act.delayBefore;
      while (ticksLeft > 0) {
        const repeaterDelay = Math.min(Math.max(Math.round(ticksLeft / 2), 1), 4);
        ticksLeft -= repeaterDelay * 2;

        // Делаем шаг в текущем направлении
        const prevX = curX;
        const prevZ = curZ;
        curX += dirX;

        // Поворот змейки на соседний ряд при достижении границы
        if (Math.abs(curX) > MAX_ROW_LENGTH) {
          curX = prevX;
          // Поворотный редстоун-мостик: ставим камень под ноги и редстоун-пыль
          allSetblocks.push(`setblock ~${curX} ~-1 ~${curZ + 1} smooth_stone`);
          allSetblocks.push(`setblock ~${curX} ~ ~${curZ + 1} redstone_wire`);

          curZ += 2;
          allSetblocks.push(`setblock ~${curX} ~-1 ~${curZ} smooth_stone`);
          allSetblocks.push(`setblock ~${curX} ~ ~${curZ} redstone_wire`);

          dirX = -dirX; // меняем направление на противоположное
          curX += dirX;
        }

        const facing = dirX > 0 ? 'west' : 'east';
        allSetblocks.push(`setblock ~${curX} ~-1 ~${curZ} smooth_stone`);
        allSetblocks.push(`setblock ~${curX} ~ ~${curZ} repeater[facing=${facing},delay=${repeaterDelay}]`);
      }
    } else if (actIdx > 0) {
      // Если паузы нет, нужен провод редстоуна между соседними командными блоками,
      // чтобы сигнал непрерывно передавался дальше
      const prevX = curX;
      curX += dirX;
      if (Math.abs(curX) > MAX_ROW_LENGTH) {
        curX = prevX;
        allSetblocks.push(`setblock ~${curX} ~-1 ~${curZ + 1} smooth_stone`);
        allSetblocks.push(`setblock ~${curX} ~ ~${curZ + 1} redstone_wire`);
        curZ += 2;
        dirX = -dirX;
        curX += dirX;
      }
      const facing = dirX > 0 ? 'west' : 'east';
      allSetblocks.push(`setblock ~${curX} ~-1 ~${curZ} smooth_stone`);
      allSetblocks.push(`setblock ~${curX} ~ ~${curZ} repeater[facing=${facing},delay=1]`);
    }

    // 2.2. Ставим командный блок с нужной командой
    const prevX = curX;
    curX += dirX;
    if (Math.abs(curX) > MAX_ROW_LENGTH) {
      curX = prevX;
      allSetblocks.push(`setblock ~${curX} ~-1 ~${curZ + 1} smooth_stone`);
      allSetblocks.push(`setblock ~${curX} ~ ~${curZ + 1} redstone_wire`);
      curZ += 2;
      dirX = -dirX;
      curX += dirX;
    }

    const escapedCmd = act.command.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    const facing = dirX > 0 ? 'west' : 'east';
    allSetblocks.push(`setblock ~${curX} ~-1 ~${curZ} smooth_stone`);
    allSetblocks.push(`setblock ~${curX} ~ ~${curZ} command_block[facing=${facing}]{Command:"${escapedCmd}"}`);
  });

  // 3. Разбиваем установку на безопасные слои (по 10-12 блоков на слой)
  // В новых версиях Minecraft (1.20.5+ / 1.21+ / 26.2) коллизия сущностей выталкивает
  // высокие стеки вагонеток вверх. Пачка из 10 вагонеток спавнится и срабатывает в 0-й тик мгновенно,
  // не успевая расслоиться физикой!
  const CHUNK_SIZE = 10;
  const layers = [];
  const totalChunks = Math.ceil(allSetblocks.length / CHUNK_SIZE);

  for (let c = 0; c < totalChunks; c++) {
    const chunkBlocks = allSetblocks.slice(c * CHUNK_SIZE, (c + 1) * CHUNK_SIZE);
    const minecarts = [];

    chunkBlocks.forEach(sb => {
      const esc = sb.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      minecarts.push(`{id:"command_block_minecart",Command:"${esc}"}`);
    });

    // Очистка строительной площадки вагонеток:
    // Порядок в массиве: команды блоков идут первыми, затем удаление блоков и вагонеток.
    // При сборке цепочки последняя вагонетка массива становится самым внешним родителем (внизу, на самом рельсе),
    // поэтому первыми выполняются очистка! Чтобы блоки ставились ДО очистки, инвертируем добавление:
    const finalMinecarts = [];

    // 1. Сначала идут все рабочие команды блоков
    chunkBlocks.forEach(sb => {
      const esc = sb.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      finalMinecarts.push(`{id:"command_block_minecart",Command:"${esc}"}`);
    });

    // 2. В самый конец очереди выполнения - удаление рельса, редстоуна и вагонеток
    // Удаляем блок красного камня снизу (~ ~ ~ air), рельс сверху (~ ~1 ~ air)
    // и вагонетки в радиусе 16 блоков
    finalMinecarts.push(`{id:"command_block_minecart",Command:"setblock ~ ~ ~ air"}`);
    finalMinecarts.push(`{id:"command_block_minecart",Command:"setblock ~ ~1 ~ air"}`);
    finalMinecarts.push(`{id:"command_block_minecart",Command:"kill @e[type=command_block_minecart,distance=..16]"}`);

    // Сборка цепочки пассажиров:
    // Самый нижний (первый) пассажир рельса - finalMinecarts[0], у него пассажир [1], у него [2]...
    // Тогда в игре вагонетки активируются СНИЗУ ВВЕРХ: сначала блоки, а на самом верху - kill!
    let passengerChain = finalMinecarts[finalMinecarts.length - 1];
    for (let i = finalMinecarts.length - 2; i >= 0; i--) {
      passengerChain = finalMinecarts[i].slice(0, -1) + `,Passengers:[${passengerChain}]}`;
    }

    // Классический и 100% рабочий механизм One Command в Java Edition:
    // Спавнится падающий блок красного камня на ~ ~1 ~, пассажиром у него активирующий рельс,
    // а пассажирами у рельса - вагонетки.
    // Рельс мгновенно оказывается на блоке редстоуна, запитывается и активирует вагонетки в 0-й тик!
    const oneCommand = `/summon falling_block ~ ~1 ~ {BlockState:{Name:"redstone_block"},Time:1,DropItem:0b,Passengers:[{id:"falling_block",BlockState:{Name:"activator_rail"},Time:1,DropItem:0b,Passengers:[${passengerChain}]}]}`;

    const layerNum = c + 1;
    const header = `# ========================================================
# 📦 FluffyLore Command Box (1.16 - 1.21+)
# Слой ${layerNum} из ${totalChunks} (Безопасная длина: ${chunkBlocks.length} блоков схемы)
# Площадка для всей схемы: примерно ${Math.min(curX + 2, MAX_ROW_LENGTH + 2)}×${curZ + 2} блоков в плоскости X/Z
#
# ИНСТРУКЦИЯ ПО УСТАНОВКЕ:
${totalChunks > 1 ? `# 1. Поставьте командный блок в мир на одной и той же точке (~ ~ ~).
# 2. Вставьте команду Слоя ${layerNum} и активируйте её (схема появится, а стартовый КБ очистится).
# 3. ${layerNum < totalChunks ? `Поставьте на то же место следующий КБ и активируйте Слой ${layerNum + 1}.` : 'Все слои установлены! Нажмите каменную кнопку (~1 ~0 ~0) для запуска катсцены!'}` : `# 1. Поставьте командный блок в мир.
# 2. Вставьте команду ниже и активируйте её (кнопкой или рычагом).
# 3. Нажмите появившуюся каменную кнопку (~1 ~0 ~0) для запуска катсцены!`}
# ========================================================

${oneCommand}`;

    layers.push({
      title: totalChunks > 1 ? `Слой ${layerNum} / ${totalChunks}` : `Одна команда`,
      text: header,
      rawCommand: oneCommand
    });
  }

  return layers;
}

// Отображение One Command с кнопками переключения слоёв
function renderOneCommandOutput(processed, selector) {
  const layers = buildOneCommandLayers(processed, selector);

  if (!els.onecmdLayersBar || !els.exportCodeOutput) return;

  if (layers.length <= 1) {
    els.onecmdLayersBar.style.display = 'none';
    els.exportCodeOutput.textContent = layers[0].text;
    return;
  }

  // Если слоёв несколько — показываем панель кнопок переключения и копирования
  els.onecmdLayersBar.style.display = 'flex';
  els.onecmdLayersBar.innerHTML = '';

  const activeIdx = Math.min(state.activeOneCmdLayer || 0, layers.length - 1);

  layers.forEach((layer, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `onecmd-layer-btn${idx === activeIdx ? ' active' : ''}`;
    btn.innerHTML = `<span>📦 ${layer.title}</span>`;
    btn.addEventListener('click', () => {
      state.activeOneCmdLayer = idx;
      renderOneCommandOutput(processed, selector);
    });
    els.onecmdLayersBar.appendChild(btn);
  });

  // Кнопка быстрого копирования текущего слоя
  const copyLayerBtn = document.createElement('button');
  copyLayerBtn.type = 'button';
  copyLayerBtn.className = 'onecmd-copy-layer-btn';
  copyLayerBtn.innerHTML = `<span>📋 Копировать ${layers[activeIdx].title}</span>`;
  copyLayerBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(layers[activeIdx].rawCommand);
      showCopyToast(`✅ ${layers[activeIdx].title} скопирован в буфер!`);
    } catch (e) {
      showCopyToast(`Скопировано!`);
    }
  });
  els.onecmdLayersBar.appendChild(copyLayerBtn);

  els.exportCodeOutput.textContent = layers[activeIdx].text;
}

// --- Рендер карточек персонажей ---
function renderCharacterRules() {
  if (!els.charRulesList) return;
  els.charRulesList.innerHTML = '';
  if (els.charCountBadge) {
    els.charCountBadge.textContent = `${state.characters.length} ${getNoun(state.characters.length, 'персонаж', 'персонажа', 'персонажей')}`;
  }

  state.characters.forEach((char, index) => {
    const card = document.createElement('div');
    card.className = 'char-rule-card';

    const namePreviewTokens = parseMinecraftTokens((char.displayName || char.trigger) + (char.separator || ''));
    const namePreviewHtml = tokensToHtml(namePreviewTokens);

    card.innerHTML = `
      <div class="field-group">
        <label>Триггер в тексте</label>
        <input type="text" class="input-sm char-trigger" value="${escapeHtml(char.trigger)}" placeholder="Сенко">
      </div>
      <div class="field-group">
        <label>Имя с цветом (&-коды)</label>
        <input type="text" class="input-sm char-name" value="${escapeHtml(char.displayName)}" placeholder="&6&lСенко">
      </div>
      <div class="field-group">
        <label>Цвет реплики</label>
        <input type="text" class="input-sm char-color" value="${escapeHtml(char.msgColor)}" placeholder="&e">
      </div>
      <div class="field-group">
        <label>Разделитель</label>
        <input type="text" class="input-sm char-sep" value="${escapeHtml(char.separator !== undefined ? char.separator : ': ')}" placeholder=": ">
      </div>
      <div class="field-group">
        <label>Превью</label>
        <div class="char-preview-pill" title="Как будет выглядеть имя">${namePreviewHtml || '&nbsp;'}</div>
      </div>
      <button type="button" class="btn-icon-del" title="Удалить персонажа">✕</button>
    `;

    const inpTrigger = card.querySelector('.char-trigger');
    const inpName = card.querySelector('.char-name');
    const inpColor = card.querySelector('.char-color');
    const inpSep = card.querySelector('.char-sep');
    const btnDel = card.querySelector('.btn-icon-del');

    [inpTrigger, inpName, inpColor, inpSep].forEach(inp => {
      inp.addEventListener('focus', () => { state.lastFocusedInput = inp; });
      inp.addEventListener('input', () => {
        char.trigger = inpTrigger.value;
        char.displayName = inpName.value;
        char.msgColor = inpColor.value;
        char.separator = inpSep.value;
        const updatedTokens = parseMinecraftTokens((char.displayName || char.trigger) + (char.separator || ''));
        card.querySelector('.char-preview-pill').innerHTML = tokensToHtml(updatedTokens) || '&nbsp;';
        updateEditor();
      });
    });

    btnDel.addEventListener('click', () => {
      state.characters.splice(index, 1);
      renderCharacterRules();
      updateEditor();
    });

    els.charRulesList.appendChild(card);
  });
}

// --- Слушатели событий ---
function setupEventListeners() {
  if (els.scriptInput) {
    els.scriptInput.addEventListener('scroll', () => {
      if (els.lineNumbers) els.lineNumbers.scrollTop = els.scriptInput.scrollTop;
      if (els.editorHighlightLayer) els.editorHighlightLayer.scrollTop = els.scriptInput.scrollTop;
    });

    els.scriptInput.addEventListener('focus', () => {
      state.lastFocusedInput = els.scriptInput;
    });

    els.scriptInput.addEventListener('input', updateEditor);
  }

  if (els.btnAddCharacter) {
    els.btnAddCharacter.addEventListener('click', () => {
      state.characters.push({
        id: 'char_' + Date.now(),
        trigger: 'Персонаж ' + (state.characters.length + 1),
        displayName: '&aПерсонаж ' + (state.characters.length + 1),
        separator: ': ',
        msgColor: '&f',
        prefix: '',
        enabled: true
      });
      renderCharacterRules();
      updateEditor();
    });
  }

  if (els.btnResetChars) {
    els.btnResetChars.addEventListener('click', () => {
      if (confirm('Сбросить правила персонажей к стандартным (Сенко, Широ, Рассказчик)?')) {
        state.characters = [
          {
            id: 'char_senko',
            trigger: 'Сенко',
            displayName: '&6&lСенко',
            separator: ': ',
            msgColor: '&e',
            prefix: '',
            enabled: true
          },
          {
            id: 'char_shiro',
            trigger: 'Широ',
            displayName: '&f&lШиро',
            separator: ': ',
            msgColor: '&b',
            prefix: '',
            enabled: true
          },
          {
            id: 'char_narrator',
            trigger: '*',
            displayName: '',
            separator: '',
            msgColor: '&7&o',
            prefix: '',
            enabled: true
          }
        ];
        renderCharacterRules();
        updateEditor();
        showCopyToast('🔄 Персонажи сброшены к стандарту!');
      }
    });
  }

  if (els.btnInsertHex) {
    els.btnInsertHex.addEventListener('click', () => {
      const hex = els.hexColorPicker.value;
      insertCodeAtCursor(`&#${hex.replace('#', '')}`);
    });
  }

  if (els.exportSelector) {
    els.exportSelector.addEventListener('change', (e) => {
      state.selector = e.target.value;
      updateEditor();
    });
  }

  if (els.exportFormat) {
    els.exportFormat.addEventListener('change', (e) => {
      state.format = e.target.value;
      updateEditor();
    });
  }

  if (els.chkPlaysound) {
    els.chkPlaysound.addEventListener('change', (e) => {
      state.playSoundEnabled = e.target.checked;
      if (els.playsoundInput) {
        els.playsoundInput.style.display = state.playSoundEnabled ? 'inline-block' : 'none';
      }
      updateEditor();
    });
  }

  if (els.playsoundInput) {
    els.playsoundInput.addEventListener('input', (e) => {
      state.playSoundName = e.target.value;
      updateEditor();
    });
  }

  // Настройка таймингов Title (/title times)
  const updateTitleTimes = () => {
    state.titleTimes.fadeIn = parseInt(els.inpTitleFadeIn?.value, 10) || 10;
    state.titleTimes.stay = parseInt(els.inpTitleStay?.value, 10) || 70;
    state.titleTimes.fadeOut = parseInt(els.inpTitleFadeOut?.value, 10) || 20;
    updateEditor();
  };

  if (els.inpTitleFadeIn) els.inpTitleFadeIn.addEventListener('input', updateTitleTimes);
  if (els.inpTitleStay) els.inpTitleStay.addEventListener('input', updateTitleTimes);
  if (els.inpTitleFadeOut) els.inpTitleFadeOut.addEventListener('input', updateTitleTimes);

  if (els.btnCopyAll) {
    els.btnCopyAll.addEventListener('click', async () => {
      const text = els.exportCodeOutput.textContent;
      if (!text.trim()) return;

      try {
        await navigator.clipboard.writeText(text);
        showCopyToast('✅ Скопировано в буфер обмена!');
      } catch (err) {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showCopyToast('✅ Скопировано!');
      }
    });
  }

  if (els.btnDownloadMcfunction) {
    els.btnDownloadMcfunction.addEventListener('click', () => {
      const text = els.exportCodeOutput.textContent;
      if (!text.trim()) return;

      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dialogue.mcfunction';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showCopyToast('💾 dialogue.mcfunction скачан!');
    });
  }

  if (els.btnSampleData) {
    els.btnSampleData.addEventListener('click', () => {
      if (els.scriptInput) {
        els.scriptInput.value = DEFAULT_SAMPLE_DIALOGUE;

        // Убеждаемся, что Сенко и Широ есть в правилах персонажей
        const hasSenko = state.characters.some(c => c.trigger.toLowerCase() === 'сенко');
        const hasShiro = state.characters.some(c => c.trigger.toLowerCase() === 'широ');
        if (!hasSenko || !hasShiro) {
          state.characters = [
            {
              id: 'char_senko',
              trigger: 'Сенко',
              displayName: '&6&lСенко',
              separator: ': ',
              msgColor: '&e',
              prefix: '',
              enabled: true
            },
            {
              id: 'char_shiro',
              trigger: 'Широ',
              displayName: '&f&lШиро',
              separator: ': ',
              msgColor: '&b',
              prefix: '',
              enabled: true
            },
            {
              id: 'char_narrator',
              trigger: '*',
              displayName: '',
              separator: '',
              msgColor: '&7&o',
              prefix: '',
              enabled: true
            }
          ];
          renderCharacterRules();
        }

        updateEditor();
        showCopyToast('✨ Пример диалога Сенко и Широ загружен!');
      }
    });
  }

  if (els.btnClearAll) {
    els.btnClearAll.addEventListener('click', () => {
      if (confirm('Очистить текст сценария?')) {
        if (els.scriptInput) els.scriptInput.value = '';
        updateEditor();
      }
    });
  }

  if (els.btnExportProject) {
    els.btnExportProject.addEventListener('click', () => {
      const project = {
        version: 2,
        script: els.scriptInput ? els.scriptInput.value : '',
        characters: state.characters,
        selector: state.selector,
        useBuilderSelector: state.useBuilderSelector,
        builderSelector: state.builderSelector,
        hexFormat: state.hexFormat,
        chatBgMode: state.chatBgMode,
        chatOpacity: state.chatOpacity,
        format: state.format,
        playSoundEnabled: state.playSoundEnabled,
        playSoundName: state.playSoundName
      };

      const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'fluffylore_project.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  if (els.fileImportProject) {
    els.fileImportProject.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (data.script !== undefined && els.scriptInput) els.scriptInput.value = data.script;
          if (Array.isArray(data.characters)) state.characters = data.characters;
          if (data.selector) state.selector = data.selector;
          if (data.useBuilderSelector !== undefined) state.useBuilderSelector = data.useBuilderSelector;
          if (data.builderSelector) state.builderSelector = data.builderSelector;
          if (data.hexFormat) state.hexFormat = data.hexFormat;
          if (data.chatBgMode) state.chatBgMode = data.chatBgMode;
          if (data.chatOpacity !== undefined) state.chatOpacity = data.chatOpacity;
          if (data.format) state.format = data.format;
          if (data.playSoundEnabled !== undefined) state.playSoundEnabled = data.playSoundEnabled;
          if (data.playSoundName) state.playSoundName = data.playSoundName;

          applyStateToUI();
          renderCharacterRules();
          computeSelector();
          updateEditor();
          showCopyToast('📂 Проект успешно загружен!');
        } catch (err) {
          alert('Ошибка при чтении файла проекта: ' + err.message);
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    });
  }
}

// --- Управление Drag-сплиттерами ---
function setupResizers() {
  let isDraggingMain = false;
  if (els.resizerMain) {
    els.resizerMain.addEventListener('mousedown', () => {
      isDraggingMain = true;
      els.resizerMain.classList.add('dragging');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    });
  }

  let isDraggingSub = false;
  if (els.resizerSub) {
    els.resizerSub.addEventListener('mousedown', () => {
      isDraggingSub = true;
      els.resizerSub.classList.add('dragging');
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
    });
  }

  window.addEventListener('mousemove', (e) => {
    if (isDraggingMain && els.workspace && els.panelLeft) {
      const containerWidth = els.workspace.clientWidth;
      const newWidth = (e.clientX / containerWidth) * 100;
      if (newWidth > 20 && newWidth < 80) {
        els.panelLeft.style.width = `${newWidth}%`;
      }
    }
    if (isDraggingSub && els.panelTopSection) {
      const rightPanel = document.getElementById('panel-right');
      if (rightPanel) {
        const rect = rightPanel.getBoundingClientRect();
        const newHeight = ((e.clientY - rect.top) / rect.height) * 100;
        if (newHeight > 20 && newHeight < 80) {
          els.panelTopSection.style.height = `${newHeight}%`;
        }
      }
    }
  });

  window.addEventListener('mouseup', () => {
    if (isDraggingMain && els.resizerMain) {
      isDraggingMain = false;
      els.resizerMain.classList.remove('dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    if (isDraggingSub && els.resizerSub) {
      isDraggingSub = false;
      els.resizerSub.classList.remove('dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  });
}

// --- Модальное окно справки ---
function setupHelpModal() {
  const closeHelp = () => {
    if (els.modalHelpBackdrop) els.modalHelpBackdrop.style.display = 'none';
  };

  if (els.btnOpenHelp && els.modalHelpBackdrop) {
    els.btnOpenHelp.addEventListener('click', () => {
      els.modalHelpBackdrop.style.display = 'flex';
    });
  }

  if (els.btnCloseHelp) els.btnCloseHelp.addEventListener('click', closeHelp);
  if (els.btnOkHelp) els.btnOkHelp.addEventListener('click', closeHelp);

  if (els.btnCopyAiRules) {
    els.btnCopyAiRules.addEventListener('click', async () => {
      const charTriggers = state.characters.map(c => `"${c.trigger}" (${c.displayName || c.trigger})`).join(', ');
      const aiPrompt = `Ты — сценарист диалогов и квестов для Minecraft в формате FluffyLore.

Правила разметки сценария:
1. Реплика персонажа: [Имя]: [Текст]
   Например: "Сенко: Привет, путник!", "Широ: Смотри, что у меня есть!"
   (Настроенные персонажи проекта: ${charTriggers || 'любые'})
2. Действие от третьего лица: *действие*
   Например: "*аккуратно подаёт чашечку горячего чая*"
3. Заголовки и экранные сообщения (помещаются в начале строки):
   - [title] Текст — большой заголовок по центру экрана
   - [subtitle] Текст — подзаголовок (всегда пишется ПЕРЕД [title], так как в Minecraft subtitle привязан к title)
   - [actionbar] Текст — строка над хотбаром
   - [bossbar: red|purple|blue|green|yellow|white] Текст — полоска босса сверху
   - [chat] Текст — обычный вывод в чат
4. Паузы и тайминги (в тиках, 20 тиков = 1 секунда):
   - [wait: 20] — пауза в 1 секунду
   - [wait: 40] — пауза в 2 секунды
5. Прямые команды Minecraft (со слэшем / в начале строки):
   - /playsound entity.player.levelup master @a ~ ~ ~ 1 1
   - /particle heart ~ ~1.5 ~ 0.5 0.5 0.5 0.05 10
6. Цветовые коды и стили прямо в тексте:
   - Цвета: &0..&f (&6 — золото, &e — жёлтый, &b — голубой, &a — зелёный, &c — красный, &f — белый)
   - Стили: &l — жирный, &o — курсив, &n — подчеркивание, &k — магия, &r — сброс
   - HEX-цвета: &#ffaa00 (24-битный кастомный цвет)

Напиши атмосферный, красивый диалог с учётом этих правил.`;

      try {
        await navigator.clipboard.writeText(aiPrompt);
        showCopyToast('📋 Правила для AI скопированы в буфер!');
      } catch (err) {
        const ta = document.createElement('textarea');
        ta.value = aiPrompt;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showCopyToast('📋 Правила для AI скопированы!');
      }
    });
  }

  if (els.modalHelpBackdrop) {
    els.modalHelpBackdrop.addEventListener('click', (e) => {
      if (e.target === els.modalHelpBackdrop) closeHelp();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && els.modalHelpBackdrop && els.modalHelpBackdrop.style.display !== 'none') {
      closeHelp();
    }
  });
}

// --- Система подсказок и автодополнения ---
function setupAutocomplete() {
  if (!els.scriptInput || !els.autocompletePopup) return;

  if (els.chkEditorHints) {
    els.chkEditorHints.addEventListener('change', (e) => {
      state.editorHintsEnabled = e.target.checked;
      if (!state.editorHintsEnabled) {
        hideAutocomplete();
      }
      saveToLocalStorage();
    });
  }

  const hideAutocomplete = () => {
    if (els.autocompletePopup) {
      els.autocompletePopup.style.display = 'none';
      els.autocompletePopup.innerHTML = '';
    }
  };

  const applySuggestion = (insertText, triggerChar, cursorIndex) => {
    const val = els.scriptInput.value;
    const before = val.substring(0, cursorIndex - triggerChar.length);
    const after = val.substring(cursorIndex);
    els.scriptInput.value = before + insertText + after;
    const newPos = before.length + insertText.length;
    els.scriptInput.selectionStart = els.scriptInput.selectionEnd = newPos;
    els.scriptInput.focus();
    hideAutocomplete();
    updateEditor();
  };

  const showSuggestions = (items, triggerChar, cursorIndex) => {
    els.autocompletePopup.innerHTML = '';
    items.forEach((item, idx) => {
      const div = document.createElement('div');
      div.className = 'autocomplete-item' + (idx === 0 ? ' selected' : '');
      div.innerHTML = `
        <span class="ac-badge">${escapeHtml(item.insert)}</span>
        <span class="ac-title">${escapeHtml(item.title)}</span>
        <span class="ac-desc">${escapeHtml(item.desc || '')}</span>
      `;
      div.addEventListener('mousedown', (e) => {
        e.preventDefault();
        applySuggestion(item.insert, triggerChar, cursorIndex);
      });
      els.autocompletePopup.appendChild(div);
    });

    els.autocompletePopup.style.display = 'block';
    els.autocompletePopup.style.left = '56px';
    els.autocompletePopup.style.top = '36px';
  };

  els.scriptInput.addEventListener('input', () => {
    if (!state.editorHintsEnabled) return;

    const cursor = els.scriptInput.selectionStart;
    const textBefore = els.scriptInput.value.substring(0, cursor);
    const currentLine = textBefore.split('\n').pop() || '';

    // Подсказка по вводу [
    if (currentLine.endsWith('[')) {
      showSuggestions([
        { insert: '[title] ', title: 'Заголовок', desc: 'Центр экрана' },
        { insert: '[subtitle] ', title: 'Подзаголовок', desc: 'Под главным' },
        { insert: '[actionbar] ', title: 'Экшнбар', desc: 'Над хотбаром' },
        { insert: '[chat] ', title: 'Чат', desc: 'Стандартный tellraw' },
        { insert: '[wait: 20]', title: 'Пауза', desc: '20 тиков (1 сек)' }
      ], '[', cursor);
      return;
    }

    // Подсказка по цветам &
    if (currentLine.endsWith('&')) {
      showSuggestions([
        { insert: '&6', title: '&6 Золотой', desc: '#FFAA00' },
        { insert: '&e', title: '&e Жёлтый', desc: '#FFFF55' },
        { insert: '&b', title: '&b Голубой', desc: '#55FFFF' },
        { insert: '&a', title: '&a Зелёный', desc: '#55FF55' },
        { insert: '&c', title: '&c Красный', desc: '#FF5555' },
        { insert: '&d', title: '&d Розовый', desc: '#FF55FF' },
        { insert: '&f', title: '&f Белый', desc: '#FFFFFF' },
        { insert: '&7', title: '&7 Серый', desc: '#AAAAAA' },
        { insert: '&l', title: '&l Жирный', desc: 'Жирный шрифт' },
        { insert: '&o', title: '&o Курсив', desc: 'Наклонный текст' },
        { insert: '&n', title: '&n Подчеркнутый', desc: 'Подчёркивание' },
        { insert: '&k', title: '&k Магия', desc: 'Анимация символов' },
        { insert: '&r', title: '&r Сброс', desc: 'Сброс цвета и стиля' }
      ], '&', cursor);
      return;
    }

    // Подсказка по слэш-командам
    if (currentLine === '/') {
      showSuggestions([
        { insert: '/playsound entity.player.levelup master @a ~ ~ ~ 1 1', title: '/playsound', desc: 'Звук уровня' },
        { insert: '/playsound entity.experience_orb.pickup voice @a ~ ~ ~ 1 1', title: '/playsound', desc: 'Звук опыта' },
        { insert: '/particle heart ~ ~1.5 ~ 0.5 0.5 0.5 0.05 10', title: '/particle', desc: 'Частицы сердечек' },
        { insert: '/effect give @a slowness 3 1 true', title: '/effect', desc: 'Эффект игроку' },
        { insert: '/title @a times 10 70 20', title: '/title times', desc: 'Время затухания' }
      ], '/', cursor);
      return;
    }

    hideAutocomplete();
  });

  els.scriptInput.addEventListener('keydown', (e) => {
    if (els.autocompletePopup && els.autocompletePopup.style.display !== 'none') {
      const items = Array.from(els.autocompletePopup.querySelectorAll('.autocomplete-item'));
      let selectedIdx = items.findIndex(it => it.classList.contains('selected'));

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (selectedIdx < items.length - 1) {
          items[selectedIdx]?.classList.remove('selected');
          items[selectedIdx + 1]?.classList.add('selected');
          items[selectedIdx + 1]?.scrollIntoView({ block: 'nearest' });
        }
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (selectedIdx > 0) {
          items[selectedIdx]?.classList.remove('selected');
          items[selectedIdx - 1]?.classList.add('selected');
          items[selectedIdx - 1]?.scrollIntoView({ block: 'nearest' });
        }
        return;
      }

      if (e.key === 'Enter' || e.key === 'Tab') {
        if (selectedIdx >= 0 && items[selectedIdx]) {
          e.preventDefault();
          items[selectedIdx].dispatchEvent(new MouseEvent('mousedown'));
          return;
        }
      }

      if (e.key === 'Escape') {
        hideAutocomplete();
        return;
      }
    }
  });

  window.addEventListener('click', (e) => {
    if (els.autocompletePopup && !els.autocompletePopup.contains(e.target) && e.target !== els.scriptInput) {
      hideAutocomplete();
    }
  });
}

// --- Управление глобальными режимами (Редактор / Кинотеатр-Аниматор) ---
function setupGlobalModes() {
  const setMode = (mode) => {
    state.globalMode = mode;
    const isEditor = mode === 'editor';

    if (els.btnModeEditor) els.btnModeEditor.classList.toggle('active', isEditor);
    if (els.btnModeAnimator) els.btnModeAnimator.classList.toggle('active', !isEditor);

    if (els.workspace) els.workspace.style.display = isEditor ? 'flex' : 'none';
    if (els.animatorView) els.animatorView.style.display = !isEditor ? 'flex' : 'none';

    if (!isEditor) {
      buildAnimatorTimeline();
      applyAnimatorBg(state.animator.bgMode);
      applyAnimatorChatMode(state.animator.chatMode);
    } else {
      stopAnimator();
    }
  };

  if (els.btnModeEditor) {
    els.btnModeEditor.addEventListener('click', () => setMode('editor'));
  }
  if (els.btnModeAnimator) {
    els.btnModeAnimator.addEventListener('click', () => setMode('animator'));
  }
}

// Словарь русских названий частых звуков Minecraft для субтитров
const MC_SOUND_NAMES = {
  'entity.player.levelup': 'Уровень повышен',
  'entity.experience_orb.pickup': 'Опыт подобран',
  'entity.item.pickup': 'Предмет подобран',
  'block.chest.open': 'Сундук открывается',
  'block.chest.close': 'Сундук закрывается',
  'entity.villager.ambient': 'Житель бормочет',
  'entity.villager.yes': 'Житель соглашается',
  'entity.villager.no': 'Житель отказывается',
  'entity.lightning_bolt.thunder': 'Удар грома',
  'entity.generic.explode': 'Взрыв',
  'block.portal.ambient': 'Портал гудит',
  'ui.button.click': 'Клик кнопки'
};

// --- Построение таймлайна катсцены для аниматора ---
function buildAnimatorTimeline() {
  const scriptText = els.scriptInput ? els.scriptInput.value : '';
  const processed = processScriptLines(scriptText);
  
  let currentTick = 0;
  const events = [];

  processed.forEach((item, index) => {
    if (item.type === 'wait') {
      currentTick += item.ticks;
      return;
    }

    if (item.type === 'command') {
      // Проверяем, не playsound ли это
      const soundMatch = item.command.match(/^\/playsound\s+([a-zA-Z0-9_.]+)/i);
      if (soundMatch) {
        const soundId = soundMatch[1];
        events.push({
          tick: currentTick,
          type: 'sound',
          soundId: soundId,
          label: MC_SOUND_NAMES[soundId] || soundId
        });
      } else {
        events.push({
          tick: currentTick,
          type: 'raw_command',
          command: item.command
        });
      }
      return;
    }

    if (item.type === 'bossbar') {
      events.push({
        tick: currentTick,
        type: 'bossbar',
        color: item.color,
        tokens: item.tokens
      });
      return;
    }

    // Dialogue (title, subtitle, actionbar, chat)
    if (item.type === 'dialogue') {
      events.push({
        tick: currentTick,
        type: item.tag, // 'title' | 'subtitle' | 'actionbar' | 'chat'
        tokens: item.tokens,
        lineIndex: item.lineIndex
      });

      // Если в настройках включен звук для реплик
      if (state.playSoundEnabled && item.tag === 'chat' && state.playSoundName) {
        const snd = state.playSoundName.trim();
        events.push({
          tick: currentTick,
          type: 'sound',
          soundId: snd,
          label: MC_SOUND_NAMES[snd] || snd
        });
      }
      // Точное отражение Minecraft: время не накручивается, если нет явного [wait: N]!
    }
  });

  // Завершающая буферная пауза в конце
  const totalTicks = Math.max(currentTick + 20, 40);
  state.animator.totalTicks = totalTicks;
  state.animator.events = events;

  if (els.animTimelineSlider) {
    els.animTimelineSlider.max = totalTicks;
    els.animTimelineSlider.value = state.animator.currentTick;
  }

  updateTimelineLabels();
}

function updateTimelineLabels() {
  const curSec = (state.animator.currentTick / 20).toFixed(1);
  const totSec = (state.animator.totalTicks / 20).toFixed(1);

  if (els.animCurrentTime) {
    const mins = Math.floor(curSec / 60);
    const secs = Math.floor(curSec % 60);
    els.animCurrentTime.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  if (els.animTotalTime) {
    const mins = Math.floor(totSec / 60);
    const secs = Math.floor(totSec % 60);
    els.animTotalTime.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  if (els.animTicksBadge) {
    els.animTicksBadge.textContent = `${state.animator.currentTick} / ${state.animator.totalTicks} тиков`;
  }
}

// --- Управление плеером Аниматора ---
function setupAnimatorControls() {
  if (els.btnPlayPause) {
    els.btnPlayPause.addEventListener('click', toggleAnimatorPlay);
  }

  if (els.btnPlayerStepNext) {
    els.btnPlayerStepNext.addEventListener('click', stepAnimatorNext);
  }

  if (els.btnPlayerStop) {
    els.btnPlayerStop.addEventListener('click', resetAnimator);
  }

  if (els.animTimelineSlider) {
    els.animTimelineSlider.addEventListener('input', (e) => {
      const targetTick = parseInt(e.target.value, 10);
      seekAnimatorTo(targetTick);
    });
  }

  if (els.animSpeedSelect) {
    els.animSpeedSelect.addEventListener('change', (e) => {
      state.animator.playbackSpeed = parseFloat(e.target.value) || 1;
      if (state.animator.isPlaying) {
        restartTimer();
      }
    });
  }

  if (els.animChatModeSelect) {
    els.animChatModeSelect.addEventListener('change', (e) => {
      state.animator.chatMode = e.target.value;
      applyAnimatorChatMode(state.animator.chatMode);
    });
  }

  if (els.animBgSelect) {
    els.animBgSelect.addEventListener('change', (e) => {
      state.animator.bgMode = e.target.value;
      applyAnimatorBg(state.animator.bgMode);
    });
  }

  window.addEventListener('keydown', (e) => {
    if (state.globalMode === 'animator' && e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      toggleAnimatorPlay();
    }
  });
}

function applyAnimatorBg(mode) {
  if (!els.animViewport) return;
  els.animViewport.classList.remove('bg-world', 'bg-dark', 'bg-black');
  els.animViewport.classList.add(`bg-${mode}`);
}

function applyAnimatorChatMode(mode) {
  const isOpen = mode === 'open';
  if (els.animChatWrap) {
    els.animChatWrap.classList.toggle('chat-open', isOpen);
  }
  if (els.animChatInputBar) {
    els.animChatInputBar.style.display = isOpen ? 'flex' : 'none';
  }
  if (isOpen && els.animChatMessages) {
    // При открытии чата прокручиваем в самый низ
    els.animChatMessages.scrollTop = els.animChatMessages.scrollHeight;
  }
}

// Пошаговый режим отладки (Дебаггер): переход к следующему событию сценария
function stepAnimatorNext() {
  pauseAnimator();

  const curTick = state.animator.currentTick;
  // Ищем следующее событие в сценарии по времени
  const nextEvent = state.animator.events.find(e => e.tick > curTick);

  if (nextEvent) {
    seekAnimatorTo(nextEvent.tick);
  } else if (curTick < state.animator.totalTicks) {
    seekAnimatorTo(state.animator.totalTicks);
  } else {
    resetAnimator();
  }
}

function toggleAnimatorPlay() {
  if (state.animator.isPlaying) {
    pauseAnimator();
  } else {
    playAnimator();
  }
}

function playAnimator() {
  if (state.animator.currentTick >= state.animator.totalTicks) {
    resetAnimator();
  }

  // Если запуск происходит с нулевого тика (с самого начала),
  // сразу же обрабатываем события тика 0 (title, subtitle, звуки на старте)!
  if (state.animator.currentTick === 0) {
    renderEventsAtTick(0);
  }

  state.animator.isPlaying = true;
  if (els.btnPlayIcon) els.btnPlayIcon.textContent = '⏸️';
  if (els.btnPlayText) els.btnPlayText.textContent = 'Пауза';

  restartTimer();
}

function pauseAnimator() {
  state.animator.isPlaying = false;
  if (els.btnPlayIcon) els.btnPlayIcon.textContent = '▶️';
  if (els.btnPlayText) els.btnPlayText.textContent = 'Старт';

  if (state.animator.timerId) {
    clearInterval(state.animator.timerId);
    state.animator.timerId = null;
  }
}

function stopAnimator() {
  pauseAnimator();
  resetAnimator();
}

function resetAnimator() {
  pauseAnimator();
  state.animator.currentTick = 0;
  clearAllViewportElements();
  if (els.animTimelineSlider) els.animTimelineSlider.value = 0;
  if (els.animStepLabel) els.animStepLabel.textContent = 'Готов к воспроизведению';
  updateTimelineLabels();
}

function restartTimer() {
  if (state.animator.timerId) {
    clearInterval(state.animator.timerId);
  }
  // 1 тик Minecraft = 50 мс
  const interval = Math.max(15, Math.round(50 / state.animator.playbackSpeed));
  state.animator.timerId = setInterval(animatorTickStep, interval);
}

function animatorTickStep() {
  state.animator.currentTick++;
  
  if (els.animTimelineSlider) {
    els.animTimelineSlider.value = state.animator.currentTick;
  }
  updateTimelineLabels();

  // Обрабатываем события, приходящиеся на данный тик
  renderEventsAtTick(state.animator.currentTick);

  // Очистка / затухание сообщений чата (если закрыт)
  stepChatFade();
  // Затухание звуковых субтитров
  stepSoundSubtitlesFade();

  if (state.animator.currentTick >= state.animator.totalTicks) {
    pauseAnimator();
    if (els.animStepLabel) els.animStepLabel.textContent = '🏁 Катсцена завершена';
  }
}

function seekAnimatorTo(tick) {
  state.animator.currentTick = tick;
  clearAllViewportElements();

  // Воспроизводим события вплоть до этой точки
  const evs = state.animator.events.filter(e => e.tick <= tick);
  evs.forEach(ev => {
    // Для чата добавляем только те, которые произошли недавно (до 100 тиков назад)
    if (ev.type === 'chat' && (tick - ev.tick) < 100) {
      displayChatMessage(ev.tokens, 100 - (tick - ev.tick));
    } else if (ev.type === 'title' && (tick - ev.tick) < 80) {
      displayTitle(ev.tokens, 80 - (tick - ev.tick));
    } else if (ev.type === 'subtitle') {
      displaySubtitle(ev.tokens);
    } else if (ev.type === 'actionbar' && (tick - ev.tick) < 60) {
      displayActionbar(ev.tokens, 60 - (tick - ev.tick));
    } else if (ev.type === 'bossbar') {
      displayBossbar(ev.color, ev.tokens);
    }
  });

  updateTimelineLabels();
}

function clearAllViewportElements() {
  if (els.animTitleBox) {
    els.animTitleBox.style.display = 'none';
    els.animTitleBox.style.opacity = '1';
  }
  if (els.animSubtitleBox) {
    els.animSubtitleBox.style.display = 'none';
    els.animSubtitleBox.style.opacity = '1';
  }
  if (els.animActionbarBox) {
    els.animActionbarBox.style.display = 'none';
    els.animActionbarBox.style.opacity = '1';
  }
  if (els.animChatMessages) {
    els.animChatMessages.innerHTML = '';
  }
  if (els.animSoundSubtitles) {
    els.animSoundSubtitles.innerHTML = '';
  }
  state.animator.activeChatMessages = [];
  state.animator.activeSounds = [];
  state.animator.pendingSubtitleTokens = null;
}

// Отображение событий в конкретный тик
function renderEventsAtTick(tick) {
  const currentEvents = state.animator.events.filter(e => e.tick === tick);

  // Сначала обрабатываем subtitle, если он есть в этот тик, чтобы зарегистрировать его до title!
  const subEvents = currentEvents.filter(e => e.type === 'subtitle');
  subEvents.forEach(ev => {
    displaySubtitle(ev.tokens);
    if (els.animStepLabel) els.animStepLabel.textContent = `📄 [Сабтайтл]`;
  });

  const otherEvents = currentEvents.filter(e => e.type !== 'subtitle');
  otherEvents.forEach(ev => {
    if (ev.type === 'title') {
      displayTitle(ev.tokens, 80);
      if (els.animStepLabel) els.animStepLabel.textContent = `🎬 [Тайтл]`;
    } else if (ev.type === 'actionbar') {
      displayActionbar(ev.tokens, 60);
      if (els.animStepLabel) els.animStepLabel.textContent = `⚡ [Экшнбар]`;
    } else if (ev.type === 'chat') {
      displayChatMessage(ev.tokens, 100);
      if (els.animStepLabel) els.animStepLabel.textContent = `💬 [Чат] Реплика`;
    } else if (ev.type === 'sound') {
      displaySoundSubtitle(ev.label, 60);
    } else if (ev.type === 'bossbar') {
      displayBossbar(ev.color, ev.tokens);
    }
  });
}

// Показ Title
function displayTitle(tokens, durationTicks) {
  if (!els.animTitleBox || !els.animTitleText) return;

  const times = state.titleTimes || { fadeIn: 10, stay: 70, fadeOut: 20 };
  const fadeInMs = Math.round((times.fadeIn * 50) / state.animator.playbackSpeed);
  const stayTicks = durationTicks !== undefined ? durationTicks : (times.stay + times.fadeOut);
  const fadeOutMs = Math.round((times.fadeOut * 50) / state.animator.playbackSpeed);

  // Настраиваем CSS transition скорости затухания под тайминги fade-out
  const fadeOutSec = (times.fadeOut / 20 / state.animator.playbackSpeed).toFixed(2);
  els.animTitleBox.style.transition = `opacity ${fadeOutSec}s ease`;
  if (els.animSubtitleBox) {
    els.animSubtitleBox.style.transition = `opacity ${fadeOutSec}s ease`;
  }

  els.animTitleText.innerHTML = tokensToHtml(tokens);
  els.animTitleBox.style.display = 'block';
  els.animTitleBox.style.opacity = '1';

  // Если был зарегистрирован отложенный сабтайтл, показываем его вместе с title!
  if (state.animator.pendingSubtitleTokens) {
    displayActiveSubtitle(state.animator.pendingSubtitleTokens);
  }

  clearTimeout(els.animTitleBox._timer);
  els.animTitleBox._timer = setTimeout(() => {
    // В Minecraft сабтайтл гаснет строго вместе с title!
    els.animTitleBox.style.opacity = '0';
    if (els.animSubtitleBox) els.animSubtitleBox.style.opacity = '0';

    setTimeout(() => {
      if (els.animTitleBox.style.opacity === '0') els.animTitleBox.style.display = 'none';
      if (els.animSubtitleBox && els.animSubtitleBox.style.opacity === '0') {
        els.animSubtitleBox.style.display = 'none';
      }
      state.animator.pendingSubtitleTokens = null;
    }, Math.max(100, fadeOutMs));
  }, Math.max(100, (stayTicks * 50) / state.animator.playbackSpeed));
}

// Регистрация / показ Subtitle (по правилам Minecraft)
function displaySubtitle(tokens) {
  if (!els.animSubtitleBox || !els.animSubtitleText) return;

  // В Minecraft: если title сейчас активен на экране, обновляем сабтайтл под ним!
  const isTitleActive = els.animTitleBox && els.animTitleBox.style.display !== 'none' && els.animTitleBox.style.opacity !== '0';

  if (isTitleActive) {
    displayActiveSubtitle(tokens);
  } else {
    // Если title ещё не был вызван, запоминаем subtitle, чтобы он появился в момент вызова title
    state.animator.pendingSubtitleTokens = tokens;
  }
}

function displayActiveSubtitle(tokens) {
  if (!els.animSubtitleBox || !els.animSubtitleText) return;
  els.animSubtitleText.innerHTML = tokensToHtml(tokens);
  els.animSubtitleBox.style.display = 'block';
  els.animSubtitleBox.style.opacity = '1';
}

// Показ Actionbar
function displayActionbar(tokens, durationTicks = 60) {
  if (!els.animActionbarBox || !els.animActionbarText) return;
  els.animActionbarText.innerHTML = tokensToHtml(tokens);
  els.animActionbarBox.style.display = 'block';
  els.animActionbarBox.style.opacity = '1';

  clearTimeout(els.animActionbarBox._timer);
  els.animActionbarBox._timer = setTimeout(() => {
    els.animActionbarBox.style.opacity = '0';
    setTimeout(() => {
      if (els.animActionbarBox.style.opacity === '0') els.animActionbarBox.style.display = 'none';
    }, 400);
  }, Math.max(100, durationTicks * 50 / state.animator.playbackSpeed));
}

// Показ Bossbar
function displayBossbar(color, tokens) {
  if (!els.animBossbarWrap || !els.animBossbarTitle || !els.animBossbarBar) return;
  els.animBossbarTitle.innerHTML = tokensToHtml(tokens);
  els.animBossbarBar.className = `anim-bossbar-bar color-${color || 'purple'}`;
  els.animBossbarWrap.style.display = 'flex';
}

// Показ сообщения в чате Minecraft
function displayChatMessage(tokens, remainingTicks = 100) {
  if (!els.animChatMessages) return;

  const lineEl = document.createElement('div');
  lineEl.className = 'anim-chat-line';
  lineEl.innerHTML = tokensToHtml(tokens);
  els.animChatMessages.appendChild(lineEl);

  state.animator.activeChatMessages.push({
    el: lineEl,
    remainingTicks: remainingTicks
  });

  // В закрытом чате Minecraft на экране помещается до 7 строк (~половина экрана)
  // В открытом чате храним до 100 сообщений с возможностью скролла
  const maxLines = (state.animator.chatMode === 'open') ? 100 : 7;
  while (els.animChatMessages.children.length > maxLines) {
    els.animChatMessages.removeChild(els.animChatMessages.firstChild);
  }

  // Автоскролл вниз при поступлении новых реплик
  els.animChatMessages.scrollTop = els.animChatMessages.scrollHeight;
}

// Шаг затухания чата
function stepChatFade() {
  if (state.animator.chatMode === 'open') return; // В открытом чате реплики не тают

  for (let i = state.animator.activeChatMessages.length - 1; i >= 0; i--) {
    const item = state.animator.activeChatMessages[i];
    item.remainingTicks--;

    if (item.remainingTicks <= 20 && !item.el.classList.contains('fading')) {
      item.el.classList.add('fading');
    }

    if (item.remainingTicks <= 0) {
      if (item.el.parentNode) {
        item.el.parentNode.removeChild(item.el);
      }
      state.animator.activeChatMessages.splice(i, 1);
    }
  }
}

// Показ субтитра звука Minecraft
function displaySoundSubtitle(label, remainingTicks = 60) {
  if (!els.animSoundSubtitles) return;

  const chip = document.createElement('div');
  chip.className = 'anim-sound-chip';
  chip.innerHTML = `
    <span class=\"anim-sound-icon\">🔔</span>
    <span class=\"anim-sound-text\">${escapeHtml(label)}</span>
    <span class=\"anim-sound-arrow\">&gt;</span>
  `;
  els.animSoundSubtitles.appendChild(chip);

  state.animator.activeSounds.push({
    el: chip,
    remainingTicks: remainingTicks
  });
}

function stepSoundSubtitlesFade() {
  for (let i = state.animator.activeSounds.length - 1; i >= 0; i--) {
    const item = state.animator.activeSounds[i];
    item.remainingTicks--;

    if (item.remainingTicks <= 15 && !item.el.classList.contains('fading')) {
      item.el.classList.add('fading');
    }

    if (item.remainingTicks <= 0) {
      if (item.el.parentNode) {
        item.el.parentNode.removeChild(item.el);
      }
      state.animator.activeSounds.splice(i, 1);
    }
  }
}

// --- Анимация Minecraft Obfuscated (&k) ---
function startObfuscationLoop() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~|}{[]:;?><,./-=';
  setInterval(() => {
    const obfEls = document.querySelectorAll('.mc-obfuscated');
    obfEls.forEach(el => {
      const len = el.getAttribute('data-text')?.length || 4;
      let rand = '';
      for (let i = 0; i < len; i++) {
        rand += chars[Math.floor(Math.random() * chars.length)];
      }
      el.textContent = rand;
    });
  }, 50);
}

// --- Вспомогательные функции ---
function showCopyToast(msg) {
  if (!els.copyStatusTip) return;
  els.copyStatusTip.textContent = msg;
  els.copyStatusTip.style.opacity = '1';
  setTimeout(() => {
    if (els.copyStatusTip) els.copyStatusTip.style.opacity = '0';
  }, 2200);
}

function escapeHtml(text) {
  return (text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getNoun(number, one, two, five) {
  let n = Math.abs(number);
  n %= 100;
  if (n >= 5 && n <= 20) return five;
  n %= 10;
  if (n === 1) return one;
  if (n >= 2 && n <= 4) return two;
  return five;
}

// --- LocalStorage ---
function saveToLocalStorage() {
  try {
    const data = {
      script: els.scriptInput ? els.scriptInput.value : '',
      characters: state.characters,
      selector: state.selector,
      useBuilderSelector: state.useBuilderSelector,
      builderSelector: state.builderSelector,
      hexFormat: state.hexFormat,
      chatBgMode: state.chatBgMode,
      chatOpacity: state.chatOpacity,
      format: state.format,
      playSoundEnabled: state.playSoundEnabled,
      playSoundName: state.playSoundName,
      editorHintsEnabled: state.editorHintsEnabled,
      titleTimes: state.titleTimes,
      activeUpperTab: state.activeUpperTab,
      activeLowerTab: state.activeLowerTab
    };
    localStorage.setItem('fluffylore_state', JSON.stringify(data));
  } catch (e) {}
}

function applyStateToUI() {
  if (els.exportSelector) els.exportSelector.value = state.selector || '@a';
  if (els.exportFormat) els.exportFormat.value = state.format || 'tellraw';
  if (els.hexFormatSelect) els.hexFormatSelect.value = state.hexFormat || 'no-hash';
  if (els.chkPlaysound) els.chkPlaysound.checked = !!state.playSoundEnabled;
  if (els.chkEditorHints) els.chkEditorHints.checked = state.editorHintsEnabled !== false;
  if (els.inpTitleFadeIn && state.titleTimes) els.inpTitleFadeIn.value = state.titleTimes.fadeIn ?? 10;
  if (els.inpTitleStay && state.titleTimes) els.inpTitleStay.value = state.titleTimes.stay ?? 70;
  if (els.inpTitleFadeOut && state.titleTimes) els.inpTitleFadeOut.value = state.titleTimes.fadeOut ?? 20;
  if (els.playsoundInput) {
    els.playsoundInput.style.display = state.playSoundEnabled ? 'inline-block' : 'none';
    els.playsoundInput.value = state.playSoundName || 'entity.experience_orb.pickup';
  }

  if (els.chkUseBuilderSelector) {
    els.chkUseBuilderSelector.checked = state.useBuilderSelector;
  }
  if (els.manualSelectorWrap) {
    els.manualSelectorWrap.style.display = state.useBuilderSelector ? 'none' : 'flex';
  }

  if (state.builderSelector) {
    if (els.selBaseTarget) els.selBaseTarget.value = state.builderSelector.base || '@a';
    if (els.selPlayerName) els.selPlayerName.value = state.builderSelector.player || '';
    if (els.selTag) els.selTag.value = state.builderSelector.tag || '';
    if (els.selDistance) els.selDistance.value = state.builderSelector.distance || '';
    if (els.selLimit) els.selLimit.value = state.builderSelector.limit || '';
    if (els.selSort) els.selSort.value = state.builderSelector.sort || '';
    if (els.selTeam) els.selTeam.value = state.builderSelector.team || '';
    if (els.selGamemode) els.selGamemode.value = state.builderSelector.gamemode || '';
    if (els.selCustomArgs) els.selCustomArgs.value = state.builderSelector.custom || '';

    if (els.wrapPlayerName) {
      els.wrapPlayerName.style.display = (state.builderSelector.base === 'player') ? 'flex' : 'none';
    }
  }

  applyChatViewportControls();
}

function loadFromLocalStorage() {
  try {
    const saved = localStorage.getItem('fluffylore_state') || localStorage.getItem('lorehelper_state');
    if (!saved) {
      if (els.scriptInput && !els.scriptInput.value) {
        els.scriptInput.value = DEFAULT_SAMPLE_DIALOGUE;
      }
      return;
    }
    const data = JSON.parse(saved);
    if (data.script !== undefined && els.scriptInput) els.scriptInput.value = data.script;

    if (Array.isArray(data.characters) && data.characters.length > 0) {
      state.characters = data.characters;
    }

    if (data.selector) state.selector = data.selector;
    if (data.useBuilderSelector !== undefined) state.useBuilderSelector = data.useBuilderSelector;
    if (data.builderSelector) state.builderSelector = { ...state.builderSelector, ...data.builderSelector };
    if (data.hexFormat) state.hexFormat = data.hexFormat;
    if (data.chatBgMode) state.chatBgMode = data.chatBgMode;
    if (data.chatOpacity !== undefined) state.chatOpacity = data.chatOpacity;
    if (data.format) state.format = data.format;
    if (data.playSoundEnabled !== undefined) state.playSoundEnabled = data.playSoundEnabled;
    if (data.playSoundName) state.playSoundName = data.playSoundName;
    if (data.titleTimes) {
      state.titleTimes = { ...state.titleTimes, ...data.titleTimes };
    }
    if (data.editorHintsEnabled !== undefined) state.editorHintsEnabled = data.editorHintsEnabled;
    if (data.activeUpperTab) state.activeUpperTab = data.activeUpperTab;
    if (data.activeLowerTab) state.activeLowerTab = data.activeLowerTab;

    applyStateToUI();

    // Восстановление активных вкладок
    if (state.activeUpperTab && els.tabBtnChars && els.tabBtnSelector) {
      const isChars = state.activeUpperTab === 'tab-chars';
      els.tabBtnChars.classList.toggle('active', isChars);
      els.tabChars.classList.toggle('active', isChars);
      els.tabBtnSelector.classList.toggle('active', !isChars);
      els.tabSelector.classList.toggle('active', !isChars);
    }

    if (state.activeLowerTab && els.tabBtnPreview && els.tabBtnExport) {
      const isPreview = state.activeLowerTab === 'tab-preview';
      els.tabBtnPreview.classList.toggle('active', isPreview);
      els.tabPreview.classList.toggle('active', isPreview);
      els.tabBtnExport.classList.toggle('active', !isPreview);
      els.tabExport.classList.toggle('active', !isPreview);
      updateControlBarsVisibility();
    }
  } catch (e) {}
}

window.addEventListener('DOMContentLoaded', init);
