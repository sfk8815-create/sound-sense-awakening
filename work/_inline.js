
    (function () {
      "use strict";

      var bpmValueEl = document.getElementById("bpmValue");
      var bpmSlider = document.getElementById("bpmSlider");
      var bpmNumber = document.getElementById("bpmNumber");
      var meterButtons = document.getElementById("meterButtons");
      var meterBtnList = Array.prototype.slice.call(meterButtons.querySelectorAll(".meter-btn"));
      var beatDots = document.getElementById("beatDots");
      var statusText = document.getElementById("statusText");
      var toggleBtn = document.getElementById("toggleBtn");

      var METERS = {
        "4/4": { beats: 4, unit: 4, accents: [0] },
        "2/4": { beats: 2, unit: 4, accents: [0] },
        "3/8": { beats: 3, unit: 8, accents: [0] },
        "6/8": { beats: 6, unit: 8, accents: [0, 3] }
      };

      var audioCtx = null;
      var masterGain = null;
      var running = false;
      var schedulerTimer = null;
      var nextTime = null;
      var beatIndex = 0;
      var selectedMeter = "4/4";
      var visualToken = 0;

      function clampBpm(value) {
        var num = Number(value);
        if (!isFinite(num)) {
          return 0;
        }
        return Math.max(0, Math.min(400, Math.round(num)));
      }

      function getCurrentBpm() {
        var value = bpmNumber.value;
        if (value === "") {
          return 0;
        }
        return clampBpm(value);
      }

      function syncTempoControls(value) {
        var bpm = clampBpm(value);
        bpmSlider.value = String(bpm);
        bpmNumber.value = String(bpm);
        bpmValueEl.textContent = String(bpm);
      }

      function updateTempo() {
        var bpm = getCurrentBpm();
        syncTempoControls(bpm);
        if (running && audioCtx) {
          nextTime = audioCtx.currentTime + 0.05;
        }
      }

      bpmSlider.addEventListener("input", function () {
        syncTempoControls(bpmSlider.value);
        if (running && audioCtx) {
          nextTime = audioCtx.currentTime + 0.05;
        }
      });

      bpmNumber.addEventListener("input", function () {
        var raw = bpmNumber.value;
        if (raw === "") {
          bpmSlider.value = "0";
          bpmValueEl.textContent = "0";
          if (running && audioCtx) {
            nextTime = audioCtx.currentTime + 0.05;
          }
          return;
        }
        updateTempo();
      });

      bpmNumber.addEventListener("change", function () {
        updateTempo();
      });

      function setStatus(message) {
        statusText.textContent = message;
      }

      function renderBeatDots() {
        var meter = METERS[selectedMeter];
        beatDots.innerHTML = "";
        for (var i = 0; i < meter.beats; i++) {
          var dot = document.createElement("span");
          dot.className = "beat-dot" + (i === 0 ? " strong" : "");
          if (meter.accents.indexOf(i) > 0) {
            dot.classList.add("strong");
          }
          beatDots.appendChild(dot);
        }
      }

      function selectMeter(meterName) {
        selectedMeter = meterName;
        meterBtnList.forEach(function (button) {
          button.classList.toggle("active", button.getAttribute("data-meter") === meterName);
        });
        renderBeatDots();
        if (running) {
          visualToken += 1;
          beatIndex = 0;
          if (audioCtx) {
            nextTime = audioCtx.currentTime + 0.06;
          }
          setStatus("已切换至 " + meterName + " · 下一小节开始");
        }
      }

      meterButtons.addEventListener("click", function (event) {
        var button = event.target.closest("button[data-meter]");
        if (button) {
          selectMeter(button.getAttribute("data-meter"));
        }
      });

      function setActiveDot(position) {
        var dots = beatDots.children;
        for (var i = 0; i < dots.length; i++) {
          dots[i].classList.toggle("active", i === position);
        }
      }

      function clearActiveDot() {
        var dots = beatDots.children;
        for (var i = 0; i < dots.length; i++) {
          dots[i].classList.remove("active");
        }
      }

      function ensureAudio() {
        var AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) {
          setStatus("当前浏览器不支持 Web Audio");
          return false;
        }
        if (!audioCtx) {
          audioCtx = new AudioContextClass();
          masterGain = audioCtx.createGain();
          masterGain.gain.value = 0.85;
          masterGain.connect(audioCtx.destination);
        }
        if (audioCtx.state === "suspended") {
          audioCtx.resume();
        }
        return true;
      }

      function playTick(time, accentLevel) {
        if (!audioCtx || !masterGain) {
          return;
        }
        var oscillator = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        var frequency = 880;
        var peak = 0.35;

        if (accentLevel === 1) {
          frequency = 1174.66;
          peak = 0.55;
        } else if (accentLevel === 2) {
          frequency = 1567.98;
          peak = 0.8;
        }

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, time);
        oscillator.connect(gain);
        gain.connect(masterGain);

        gain.gain.setValueAtTime(0.0001, time);
        gain.gain.exponentialRampToValueAtTime(peak, time + 0.002);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);

        oscillator.start(time);
        oscillator.stop(time + 0.05);
        oscillator.addEventListener("ended", function () {
          oscillator.disconnect();
          gain.disconnect();
        });
      }

      function scheduleVisual(absoluteBeatIndex, position, delayMs, token) {
        window.setTimeout(function () {
          if (!running || token !== visualToken) {
            return;
          }
          setActiveDot(position);
          var meter = METERS[selectedMeter];
          var measureNumber = Math.floor(absoluteBeatIndex / meter.beats) + 1;
          setStatus("第 " + measureNumber + " 小节 · 第 " + (position + 1) + " 拍 · " + selectedMeter);
        }, Math.max(0, delayMs));
      }

      function scheduleAhead() {
        if (!running || !audioCtx) {
          return;
        }

        var bpm = getCurrentBpm();
        if (bpm <= 0) {
          if (nextTime === null || nextTime < audioCtx.currentTime) {
            nextTime = audioCtx.currentTime + 0.05;
          }
          return;
        }

        var meter = METERS[selectedMeter];
        var secondsPerBeat = (meter.unit === 8 ? 30 : 60) / bpm;

        if (nextTime === null) {
          nextTime = audioCtx.currentTime + 0.05;
        }

        while (nextTime < audioCtx.currentTime + 0.18) {
          var position = beatIndex % meter.beats;
          var accentLevel = 0;
          if (meter.accents.indexOf(position) === 0) {
            accentLevel = 2;
          } else if (meter.accents.indexOf(position) > 0) {
            accentLevel = 1;
          }

          playTick(nextTime, accentLevel);
          scheduleVisual(beatIndex, position, (nextTime - audioCtx.currentTime) * 1000, visualToken);

          nextTime += secondsPerBeat;
          beatIndex += 1;
        }
      }

      function updateButton() {
        toggleBtn.textContent = running ? "停 止" : "开 始";
        toggleBtn.classList.toggle("playing", running);
      }

      function start() {
        if (!ensureAudio()) {
          return;
        }

        var bpm = getCurrentBpm();
        running = true;
        visualToken += 1;
        beatIndex = 0;
        nextTime = audioCtx.currentTime + 0.08;
        clearActiveDot();
        updateButton();

        if (bpm <= 0) {
          setStatus("运行中 · 请将 BPM 设置为大于 0");
        } else {
          setStatus("运行中 · 准备就绪");
        }

        schedulerTimer = window.setInterval(scheduleAhead, 25);
      }

      function stop() {
        running = false;
        if (schedulerTimer !== null) {
          window.clearInterval(schedulerTimer);
          schedulerTimer = null;
        }
        nextTime = null;
        beatIndex = 0;
        clearActiveDot();
        setStatus("已停止");
        updateButton();
      }

      toggleBtn.addEventListener("click", function () {
        if (running) {
          stop();
        } else {
          start();
        }
      });

      window.addEventListener("beforeunload", function () {
        if (running && schedulerTimer !== null) {
          window.clearInterval(schedulerTimer);
        }
        if (audioCtx && typeof audioCtx.close === "function") {
          audioCtx.close();
        }
      });

      renderBeatDots();
    })();
  
