/**
 * 共用钢琴音色：用多个谐波叠加模拟钢琴，比单一振荡器饱满。
 * 使用方法：LegongPiano.play(midi, 开始时间, 时长)
 */
(function () {
    "use strict";

    var audioContext = null;
    var PARTIALS = [
        { ratio: 1, gain: 0.30, decay: 1.00 },
        { ratio: 2, gain: 0.14, decay: 0.68 },
        { ratio: 3, gain: 0.075, decay: 0.48 },
        { ratio: 4, gain: 0.045, decay: 0.34 },
        { ratio: 5, gain: 0.028, decay: 0.25 },
        { ratio: 6, gain: 0.018, decay: 0.18 },
    ];

    function ensure() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioContext.state === "suspended") audioContext.resume();
        return audioContext;
    }

    function midiToFrequency(midi) {
        return 440 * Math.pow(2, (midi - 69) / 12);
    }

    function play(midi, when, duration) {
        var context = ensure();
        var start = when || context.currentTime;
        var length = duration || 1.1;
        var frequency = midiToFrequency(midi);

        PARTIALS.forEach(function (partial) {
            var oscillator = context.createOscillator();
            var gain = context.createGain();
            oscillator.type = "sine";
            oscillator.frequency.value = frequency * partial.ratio;
            // 高次谐波略微失谐，听感更自然
            oscillator.detune.value = (Math.random() - 0.5) * 4;

            gain.gain.setValueAtTime(0.0001, start);
            gain.gain.exponentialRampToValueAtTime(partial.gain, start + 0.012);
            gain.gain.exponentialRampToValueAtTime(0.0001, start + length * partial.decay);

            oscillator.connect(gain);
            gain.connect(context.destination);
            oscillator.start(start);
            oscillator.stop(start + length + 0.05);
        });
    }

    window.LegongPiano = { play: play, ensure: ensure };
})();
