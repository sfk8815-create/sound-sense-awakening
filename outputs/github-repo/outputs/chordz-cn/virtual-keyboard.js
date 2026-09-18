/**
 * 屏幕虚拟键盘：给需要用乐器作答的练习模块提供鼠标输入方式。
 * 点击琴键会发出对应音高，并把该音交给当前页面的训练逻辑判定。
 */
(function () {
    "use strict";

    var WHITE_NOTES = ["C", "D", "E", "F", "G", "A", "B"];
    var BLACK_AFTER = { C: "C#", D: "D#", F: "F#", G: "G#", A: "A#" };
    var SHARP_ORDER = { C: 0, "C#": 1, D: 2, "D#": 3, E: 4, F: 5, "F#": 6, G: 7, "G#": 8, A: 9, "A#": 10, B: 11 };

    var state = {
        startOctave: 3,
        octaves: 3,
        context: null,
    };

    function noteToFrequency(note) {
        var match = /^([A-G]#?)(-?\d)$/.exec(note);
        if (!match) return 440;
        var semitone = SHARP_ORDER[match[1]];
        if (semitone === undefined) return 440;
        var octave = Number(match[2]);
        var midi = (octave + 1) * 12 + semitone;
        return 440 * Math.pow(2, (midi - 69) / 12);
    }

    function playTone(note) {
        // 优先使用共用的钢琴音色
        if (window.LegongPiano && window.LegongPiano.play) {
            var mapped = /^([A-G]#?)(-?\d)$/.exec(note);
            if (mapped) {
                var semitone = SHARP_ORDER[mapped[1]];
                var midi = (Number(mapped[2]) + 1) * 12 + semitone;
                window.LegongPiano.play(midi, null, 1.2);
                return;
            }
        }
        try {
            if (!state.context) {
                state.context = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (state.context.state === "suspended") {
                state.context.resume();
            }
            var context = state.context;
            var time = context.currentTime;
            var oscillator = context.createOscillator();
            var gain = context.createGain();
            oscillator.type = "triangle";
            oscillator.frequency.value = noteToFrequency(note);
            gain.gain.setValueAtTime(0.0001, time);
            gain.gain.exponentialRampToValueAtTime(0.3, time + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.55);
            oscillator.connect(gain);
            gain.connect(context.destination);
            oscillator.start(time);
            oscillator.stop(time + 0.6);
        } catch (error) {
            // 浏览器不支持时静默忽略，不影响判定
        }
    }

    // 找到当前页面的训练对象（不同页面变量名不同）
    function findTrainer() {
        // 页面里的训练对象用的是顶层 const，与本脚本同处全局作用域，可直接按名字访问
        try {
            if (typeof speedTrainer !== "undefined" && speedTrainer &&
                typeof speedTrainer.handleDetectedNote === "function") {
                return speedTrainer;
            }
        } catch (error) {
            // 未声明时忽略
        }
        try {
            if (typeof trainer !== "undefined" && trainer &&
                typeof trainer.handleDetectedNote === "function") {
                return trainer;
            }
        } catch (error) {
            // 未声明时忽略
        }
        return null;
    }

    function handleKey(note) {
        playTone(note);
        var trainer = findTrainer();
        if (trainer) {
            try {
                trainer.handleDetectedNote(note);
            } catch (error) {
                console.warn("虚拟键盘提交失败：", error);
            }
        }
    }

    function buildKeyboard() {
        var wrap = document.createElement("section");
        wrap.className = "vk-wrap";

        var header = document.createElement("div");
        header.className = "vk-header";
        header.innerHTML =
            '<span class="vk-title">🎹 虚拟键盘（没有乐器时点这里作答）</span>' +
            '<span class="vk-actions">' +
            '<button type="button" class="vk-btn" data-action="down">◀ 低八度</button>' +
            '<button type="button" class="vk-btn" data-action="up">高八度 ▶</button>' +
            '<button type="button" class="vk-btn" data-action="toggle">收起键盘</button>' +
            "</span>";
        wrap.appendChild(header);

        var switches = document.createElement("div");
        switches.className = "vk-switches";
        switches.innerHTML =
            '<label class="lg-switch"><input type="checkbox" id="vk-mic-toggle" checked>' +
            '<span class="lg-switch-label">🎤 麦克风（听乐器声音判定）</span></label>' +
            '<label class="lg-switch"><input type="checkbox" id="vk-midi-toggle">' +
            '<span class="lg-switch-label">🎹 MIDI 设备（电子琴、电钢琴）</span></label>';
        wrap.appendChild(switches);
        switches.querySelector("#vk-mic-toggle").addEventListener("change", function (event) {
            window.legongMicEnabled = event.target.checked;
            setStatus(event.target.checked ? "已开启麦克风输入。" : "已关闭麦克风，请用虚拟键盘或 MIDI 设备作答。");
        });
        switches.querySelector("#vk-midi-toggle").addEventListener("change", function (event) {
            if (event.target.checked) enableMidi();
            else releaseMidi();
        });

        var board = document.createElement("div");
        board.className = "vk-board";
        wrap.appendChild(board);

        var hint = document.createElement("p");
        hint.className = "vk-hint";
        hint.textContent = "先点“开始训练”，再点击琴键作答；也可以继续用麦克风或真实乐器。";
        wrap.appendChild(hint);

        var status = document.createElement("p");
        status.className = "vk-hint vk-status";
        wrap.appendChild(status);

        document.body.appendChild(wrap);

        function render() {
            board.innerHTML = "";
            var whiteCount = state.octaves * 7;
            var whiteWidth = 100 / whiteCount;
            var keyboard = document.createElement("div");
            keyboard.className = "vk-keys";

            var whiteIndex = 0;
            for (var octaveOffset = 0; octaveOffset < state.octaves; octaveOffset++) {
                var octave = state.startOctave + octaveOffset;
                for (var i = 0; i < WHITE_NOTES.length; i++) {
                    var name = WHITE_NOTES[i];
                    var note = name + octave;

                    var whiteKey = document.createElement("button");
                    whiteKey.type = "button";
                    whiteKey.className = "vk-white";
                    whiteKey.style.width = whiteWidth + "%";
                    whiteKey.dataset.note = note;
                    whiteKey.textContent = note;
                    whiteKey.addEventListener("pointerdown", function (event) {
                        event.preventDefault();
                        handleKey(this.dataset.note);
                        this.classList.add("vk-active");
                    });
                    whiteKey.addEventListener("pointerup", function () {
                        this.classList.remove("vk-active");
                    });
                    whiteKey.addEventListener("pointerleave", function () {
                        this.classList.remove("vk-active");
                    });
                    keyboard.appendChild(whiteKey);
                    whiteIndex++;

                    var blackName = BLACK_AFTER[name];
                    if (blackName && whiteIndex < whiteCount + 1) {
                        var blackKey = document.createElement("button");
                        blackKey.type = "button";
                        blackKey.className = "vk-black";
                        blackKey.style.width = whiteWidth * 0.62 + "%";
                        blackKey.style.left = "calc(" + whiteIndex * whiteWidth + "% - " + whiteWidth * 0.31 + "%)";
                        blackKey.dataset.note = blackName + octave;
                        blackKey.addEventListener("pointerdown", function (event) {
                            event.preventDefault();
                            handleKey(this.dataset.note);
                            this.classList.add("vk-active");
                        });
                        blackKey.addEventListener("pointerup", function () {
                            this.classList.remove("vk-active");
                        });
                        blackKey.addEventListener("pointerleave", function () {
                            this.classList.remove("vk-active");
                        });
                        keyboard.appendChild(blackKey);
                    }
                }
            }

            board.appendChild(keyboard);
        }

        header.addEventListener("click", function (event) {
            var action = event.target && event.target.getAttribute("data-action");
            if (!action) return;
            if (action === "down" && state.startOctave > 1) {
                state.startOctave -= 1;
                render();
            } else if (action === "up" && state.startOctave + state.octaves < 8) {
                state.startOctave += 1;
                render();
            } else if (action === "toggle") {
                var collapsed = wrap.classList.toggle("vk-collapsed");
                event.target.textContent = collapsed ? "展开键盘" : "收起键盘";
            } else if (action === "midi") {
                enableMidi();
            }
        });

        render();
    }

    // ---------------- MIDI 设备（电子鼓、电钢琴、MIDI 键盘）----------------
    var NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    var midiAccess = null;

    function setStatus(text) {
        var node = document.querySelector(".vk-status");
        if (node) node.textContent = text;
    }

    function midiToNoteName(number) {
        var octave = Math.floor(number / 12) - 1;
        return NOTE_NAMES[((number % 12) + 12) % 12] + octave;
    }

    function bindMidiInputs() {
        if (!midiAccess) return;
        var names = [];
        midiAccess.inputs.forEach(function (input) {
            names.push(input.name || "MIDI 设备");
            input.onmidimessage = function (event) {
                var data = event.data || [];
                if ((data[0] & 0xf0) !== 0x90 || (data[2] || 0) === 0) return;
                handleKey(midiToNoteName(data[1]));
            };
        });
        setStatus(names.length
            ? "已连接 MIDI：" + names.join("、") + "，弹奏乐器即可作答。"
            : "已开启 MIDI，但还没有检测到设备，请检查 USB 连接。");
    }

    function enableMidi() {
        if (!navigator.requestMIDIAccess) {
            setStatus("当前环境不支持 MIDI 输入，请改用 Edge 或 Chrome 打开。");
            return;
        }
        navigator.requestMIDIAccess().then(function (access) {
            midiAccess = access;
            bindMidiInputs();
            access.onstatechange = bindMidiInputs;
            var toggle = document.querySelector("#vk-midi-toggle");
            if (toggle) toggle.checked = true;
        }).catch(function (error) {
            setStatus("MIDI 连接失败：" + error.message);
        });
    }

    function releaseMidi() {
        if (midiAccess) {
            midiAccess.inputs.forEach(function (input) {
                input.onmidimessage = null;
            });
        }
        setStatus("已关闭 MIDI 输入。");
    }

    // 关闭麦克风时，返回一路静音音频流，页面不会报错，只是听不到任何击打
    (function patchGetUserMedia() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
        var original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
        navigator.mediaDevices.getUserMedia = function (constraints) {
            if (window.legongMicEnabled === false && constraints && constraints.audio) {
                try {
                    var context = new (window.AudioContext || window.webkitAudioContext)();
                    return Promise.resolve(context.createMediaStreamDestination().stream);
                } catch (error) {
                    // 创建失败时退回真实麦克风
                }
            }
            return original(constraints);
        };
    })();

    function init() {
        if (document.querySelector(".vk-wrap")) return;
        // 只在三个阶段练习页面出现
        if (!/training-(speed|chord-inversions|play-chord)\.html$/.test(window.location.pathname)) return;
        buildKeyboard();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
