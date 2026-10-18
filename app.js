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

const DEFAULT_SAMPLE_DIALOGUE = `Широ: Эй, Сенко! Смотри, как великая богиня Широ умеет повелевать молниями!
Сенко: Широ-сама, пожалуйста, поосторожнее! Вы же разобьёте сервиз для чая~
*Широ с гордым видом складывает руки на груди и виляет белым пушистым хвостом*
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
  playSoundEnabled: false,
  playSoundName: 'entity.experience_orb.pickup',
  lastFocusedInput: null,
  activeUpperTab: 'tab-chars',
  activeLowerTab: 'tab-preview'
};

// DOM Элементы
let els = {};

function initDomRefs() {
  els = {
    scriptInput: document.getElementById('script-input'),
    lineNumbers: document.getElementById('line-numbers'),
    lineCountBadge: document.getElementById('line-count-badge'),
    charCountBadge: document.getElementById('char-count-badge'),
    commandCountBadge: document.getElementById('command-count-badge'),
    charRulesList: document.getElementById('character-rules-list'),
    mcViewport: document.getElementById('mc-viewport'),
    mcChatScreen: document.getElementById('mc-chat-screen'),
    exportCodeOutput: document.getElementById('export-code-output'),
    paletteColors: document.getElementById('palette-colors'),
    paletteFormats: document.getElementById('palette-formats'),
    hexColorPicker: document.getElementById('hex-color-picker'),
    btnInsertHex: document.getElementById('btn-insert-hex'),
    btnAddCharacter: document.getElementById('btn-add-character'),
    exportSelector: document.getElementById('export-selector'),
    exportFormat: document.getElementById('export-format'),
    hexFormatSelect: document.getElementById('hex-format-select'),
    manualSelectorWrap: document.getElementById('manual-selector-wrap'),
    chkPlaysound: document.getElementById('chk-playsound'),
    playsoundInput: document.getElementById('playsound-input'),
    btnCopyAll: document.getElementById('btn-copy-all'),
    btnDownloadMcfunction: document.getElementById('btn-download-mcfunction'),
    copyStatusTip: document.getElementById('copy-status-tip'),
    btnSampleData: document.getElementById('btn-sample-data'),
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
    chatOpacityVal: document.getElementById('chat-opacity-val')
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
    if (rawLine.trim() === '') {
      continue;
    }

    let matchedRule = null;
    let characterName = '';
    let speechText = rawLine;

    // Авторская ремарка в звездочках *действие*
    if (rawLine.trim().startsWith('*') && rawLine.trim().endsWith('*') && rawLine.trim().length > 1) {
      const narratorRule = state.characters.find(c => c.trigger === '*' && c.enabled);
      if (narratorRule) {
        matchedRule = narratorRule;
        speechText = rawLine.trim();
      }
    } else {
      for (const rule of state.characters) {
        if (!rule.enabled || !rule.trigger || rule.trigger === '*') continue;

        const trig = rule.trigger;
        const pattern = new RegExp(`^(${escapeRegExp(trig)})([:»>—\\-]\\s*|\\s+)(.*)$`, 'i');
        const match = rawLine.match(pattern);

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
      combinedTokens = parseMinecraftTokens(rawLine);
    }

    results.push({
      lineIndex: idx + 1,
      rawLine,
      tokens: combinedTokens
    });
  }

  return results;
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
        const html = tokensToHtml(item.tokens);
        return `<div class="mc-chat-line">${html}</div>`;
      }).join('');
      els.mcChatScreen.scrollTop = els.mcChatScreen.scrollHeight;
    }
  }

  // Генерация команд
  const selector = getEffectiveSelector();
  const commandLines = [];

  processed.forEach(item => {
    if (state.playSoundEnabled && state.playSoundName.trim()) {
      commandLines.push(`playsound ${state.playSoundName.trim()} voice ${selector} ~ ~ ~ 1 1`);
    }

    if (state.format === 'tellraw') {
      const json = tokensToTellrawJson(item.tokens);
      commandLines.push(`tellraw ${selector} ${json}`);
    } else if (state.format === 'json') {
      commandLines.push(tokensToTellrawJson(item.tokens));
    } else if (state.format === 'legacy') {
      commandLines.push(tokensToLegacyString(item.tokens));
    }
  });

  if (els.exportCodeOutput) {
    els.exportCodeOutput.textContent = commandLines.join('\n');
  }

  saveToLocalStorage();
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
        updateEditor();
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
      state.characters = data.characters.map(char => {
        // Миграция старого персонажа Вай на Широ
        if (char.trigger === 'Вай') {
          return {
            ...char,
            id: 'char_shiro',
            trigger: 'Широ',
            displayName: '&f&lШиро',
            msgColor: '&b'
          };
        }
        return char;
      });
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
