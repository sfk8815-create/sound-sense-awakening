(function () {
    "use strict";

    var STORAGE_KEY = "lg-modes";
    var settings = { focus: false, light: false, large: false };

    try {
        var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
        if (saved && typeof saved === "object") {
            settings.focus = !!saved.focus;
            settings.light = !!saved.light;
            settings.large = !!saved.large;
        }
    } catch (error) {
        // 读取失败时使用默认值
    }

    var root = document.documentElement;

    function apply() {
        root.classList.toggle("lg-focus", settings.focus);
        root.classList.toggle("lg-light", settings.light);
        root.classList.toggle("lg-large", settings.large);

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        } catch (error) {
            // 存储不可用时忽略
        }

        var inputs = document.querySelectorAll("#lg-mode-panel [data-mode]");
        for (var i = 0; i < inputs.length; i++) {
            var mode = inputs[i].getAttribute("data-mode");
            inputs[i].checked = !!settings[mode];
        }
    }

    var nativeFullscreen = false;

    function hasNativeBridge() {
        return !!(window.legongNative && window.legongNative.isElectron);
    }

    function isFullscreen() {
        if (hasNativeBridge()) return nativeFullscreen;
        return !!(document.fullscreenElement || document.webkitFullscreenElement);
    }

    function toggleFullscreen() {
        if (hasNativeBridge()) {
            window.legongNative.toggleFullscreen();
            return;
        }
        if (isFullscreen()) {
            if (document.exitFullscreen) document.exitFullscreen();
            else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        } else {
            var element = document.documentElement;
            if (element.requestFullscreen) element.requestFullscreen();
            else if (element.webkitRequestFullscreen) element.webkitRequestFullscreen();
        }
    }

    function refreshFullscreenButton() {
        var button = document.getElementById("lg-fullscreen-btn");
        if (!button) return;
        var full = isFullscreen();
        button.textContent = full ? "⤢ 退出全屏" : "⛶ 全屏";
        // 进入全屏后隐藏按钮，避免遮挡画面；按 F 或 Esc 可退出全屏
        button.style.display = full ? "none" : "";
    }

    function buildControls() {
        if (document.getElementById("lg-mode-btn")) return;

        var wrap = document.createElement("div");
        wrap.className = "lg-float";

        var panel = document.createElement("div");
        panel.className = "lg-mode-panel";
        panel.id = "lg-mode-panel";
        panel.innerHTML = [
            '<div class="lg-mode-title">显示模式</div>',
            '<label class="lg-mode-row"><input type="checkbox" data-mode="focus">',
            "<span><strong>专注模式</strong><small>隐藏侧边栏，鼠标移到屏幕左边再滑出，适合投影讲解</small></span></label>",
            '<label class="lg-mode-row"><input type="checkbox" data-mode="light">',
            "<span><strong>浅色模式</strong><small>适合明亮的教室和投影环境</small></span></label>",
            '<label class="lg-mode-row"><input type="checkbox" data-mode="large">',
            "<span><strong>大屏模式</strong><small>整体放大，坐在后排也看得清</small></span></label>",
            '<div class="lg-mode-tip">快捷键：按 F 切换全屏</div>',
        ].join("");

        panel.addEventListener("change", function (event) {
            var input = event.target;
            if (!input || !input.getAttribute) return;
            var mode = input.getAttribute("data-mode");
            if (!mode) return;
            settings[mode] = !!input.checked;
            apply();
        });

        var modeButton = document.createElement("button");
        modeButton.type = "button";
        modeButton.className = "lg-fs-btn";
        modeButton.id = "lg-mode-btn";
        modeButton.textContent = "🎛 模式";
        modeButton.setAttribute("aria-expanded", "false");
        modeButton.addEventListener("click", function () {
            var opened = panel.classList.toggle("open");
            modeButton.setAttribute("aria-expanded", opened ? "true" : "false");
        });

        var fullscreenButton = document.createElement("button");
        fullscreenButton.type = "button";
        fullscreenButton.className = "lg-fs-btn";
        fullscreenButton.id = "lg-fullscreen-btn";
        fullscreenButton.textContent = "⛶ 全屏";
        fullscreenButton.title = "全屏显示（快捷键 F）";
        fullscreenButton.addEventListener("click", toggleFullscreen);

        document.addEventListener("click", function (event) {
            if (!panel.classList.contains("open")) return;
            if (panel.contains(event.target) || event.target === modeButton) return;
            panel.classList.remove("open");
            modeButton.setAttribute("aria-expanded", "false");
        });

        document.addEventListener("fullscreenchange", refreshFullscreenButton);
        document.addEventListener("webkitfullscreenchange", refreshFullscreenButton);

        if (hasNativeBridge()) {
            window.legongNative.getFullscreen().then(function (value) {
                nativeFullscreen = !!value;
                refreshFullscreenButton();
            });
            window.legongNative.onFullscreenChange(function (value) {
                nativeFullscreen = !!value;
                refreshFullscreenButton();
            });
        }

        document.addEventListener("keydown", function (event) {
            var tag = (event.target && event.target.tagName ? event.target.tagName : "").toLowerCase();
            if (tag === "input" || tag === "textarea" || tag === "select") return;
            if (event.key === "f" || event.key === "F") {
                event.preventDefault();
                toggleFullscreen();
            }
        });

        wrap.appendChild(panel);
        wrap.appendChild(modeButton);
        wrap.appendChild(fullscreenButton);
        document.body.appendChild(wrap);

        refreshFullscreenButton();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", buildControls);
    } else {
        buildControls();
    }

    apply();
})();
