document.addEventListener('DOMContentLoaded', function() {

    
    // --- Змінні та Елементи DOM ---
    const gameContainer = document.getElementById('game-container');

    // Ініціалізація елементів гри (виконується тільки на сторінці гри)
    if (gameContainer) {
        const controls = document.querySelectorAll('#game-controls input[type="radio"]');
    const immuneValueSpan = document.querySelector('#metric-immune .metric-value');
    const hookValueSpan = document.querySelector('#metric-hook .metric-value');
    const immuneBox = document.getElementById('metric-immune');
    const hookBox = document.getElementById('metric-hook');
    const message = document.getElementById('simulation-message');
    const playButton = document.getElementById('play-rhythm-button');
    const currentRhythmInfo = document.getElementById('current-rhythm-info');
    
    // Зберігаємо ID останньої вибраної структури для подвійного кліку
    let lastSelectedStructureId = null;
    
    // --- 1. МАПА АУДІО ЕЛЕМЕНТІВ (ВИКОРИСТОВУЮЧИ ПОВНІ НАЗВИ ID) ---
    const audioMapping = {
        'alpha_linear': document.getElementById('audio-alpha_linear'),
        'alpha_hook': document.getElementById('audio-alpha_hook'),
        'alpha_repetition': document.getElementById('audio-alpha_repetition'),
        'beta_linear': document.getElementById('audio-beta_linear'),
        'beta_hook': document.getElementById('audio-beta_hook'),
        'beta_repetition': document.getElementById('audio-beta_repetition'),
        'chaos_linear': document.getElementById('audio-chaos_linear'),
        'chaos_hook': document.getElementById('audio-chaos_hook'),
        'chaos_repetition': document.getElementById('audio-chaos_repetition'),
        'alpha_standart': document.getElementById('audio-alpha_standart'),
        'beta_standart': document.getElementById('audio-beta_standart'),
        'chaos_standart': document.getElementById('audio-chaos_standart'),
    };

    const allAudio = Object.values(audioMapping).filter(audio => audio !== null);

    // --- 2. ФУНКЦІЯ ЗУПИНКИ ---
    function stopAllAudio() {
        allAudio.forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
        playButton.textContent = '▶ Слухати обраний ритм';
    }

    // --- 3. ФУНКЦІЯ ВИЗНАЧЕННЯ ПОТОЧНОГО АУДІО ---
    function getCurrentAudio() {
        const currentRhythmElement = document.querySelector('input[name="rhythm"]:checked');
        const currentStructureElement = document.querySelector('input[name="structure"]:checked');
        
        const rhythmType = currentRhythmElement ? currentRhythmElement.value : null;
        const structureType = currentStructureElement ? currentStructureElement.value : null;

        if (!rhythmType) {
            currentRhythmInfo.textContent = `Обрано: Не вибрано`;
            return null;
        }

        let audioKey;
        
        if (structureType) {
            // Комбінований аудіофайл (наприклад, alpha_linear)
            audioKey = `${rhythmType}_${structureType}`;
        } else {
            // Стандартний аудіофайл (наприклад, alpha_standart)
            audioKey = `${rhythmType}_standart`;
        }

        // Оновлення інформаційного рядка
        const structureLabelElement = document.querySelector(`label[for="structure-${structureType}"]`);
        const rhythmLabelElement = document.querySelector(`label[for="rhythm-${rhythmType}"]`);

        let structureName = structureType && structureLabelElement ?
            structureLabelElement.textContent.split(':')[0].trim() :
            '(Стандарт)';
        
        let rhythmName = rhythmType && rhythmLabelElement ?
            rhythmLabelElement.textContent.split(':')[0].trim() :
            'Не вибрано';

        currentRhythmInfo.textContent = `Обрано: ${rhythmName} + ${structureName}`;
        
        return audioMapping[audioKey] || null; // Повертає елемент <audio> або null
    }

    // --- 4. ФУНКЦІЯ ЗАПУСКУ ---
    function startRhythmPlayback() {
        const currentAudio = getCurrentAudio();
        
        if (!currentAudio) {
            stopAllAudio();
            return;
        }

        stopAllAudio();
        
        currentAudio.play()
            .then(() => {
                playButton.textContent = '⏸ Зупинити відтворення';
            })
            .catch(e => {
                // Браузер заблокував autoplay, залишаємо кнопку для ручного запуску
                console.warn("Autoplay заблоковано. Будь ласка, натисніть 'Слухати' вручну.", e);
                playButton.textContent = '▶ Слухати обраний ритм';
            });
    }
    
    // --- 5. ЛОГІКА МЕТРИК ---
    const scores = {
        'rhythm-alpha': [4, 0],
        'rhythm-beta': [0, 4],
        'rhythm-chaos': [-2, 2],
        'structure-linear': [3, 1],
        'structure-hook': [-1, 4],
        'structure-repetition': [2, 2]
    };

    function updateSimulation() {
        let totalImmune = 0;
        let totalHook = 0;
        let currentRhythm = document.querySelector('input[name="rhythm"]:checked');
        let currentStructure = document.querySelector('input[name="structure"]:checked');
        
        getCurrentAudio(); // Оновлення інфо та визначення поточного аудіо

        if (currentRhythm && scores[currentRhythm.id]) {
            totalImmune += scores[currentRhythm.id][0];
            totalHook += scores[currentRhythm.id][1];
        }
        
        if (currentStructure && scores[currentStructure.id]) {
            totalImmune += scores[currentStructure.id][0];
            totalHook += scores[currentStructure.id][1];
        }
        
        immuneValueSpan.textContent = totalImmune;
        hookValueSpan.textContent = totalHook;

        // Логіка кольорів та повідомлень (як у попередніх версіях)
        let finalMessage = "Оберіть параметри вище, щоб побачити, як змінюються ваші метрики. Спробуйте досягти балансу або максимізувати один з показників!";
        let messageColor = '#333';
        let messageBg = '#fff3cd';
        
        if (totalImmune >= 6 && totalHook < 4) {
            finalMessage = "🛡️ Досягнуто високого рівня Ментального Імунітету. Ваш контент надійний та гармонійний.";
            messageColor = '#155724';
            messageBg = '#d4edda';
        } else if (totalHook >= 6 && totalImmune < 4) {
            finalMessage = "🔥 Досягнуто високого Когнітивного Зачеплення. Ваш контент привертає максимальну увагу, але ризикований!";
            messageColor = '#856404';
            messageBg = '#fff3cd';
        } else if (totalImmune >= 4 && totalHook >= 4) {
            finalMessage = "⚖️ Досягнуто оптимального Резонансу. Хороший баланс між захистом та увагою.";
            messageColor = '#004085';
            messageBg = '#cce5ff';
        }
        
        message.textContent = finalMessage;
        message.style.color = messageColor;
        message.style.backgroundColor = messageBg;

        const maxScore = 8;
        const minScore = -3;
        const normImmune = Math.max(0, (totalImmune - minScore) / (maxScore - minScore));
        const normHook = Math.max(0, (totalHook - minScore) / (maxScore - minScore));

        immuneBox.style.backgroundColor = `rgba(40, 167, 69, ${0.1 + normImmune * 0.4})`;
        hookBox.style.backgroundColor = `rgba(255, 193, 7, ${0.1 + normHook * 0.4})`;
    }


        // --- 6. ОБРОБНИКИ ПОДІЙ ---
        controls.forEach(control => {
        
        // 1. Обробник для всіх радіо-кнопок
        control.addEventListener('change', function() {
            updateSimulation();
            startRhythmPlayback();
            
            // Оновлюємо останній вибраний ID структури після зміни
            if (this.name === 'structure' && this.checked) {
                lastSelectedStructureId = this.id;
            }
        });

        // 2. Обробник для СКИНАННЯ ВИБОРУ СТРУКТУРИ при повторному кліку
        if (control.name === 'structure') {
            control.addEventListener('click', function(event) {
                if (this.id === lastSelectedStructureId) {
                    // Викликаємо нативно click(), щоб зняти вибір. Це працює у більшості браузерів.
                    event.preventDefault();
                    this.checked = false;
                    lastSelectedStructureId = null;

                    updateSimulation();
                    startRhythmPlayback();
                }
            });
        }
    });
    
    // 3. Функція для ручного керування кнопкою (надійний запуск/пауза)
    playButton.addEventListener('click', () => {
          const currentAudio = getCurrentAudio();
          
          if (currentAudio) {
              if (!currentAudio.paused) {
                  // Пауза
                  currentAudio.pause();
                  playButton.textContent = '▶ Слухати обраний ритм';
              } else {
                  // Запуск
                  startRhythmPlayback();
              }
          } else {
              // Якщо аудіо не визначено (не обрана частота), просто зупиняємо все
              stopAllAudio();
          }
    });

        // Початкове оновлення та спроба запуску
        updateSimulation();
        // Викликаємо startRhythmPlayback тільки після першої взаємодії користувача
        // Тому ми не викликаємо її тут одразу. Запуск відбудеться при кліку на частоту/структуру/кнопку.
    }

    // --- ІНДЕКСНА СТОРІНКА: обробник кнопки "Дізнатись детальніше" ---
    const discoverButton = document.getElementById('discover-button');
    const promoScreen = document.getElementById('promo-screen');
    // ЗМІНА ТУТ: Замість iframe тепер очікуємо елемент <video>
    const promoVideoElement = document.getElementById('promo-video');
    const mainContent = document.getElementById('main-content');

    if (discoverButton) {
        discoverButton.addEventListener('click', (e) => {
            
            // ЗМІНА ТУТ: Зупиняємо HTML5-відео
            try {
                if (promoVideoElement && promoVideoElement.tagName === 'VIDEO') {
                    // Зупиняємо відтворення та перемотуємо на початок
                    promoVideoElement.pause();
                    promoVideoElement.currentTime = 0; 
                }
            } catch (err) {
                console.warn('Не вдалося зупинити промо-відео:', err);
            }

            // Приховуємо промо-екран і показуємо основний контент
            if (promoScreen) promoScreen.style.display = 'none';
            if (mainContent) {
                mainContent.classList.add('visible');
                // Плавно скролимо до контенту
                mainContent.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

});