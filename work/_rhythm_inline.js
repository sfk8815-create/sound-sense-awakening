
    (function () {
      "use strict";

      var lessonSelect = document.getElementById("lessonSelect");
      var lessonTitle = document.getElementById("lessonTitle");
      var lessonDesc = document.getElementById("lessonDesc");
      var beatGrid = document.getElementById("beatGrid");
      var subLabels = document.getElementById("subLabels");
      var loopNote = document.getElementById("loopNote");
      var bpmSlider = document.getElementById("bpmSlider");
      var bpmNumber = document.getElementById("bpmNumber");
      var statusText = document.getElementById("statusText");
      var startBtn = document.getElementById("startBtn");
      var demoBtn = document.getElementById("demoBtn");
      var resetBtn = document.getElementById("resetBtn");
      var retryBtn = document.getElementById("retryBtn");
      var exportBtn = document.getElementById("exportBtn");
      var clearHistoryBtn = document.getElementById("clearHistoryBtn");
      var tapPad = document.getElementById("tapPad");
      var resultPanel = document.getElementById("resultPanel");
      var scoreVal = document.getElementById("scoreVal");
      var hitVal = document.getElementById("hitVal");
      var errorVal = document.getElementById("errorVal");
      var extraVal = document.getElementById("extraVal");
      var biasVal = document.getElementById("biasVal");
      var stableVal = document.getElementById("stableVal");
      var earlyVal = document.getElementById("earlyVal");
      var lateVal = document.getElementById("lateVal");
      var gradeBox = document.getElementById("gradeBox");
      var resultLesson = document.getElementById("resultLesson");
      var historyText = document.getElementById("historyText");

      var PATTERNS = [
        {
          id: "quarter",
          title: "四分音符 · 稳定节拍",
          desc: "每拍击打一次。这一课先不追求快，追求两次击打之间的间隔尽量稳定。",
          onsets: [0, 4, 8, 12]
        },
        {
          id: "eighth",
          title: "八分音符 · 半拍一音",
          desc: "每个半拍击打一次，手腕保持放松，注意均匀。",
          onsets: [0, 2, 4, 6, 8, 10, 12, 14]
        },
        {
          id: "eighth-two-sixteenth",
          title: "前八后十六",
          desc: "每拍为“八分 + 两个十六分”的短长组合，注意后两个音要均匀。",
          onsets: [0, 2, 3, 4, 6, 7, 8, 10, 11, 12, 14, 15]
        },
        {
          id: "two-sixteenth-eighth",
          title: "后十六前八",
          desc: "每拍为“两个十六分 + 八分”，注意起始两音不要连成三连音。",
          onsets: [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14]
        },
        {
          id: "dotted",
          title: "附点八分 + 十六分",
          desc: "每拍“长-短”，长音与短音之间保持清晰对比。",
          onsets: [0, 3, 4, 7, 8, 11, 12, 15]
        },
        {
          id: "rest",
          title: "四分休止符练习",
          desc: "第二拍是空拍，不要击打。休止和击打一样重要。",
          onsets: [0, 8, 12]
        }
      ];

      var SUB_LABELS = ["1", "e", "&", "a", "2", "e", "&", "a", "3", "e", "&", "a", "4", "e", "&", "a"];
      var HISTORY_KEY = "rhythmTrainerHistory.v1";
      var BARS_PER_ROUND = 2;
      var COUNT_IN_BEATS = 4;

      var selectedLesson = PATTERNS[0];
      var audioCtx = null;
      var masterGain = null;
      var mode = "idle";
      var schedulerTimer = null;
      var nextClickTime = null;
      var countInStart = 0;
      var roundStart = 0;
      var roundEnd = 0;
      var hardEnd = 0;
      var measureDur = 0;
      var beatDur = 0;
      var tickDur = 0;
      var expectedTimes = [];
      var actualTaps = [];
      var finishedOnce = false;
      var demoTimeout = null;
      var history = loadHistory();

      function clampBpm(value) {
        var n = Number(value);
        if (!isFinite(n)) {
          return 90;
        }
        return Math.round(Math.max(40, Math.min(180, n)));
      }

      function currentBpm() {
        return clampBpm(bpmNumber.value);
      }

      function syncBpm(value) {
        var bpm = clampBpm(value);
        bpmSlider.value = String(bpm);
        bpmNumber.value = String(bpm);
      }

      bpmSlider.addEventListener("input", function () {
        syncBpm(bpmSlider.value);
      });

      bpmNumber.addEventListener("input", function () {
        if (bpmNumber.value === "") {
          return;
        }
        syncBpm(bpmNumber.value);
      });

      bpmNumber.addEventListener("change", function () {
        syncBpm(bpmNumber.value);
      });

      function setStatus(message) {
        statusText.textContent = message;
      }

      function setPracticeControls(disabled) {
        lessonSelect.disabled = disabled;
        bpmSlider.disabled = disabled;
        bpmNumber.disabled = disabled;
        demoBtn.disabled = disabled;
      }

      function ensureAudio() {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) {
          setStatus("当前浏览器不支持 Web Audio");
          return false;
        }
        if (!audioCtx) {
          audioCtx = new AC();
          masterGain = audioCtx.createGain();
          masterGain.gain.value = 0.8;
          masterGain.connect(audioCtx.destination);
        }
        if (audioCtx.state === "suspended") {
          audioCtx.resume();
        }
        return true;
      }

      function playTone(time, frequency, peak, duration) {
        if (!audioCtx || !masterGain) {
          return;
        }
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(frequency, time);
        osc.connect(gain);
        gain.connect(masterGain);
        gain.gain.setValueAtTime(0.0001, time);
        gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), time + 0.002);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
        osc.start(time);
        osc.stop(time + duration + 0.03);
        osc.addEventListener("ended", function () {
          osc.disconnect();
          gain.disconnect();
        });
      }

      function metronomeTick(time, isDownbeat) {
        playTone(time, isDownbeat ? 1318.5 : 988, isDownbeat ? 0.45 : 0.24, 0.035);
      }

      function lessonTick(time, isStrong) {
        playTone(time, isStrong ? 1567.98 : 1046.5, isStrong ? 0.7 : 0.55, 0.04);
      }

      function renderLesson() {
        lessonTitle.textContent = selectedLesson.title;
        lessonDesc.textContent = selectedLesson.desc;
        beatGrid.innerHTML = "";
        for (var i = 0; i < 16; i++) {
          var cell = document.createElement("div");
          cell.className = "cell";
          if (i % 4 === 0) {
            cell.classList.add("beat-start");
          }
          if (selectedLesson.onsets.indexOf(i) >= 0) {
            cell.classList.add("target");
            cell.textContent = "x";
          }
          beatGrid.appendChild(cell);
        }
        subLabels.innerHTML = "";
        SUB_LABELS.forEach(function (label) {
          var span = document.createElement("span");
          span.className = "sub-label";
          span.textContent = label;
          subLabels.appendChild(span);
        });
        loopNote.textContent = "以上模式在小节内循环 " + BARS_PER_ROUND + " 次，练的是两小节连续稳定输出。";
      }

      lessonSelect.addEventListener("change", function () {
        var id = lessonSelect.value;
        for (var i = 0; i < PATTERNS.length; i++) {
          if (PATTERNS[i].id === id) {
            selectedLesson = PATTERNS[i];
            break;
          }
        }
        renderLesson();
        stopAll(false);
      });

      function populateLessons() {
        PATTERNS.forEach(function (pattern, index) {
          var option = document.createElement("option");
          option.value = pattern.id;
          option.textContent = (index + 1) + ". " + pattern.title;
          lessonSelect.appendChild(option);
        });
      }

      function durationUnits() {
        var bpm = currentBpm();
        beatDur = 60 / bpm;
        measureDur = 4 * beatDur;
        tickDur = measureDur / 16;
      }

      function stopAll(showStatus) {
        if (schedulerTimer !== null) {
          window.clearInterval(schedulerTimer);
          schedulerTimer = null;
        }
        if (demoTimeout !== null) {
          window.clearTimeout(demoTimeout);
          demoTimeout = null;
        }
        mode = "idle";
        nextClickTime = null;
        actualTaps = [];
        expectedTimes = [];
        finishedOnce = false;
        startBtn.textContent = "开始练习";
        startBtn.classList.remove("btn-danger");
        setPracticeControls(false);
        if (showStatus) {
          setStatus("已停止。选择课程后点击“开始练习”。");
        }
      }

      function playDemo() {
        if (mode === "demo") {
          return;
        }
        if (!ensureAudio()) {
          return;
        }
        stopAll(false);
        mode = "demo";
        setPracticeControls(true);
        durationUnits();

        var start = audioCtx.currentTime + 0.25;
        var i;
        var b;
        for (b = 0; b < 2; b++) {
          for (i = 0; i < selectedLesson.onsets.length; i++) {
            var position = selectedLesson.onsets[i];
            var t = start + b * measureDur + position * tickDur;
            lessonTick(t, i === 0 && b === 0);
          }
        }
        var totalMs = (2 * measureDur + 0.4) * 1000;
        setStatus("正在播放示范…");
        demoTimeout = window.setTimeout(function () {
          mode = "idle";
          setPracticeControls(false);
          setStatus("示范结束。点击“开始练习”。");
        }, totalMs);
      }

      function startPractice() {
        if (!ensureAudio()) {
          return;
        }
        if (mode === "countin" || mode === "running") {
          stopAll(true);
          resultPanel.classList.add("hidden");
          return;
        }

        stopAll(false);
        durationUnits();
        mode = "countin";
        finishedOnce = false;
        actualTaps = [];
        resultPanel.classList.add("hidden");
        startBtn.textContent = "停止";
        startBtn.classList.add("btn-danger");
        setPracticeControls(true);

        roundStart = audioCtx.currentTime + COUNT_IN_BEATS * beatDur + 0.35;
        countInStart = roundStart - COUNT_IN_BEATS * beatDur;
        roundEnd = roundStart + BARS_PER_ROUND * measureDur;
        hardEnd = roundEnd + 0.35;
        nextClickTime = countInStart;

        expectedTimes = [];
        var b;
        for (b = 0; b < BARS_PER_ROUND; b++) {
          for (var i = 0; i < selectedLesson.onsets.length; i++) {
            expectedTimes.push(roundStart + b * measureDur + selectedLesson.onsets[i] * tickDur);
          }
        }

        setStatus("准备…");
        schedulerTimer = window.setInterval(schedulerLoop, 25);
      }

      function schedulerLoop() {
        if (!audioCtx || (mode !== "countin" && mode !== "running")) {
          return;
        }
        var now = audioCtx.currentTime;

        while (nextClickTime < now + 0.2) {
          if (nextClickTime >= countInStart && nextClickTime < hardEnd) {
            if (nextClickTime < roundStart) {
              metronomeTick(nextClickTime, false);
            } else {
              var beatOffset = (nextClickTime - roundStart) / beatDur;
              metronomeTick(nextClickTime, Math.abs(beatOffset - Math.round(beatOffset)) < 0.001 && Math.round(beatOffset) % 4 === 0);
            }
          }
          nextClickTime += beatDur;
        }

        if (mode === "countin" && now >= roundStart) {
          mode = "running";
          setStatus("第 1 小节 · 请按节奏击打");
        } else if (mode === "countin") {
          var count = Math.max(1, Math.ceil((roundStart - now) / beatDur));
          setStatus("准备：" + count);
        } else if (mode === "running") {
          var measure = Math.min(BARS_PER_ROUND, Math.floor((now - roundStart) / measureDur) + 1);
          setStatus("正在演奏 · 第 " + measure + " / " + BARS_PER_ROUND + " 小节");
        }

        if (mode === "running" && now >= hardEnd) {
          finishRound();
        }
      }

      function userHit() {
        if (mode !== "countin" && mode !== "running") {
          tapPad.classList.add("hit");
          window.setTimeout(function () {
            tapPad.classList.remove("hit");
          }, 100);
          setStatus("请先点击“开始练习”，再开始击打");
          return;
        }
        if (!audioCtx) {
          return;
        }
        var clock = audioCtx.currentTime;
        if (clock < roundStart - 0.06 || clock > hardEnd) {
          return;
        }
        actualTaps.push(clock);
        tapPad.classList.add("hit");
        window.setTimeout(function () {
          tapPad.classList.remove("hit");
        }, 90);
        flashNearestCell(clock);
      }

      function flashNearestCell(clock) {
        if (clock < roundStart || expectedTimes.length === 0) {
          return;
        }
        var cells = beatGrid.children;
        var bestIndex = -1;
        var bestDistance = Infinity;
        for (var i = 0; i < expectedTimes.length; i++) {
          var d = Math.abs(expectedTimes[i] - clock);
          if (d < bestDistance) {
            bestDistance = d;
            bestIndex = i;
          }
        }
        var withinBarIndex = bestIndex % selectedLesson.onsets.length;
        var barPosition = selectedLesson.onsets[withinBarIndex];
        if (bestIndex >= 0 && cells[barPosition]) {
          cells[barPosition].classList.add("flash");
          window.setTimeout(function () {
            cells[barPosition].classList.remove("flash");
          }, 100);
        }
      }

      function finishRound() {
        if (finishedOnce) {
          return;
        }
        finishedOnce = true;
        var bpm = currentBpm();
        durationUnits();
        var windowSec = Math.min(0.22, Math.max(0.11, beatDur * 0.18));

        var taps = [];
        for (var i = 0; i < actualTaps.length; i++) {
          if (actualTaps[i] >= roundStart - 0.04 && actualTaps[i] <= hardEnd) {
            taps.push(actualTaps[i]);
          }
        }

        var result = scoreRound(expectedTimes, taps, windowSec);
        mode = "idle";
        if (schedulerTimer !== null) {
          window.clearInterval(schedulerTimer);
          schedulerTimer = null;
        }
        setPracticeControls(false);
        startBtn.textContent = "开始练习";
        startBtn.classList.remove("btn-danger");

        showResult(result, bpm);
      }

      function scoreRound(expected, actual, windowSec) {
        var used = new Array(actual.length).fill(false);
        var matched = [];
        var deviations = [];
        var earlyCount = 0;
        var lateCount = 0;

        for (var e = 0; e < expected.length; e++) {
          var bestIndex = -1;
          var bestAbs = Infinity;
          for (var a = 0; a < actual.length; a++) {
            if (used[a]) {
              continue;
            }
            var dev = actual[a] - expected[e];
            var absDev = Math.abs(dev);
            if (absDev <= windowSec && absDev < bestAbs) {
              bestAbs = absDev;
              bestIndex = a;
            }
          }
          if (bestIndex >= 0) {
            used[bestIndex] = true;
            var matchedDev = actual[bestIndex] - expected[e];
            matched.push(matchedDev);
            deviations.push(matchedDev);
            if (matchedDev < -0.01) {
              earlyCount++;
            } else if (matchedDev > 0.01) {
              lateCount++;
            }
          }
        }

        var extraCount = 0;
        for (var x = 0; x < used.length; x++) {
          if (!used[x]) {
            extraCount++;
          }
        }

        var hitRate = expected.length === 0 ? 0 : matched.length / expected.length;
        var sumAbs = 0;
        for (var d = 0; d < deviations.length; d++) {
          sumAbs += Math.abs(deviations[d]);
        }
        var meanAbsMs = deviations.length === 0 ? 0 : (sumAbs / deviations.length) * 1000;

        var meanSigned = 0;
        var sdMs = 0;
        if (deviations.length > 0) {
          for (var s = 0; s < deviations.length; s++) {
            meanSigned += deviations[s];
          }
          meanSigned /= deviations.length;
          var sumSquares = 0;
          for (var v = 0; v < deviations.length; v++) {
            sumSquares += Math.pow(deviations[v] - meanSigned, 2);
          }
          sdMs = Math.sqrt(sumSquares / deviations.length) * 1000;
        }

        var timingQuality = 1;
        if (deviations.length > 0 && windowSec > 0) {
          var avgNorm = meanAbsMs / 1000 / windowSec;
          timingQuality = Math.max(0, 1 - avgNorm);
        }
        var score = Math.round(hitRate * 70 + timingQuality * 30 - Math.min(20, extraCount * 6));
        score = Math.max(0, Math.min(100, score));

        var grade = "D";
        if (score >= 95) grade = "S";
        else if (score >= 85) grade = "A";
        else if (score >= 70) grade = "B";
        else if (score >= 55) grade = "C";

        return {
          hitCount: matched.length,
          total: expected.length,
          extraCount: extraCount,
          meanAbsMs: meanAbsMs,
          biasMs: meanSigned * 1000,
          sdMs: sdMs,
          earlyCount: earlyCount,
          lateCount: lateCount,
          score: score,
          grade: grade
        };
      }

      function showResult(result, bpm) {
        scoreVal.textContent = String(result.score);
        hitVal.textContent = result.hitCount + "/" + result.total;
        errorVal.textContent = Math.round(result.meanAbsMs) + " ms";
        extraVal.textContent = String(result.extraCount);
        biasVal.textContent = (result.biasMs >= 0 ? "+" : "") + Math.round(result.biasMs) + " ms";
        stableVal.textContent = Math.round(result.sdMs) + " ms";
        earlyVal.textContent = String(result.earlyCount);
        lateVal.textContent = String(result.lateCount);
        gradeBox.textContent = result.grade;
        resultLesson.textContent = selectedLesson.title + " · " + bpm + " BPM · " + BARS_PER_ROUND + " 小节";
        resultPanel.classList.remove("hidden");
        resultPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });

        var record = {
          time: new Date().toISOString(),
          lesson: selectedLesson.title,
          bpm: bpm,
          score: result.score,
          grade: result.grade,
          hitRate: Math.round((result.hitCount / result.total) * 100),
          meanAbsMs: Math.round(result.meanAbsMs),
          biasMs: Math.round(result.biasMs),
          sdMs: Math.round(result.sdMs),
          extra: result.extraCount
        };
        saveRecord(record);
        setStatus("练习完成 · 得分 " + result.score + "（" + result.grade + "）");
      }

      function loadHistory() {
        try {
          var raw = window.localStorage.getItem(HISTORY_KEY);
          if (raw) {
            var parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              return parsed;
            }
          }
        } catch (err) {
          // ignore
        }
        return [];
      }

      function persistHistory() {
        try {
          window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 100)));
        } catch (err) {
          // ignore
        }
        refreshHistoryText();
      }

      function saveRecord(record) {
        history.unshift(record);
        persistHistory();
      }

      function refreshHistoryText() {
        if (!history || history.length === 0) {
          historyText.textContent = "本机还没有练习记录";
          return;
        }
        historyText.textContent = "本机已保存 " + history.length + " 次练习记录，可导出为 CSV 用于分析。";
      }

      function exportCsv() {
        if (!history || history.length === 0) {
          setStatus("暂时没有可导出的记录");
          return;
        }
        var header = ["时间", "课程", "BPM", "得分", "等级", "命中率%", "平均绝对偏差ms", "系统偏移ms", "稳定性SDms", "多余击打"];
        var lines = [header.join(",")];
        history.forEach(function (item) {
          lines.push([
            item.time,
            "\"" + String(item.lesson).replace(/"/g, "\"\"") + "\"",
            item.bpm,
            item.score,
            item.grade,
            item.hitRate,
            item.meanAbsMs,
            item.biasMs,
            item.sdMs,
            item.extra
          ].join(","));
        });
        var csv = "\uFEFF" + lines.join("\r\n");
        var blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        var link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "节奏训练记录_" + new Date().toISOString().slice(0, 10) + ".csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.setTimeout(function () {
          URL.revokeObjectURL(link.href);
        }, 1000);
      }

      startBtn.addEventListener("click", function () {
        startPractice();
        startBtn.blur();
      });

      demoBtn.addEventListener("click", function () {
        playDemo();
        demoBtn.blur();
      });

      resetBtn.addEventListener("click", function () {
        stopAll(true);
        resultPanel.classList.add("hidden");
      });

      retryBtn.addEventListener("click", function () {
        startPractice();
        startBtn.blur();
      });

      exportBtn.addEventListener("click", function () {
        exportCsv();
      });

      clearHistoryBtn.addEventListener("click", function () {
        if (window.confirm("确定清空本机保存的全部练习记录吗？")) {
          history = [];
          persistHistory();
          setStatus("练习记录已清空");
        }
      });

      tapPad.addEventListener("pointerdown", function (event) {
        event.preventDefault();
        userHit();
      });

      window.addEventListener("keydown", function (event) {
        if (event.code === "Space" && !event.repeat) {
          event.preventDefault();
          userHit();
        }
      });

      populateLessons();
      renderLesson();
      refreshHistoryText();

      window.addEventListener("beforeunload", function () {
        if (schedulerTimer !== null) {
          window.clearInterval(schedulerTimer);
        }
        if (demoTimeout !== null) {
          window.clearTimeout(demoTimeout);
        }
        if (audioCtx && typeof audioCtx.close === "function") {
          audioCtx.close();
        }
      });
    })();
  
