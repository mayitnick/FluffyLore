/**
 * LoreHelper — Инженерное ядро редактора диалогов и компилятора Tellraw
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
      id: 'char_vay',
      trigger: 'Вай',
      displayName: '&b&lВай',
      separator: ': ',
      msgColor: '&f',
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
  customSelector: '',
  format: 'tellraw',
  playSoundEnabled: false,
  playSoundName: 'entity.experience_orb.pickup',
  lastFocusedInput: null
};

// DOM Элементы
const els = {
  scriptInput: document.getElementById('script-input'),
  lineNumbers: document.getElementById('line-numbers'),
  lineCountBadge: document.getElementById('line-count-badge'),
  charCountBadge: document.getElementById('char-count-badge'),
  commandCountBadge: document.getElementById('command-count-badge'),
  charRulesList: document.getElementById('character-rules-list'),
  mcChatScreen: document.getElementById('mc-chat-screen'),
  exportCodeOutput: document.getElementById('export-code-output'),
  paletteColors: document.getElementById('palette-colors'),
  paletteFormats: document.getElementById('palette-formats'),
  hexColorPicker: document.getElementById('hex-color-picker'),
  btnInsertHex: document.getElementById('btn-insert-hex'),
  btnAddCharacter: document.getElementById('btn-add-character'),
  exportSelector: document.getElementById('export-selector'),
  customSelectorInput: document.getElementById('custom-selector-input'),
  exportFormat: document.getElementById('export-format'),
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
  panelRules: document.getElementById('panel-rules'),
  workspace: document.getElementById('workspace')
};

// --- Инициализация интерфейса ---
function init() {
  buildColorPalette();
  loadFromLocalStorage();
  renderCharacterRules();
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

  // Вызываем обновление
  if (target === els.scriptInput) {
    updateEditor();
  } else {
    target.dispatchEvent(new Event('input', { bubbles: true }));
  }
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
    // Проверка HEX формата &#rrggbb или #rrggbb
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
        // В Minecraft выбор цвета сбрасывает текущие стили жирности/курсива
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

// Преобразование токенов в Minecraft Tellraw JSON структуру
function tokensToTellrawJson(tokens) {
  if (!tokens || tokens.length === 0) return '[""]';

  const parts = ['']; // Пустая строка в начале — стандарт безопасности tellraw
  tokens.forEach(tok => {
    if (!tok.text) return;
    const obj = { text: tok.text };
    if (tok.color) obj.color = tok.color;
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
      if (entry) prefix += `§${entry[0]}`;
      else if (tok.color.startsWith('#')) prefix += `§x` + tok.color.slice(1).split('').map(c => `§${c}`).join('');
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

    // Проверяем авторскую ремарку в звездочках *действие*
    if (rawLine.trim().startsWith('*') && rawLine.trim().endsWith('*') && rawLine.trim().length > 1) {
      const narratorRule = state.characters.find(c => c.trigger === '*' && c.enabled);
      if (narratorRule) {
        matchedRule = narratorRule;
        speechText = rawLine.trim();
      }
    } else {
      // Ищем совпадение персонажа
      for (const rule of state.characters) {
        if (!rule.enabled || !rule.trigger || rule.trigger === '*') continue;

        const trig = rule.trigger;
        // Разделители: ":", "»", ">", "-", "—" или пробел
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
      // Персонаж распознан
      const prefixStr = matchedRule.prefix || '';
      const nameStr = matchedRule.displayName || matchedRule.trigger;
      const sepStr = matchedRule.separator !== undefined ? matchedRule.separator : ': ';

      // Токены имени
      const nameTokens = parseMinecraftTokens(prefixStr + nameStr + sepStr);

      // Токены реплики (с базовым цветом реплики персонажа)
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
      // Авторская ремарка
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
      // Обычная строка без персонажа
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
  const scriptText = els.scriptInput.value;
  const lines = scriptText.split('\n');

  // 1. Номера строк
  els.lineNumbers.textContent = Array.from({ length: lines.length }, (_, i) => i + 1).join('\n');
  els.lineCountBadge.textContent = `${lines.length} ${getNoun(lines.length, 'строка', 'строки', 'строк')}`;

  // 2. Обработка сценария
  const processed = processScriptLines(scriptText);
  els.commandCountBadge.textContent = `${processed.length} ${getNoun(processed.length, 'команда', 'команды', 'команд')}`;

  // 3. Minecraft Chat Preview
  if (processed.length === 0) {
    els.mcChatScreen.innerHTML = '<div class="mc-chat-empty">Здесь появится диалог в реальном времени...</div>';
  } else {
    els.mcChatScreen.innerHTML = processed.map(item => {
      const html = tokensToHtml(item.tokens);
      return `<div class="mc-chat-line">${html}</div>`;
    }).join('');
    // Прокручиваем чат вниз к последней реплике
    els.mcChatScreen.scrollTop = els.mcChatScreen.scrollHeight;
  }

  // 4. Генерация вывода команд
  const selector = state.selector === 'custom' ? (state.customSelector || '@a') : state.selector;
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

  els.exportCodeOutput.textContent = commandLines.join('\n');

  // 5. Сохранение в LocalStorage
  saveToLocalStorage();
}

// --- Рендер карточек персонажей ---
function renderCharacterRules() {
  els.charRulesList.innerHTML = '';
  els.charCountBadge.textContent = `${state.characters.length} ${getNoun(state.characters.length, 'персонаж', 'персонажа', 'персонажей')}`;

  state.characters.forEach((char, index) => {
    const card = document.createElement('div');
    card.className = 'char-rule-card';

    // Превью имени
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

    // Инпуты карточки
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
        // Обновляем превью имя
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
  // Скролл номеров строк вместе с редактором
  els.scriptInput.addEventListener('scroll', () => {
    els.lineNumbers.scrollTop = els.scriptInput.scrollTop;
  });

  els.scriptInput.addEventListener('focus', () => {
    state.lastFocusedInput = els.scriptInput;
  });

  els.scriptInput.addEventListener('input', updateEditor);

  // Добавление персонажа
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

  // Вставка HEX цвета
  els.btnInsertHex.addEventListener('click', () => {
    const hex = els.hexColorPicker.value;
    insertCodeAtCursor(`&#${hex.replace('#', '')}`);
  });

  // Селектор
  els.exportSelector.addEventListener('change', (e) => {
    state.selector = e.target.value;
    if (state.selector === 'custom') {
      els.customSelectorInput.style.display = 'inline-block';
      els.customSelectorInput.focus();
    } else {
      els.customSelectorInput.style.display = 'none';
    }
    updateEditor();
  });

  els.customSelectorInput.addEventListener('input', (e) => {
    state.customSelector = e.target.value;
    updateEditor();
  });

  // Формат
  els.exportFormat.addEventListener('change', (e) => {
    state.format = e.target.value;
    updateEditor();
  });

  // Звук
  els.chkPlaysound.addEventListener('change', (e) => {
    state.playSoundEnabled = e.target.checked;
    els.playsoundInput.style.display = state.playSoundEnabled ? 'inline-block' : 'none';
    updateEditor();
  });

  els.playsoundInput.addEventListener('input', (e) => {
    state.playSoundName = e.target.value;
    updateEditor();
  });

  // Копирование всех команд
  els.btnCopyAll.addEventListener('click', async () => {
    const text = els.exportCodeOutput.textContent;
    if (!text.trim()) return;

    try {
      await navigator.clipboard.writeText(text);
      showCopyToast('✅ Скопировано в буфер обмена!');
    } catch (err) {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showCopyToast('✅ Скопировано!');
    }
  });

  // Скачать .mcfunction
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

  // Пример диалога
  els.btnSampleData.addEventListener('click', () => {
    els.scriptInput.value = `Сенко: Добро пожаловать домой, Вай! Чай уже готов~
Вай: Спасибо, Сенко! Как прошёл твой день?
*На плите тихо и уютно шумит медный чайник с жасминовым чаем*
Сенко: Всё замечательно! Садись скорее, я приготовила жареный тофу и налила тебе полную чашку!
Вай: Ты просто волшебная! Рядом с тобой любая усталость мигом улетучивается.
Сенко: Хи-хи, на то я и лиса-помощница! А теперь кушай и отдыхай, ты сегодня славно потрудился~`;
    updateEditor();
  });

  // Очистка
  els.btnClearAll.addEventListener('click', () => {
    if (confirm('Очистить текст сценария?')) {
      els.scriptInput.value = '';
      updateEditor();
    }
  });

  // Экспорт проекта в JSON
  els.btnExportProject.addEventListener('click', () => {
    const project = {
      version: 1,
      script: els.scriptInput.value,
      characters: state.characters,
      selector: state.selector,
      customSelector: state.customSelector,
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

  // Импорт проекта
  els.fileImportProject.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.script !== undefined) els.scriptInput.value = data.script;
        if (Array.isArray(data.characters)) state.characters = data.characters;
        if (data.selector) state.selector = data.selector;
        if (data.customSelector) state.customSelector = data.customSelector;
        if (data.format) state.format = data.format;
        if (data.playSoundEnabled !== undefined) state.playSoundEnabled = data.playSoundEnabled;
        if (data.playSoundName) state.playSoundName = data.playSoundName;

        els.exportSelector.value = state.selector;
        els.customSelectorInput.value = state.customSelector || '';
        els.customSelectorInput.style.display = state.selector === 'custom' ? 'inline-block' : 'none';
        els.exportFormat.value = state.format;
        els.chkPlaysound.checked = state.playSoundEnabled;
        els.playsoundInput.style.display = state.playSoundEnabled ? 'inline-block' : 'none';
        els.playsoundInput.value = state.playSoundName;

        renderCharacterRules();
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

// --- Управление Drag-сплиттерами ---
function setupResizers() {
  // Горизонтальный сплиттер (между левой и правой колонкой)
  let isDraggingMain = false;
  els.resizerMain.addEventListener('mousedown', (e) => {
    isDraggingMain = true;
    els.resizerMain.classList.add('dragging');
    document.body.style.cursor = 'col-resize';
  });

  // Вертикальный сплиттер (между верхней и нижней частью справа)
  let isDraggingSub = false;
  els.resizerSub.addEventListener('mousedown', (e) => {
    isDraggingSub = true;
    els.resizerSub.classList.add('dragging');
    document.body.style.cursor = 'row-resize';
  });

  window.addEventListener('mousemove', (e) => {
    if (isDraggingMain) {
      const containerWidth = els.workspace.clientWidth;
      const newWidth = (e.clientX / containerWidth) * 100;
      if (newWidth > 20 && newWidth < 80) {
        els.panelLeft.style.width = `${newWidth}%`;
      }
    }
    if (isDraggingSub) {
      const rightPanel = document.getElementById('panel-right');
      const rect = rightPanel.getBoundingClientRect();
      const newHeight = ((e.clientY - rect.top) / rect.height) * 100;
      if (newHeight > 25 && newHeight < 85) {
        els.panelRules.style.height = `${newHeight}%`;
      }
    }
  });

  window.addEventListener('mouseup', () => {
    if (isDraggingMain) {
      isDraggingMain = false;
      els.resizerMain.classList.remove('dragging');
      document.body.style.cursor = '';
    }
    if (isDraggingSub) {
      isDraggingSub = false;
      els.resizerSub.classList.remove('dragging');
      document.body.style.cursor = '';
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
  els.copyStatusTip.textContent = msg;
  els.copyStatusTip.style.opacity = '1';
  setTimeout(() => {
    els.copyStatusTip.style.opacity = '0';
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

// Сохранение и загрузка LocalStorage
function saveToLocalStorage() {
  try {
    const data = {
      script: els.scriptInput.value,
      characters: state.characters,
      selector: state.selector,
      customSelector: state.customSelector,
      format: state.format,
      playSoundEnabled: state.playSoundEnabled,
      playSoundName: state.playSoundName
    };
    localStorage.setItem('fluffylore_state', JSON.stringify(data));
  } catch (e) {}
}

function loadFromLocalStorage() {
  try {
    const saved = localStorage.getItem('fluffylore_state') || localStorage.getItem('lorehelper_state');
    if (!saved) return;
    const data = JSON.parse(saved);
    if (data.script !== undefined) els.scriptInput.value = data.script;
    if (Array.isArray(data.characters) && data.characters.length > 0) state.characters = data.characters;
    if (data.selector) state.selector = data.selector;
    if (data.customSelector) state.customSelector = data.customSelector;
    if (data.format) state.format = data.format;
    if (data.playSoundEnabled !== undefined) state.playSoundEnabled = data.playSoundEnabled;
    if (data.playSoundName) state.playSoundName = data.playSoundName;

    els.exportSelector.value = state.selector;
    els.customSelectorInput.value = state.customSelector || '';
    els.customSelectorInput.style.display = state.selector === 'custom' ? 'inline-block' : 'none';
    els.exportFormat.value = state.format;
    els.chkPlaysound.checked = state.playSoundEnabled;
    els.playsoundInput.style.display = state.playSoundEnabled ? 'inline-block' : 'none';
    els.playsoundInput.value = state.playSoundName;
  } catch (e) {}
}

// Запуск при загрузке страницы
window.addEventListener('DOMContentLoaded', init);
