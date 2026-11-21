/* ============================================================
   音感觉醒 · 内页统一外壳  (yx-shell.js)
   ------------------------------------------------------------
   旧页面原本是「左侧导航 + 深色内容」的独立工作台，跟学生端
   的亮色界面是两套观感，点进去像换了个 App。这里做三件事：

     1. 顶部注入与学生端同款的顶栏：最左边是「← 返回学习路径」
        （整个 App 里最主要的出口，实心大按钮，不用去找），
        右边是 星星 / 连续天数 / 头像 → 通往「我的」
     2. 内页默认切到亮色（与学生端同一套底色），并修好深色
        专用样式在浅底上的失效
     3. 清掉早期版本的侧栏入口与右下浮标，避免重复

   不碰旧页面原有业务逻辑；任何一步失败都静默跳过。
   ============================================================ */
(function () {
    "use strict";

    var SHELL_FLAG = "yx-shell-ready";
    var MODE_KEY = "lg-modes";

    function root() {
        return document.documentElement;
    }

    function readModes() {
        try {
            var v = JSON.parse(localStorage.getItem(MODE_KEY) || "{}");
            return (v && typeof v === "object") ? v : {};
        } catch (e) {
            return {};
        }
    }

    function writeModes(modes) {
        try {
            localStorage.setItem(MODE_KEY, JSON.stringify(modes));
        } catch (e) {}
    }

    /* 默认亮色：学生从学习路径点进来，看到的还是同一个界面。
       若用户自己手动切过深色，就尊重他的选择。 */
    function ensureLight() {
        var modes = readModes();
        if (modes.light === undefined) {
            modes.light = true;
            writeModes(modes);
        }
        root().classList.toggle("lg-light", !!modes.light);
    }

    function ensureStylesheet() {
        var links = document.querySelectorAll('link[rel="stylesheet"]');
        for (var i = 0; i < links.length; i++) {
            if ((links[i].getAttribute("href") || "").indexOf("student.css") >= 0) return;
        }
        var el = document.createElement("link");
        el.rel = "stylesheet";
        el.href = "student.css";
        document.head.appendChild(el);
    }

    function stats() {
        try {
            if (window.YX && window.YX.stats) {
                var s = window.YX.stats();
                return { stars: Number(s.stars) || 0, streak: Number(s.streak) || 0 };
            }
        } catch (e) {}
        return { stars: 0, streak: 0 };
    }

    function isOnline() {
        try {
            return !!(window.YX && window.YX.status && window.YX.status().online);
        } catch (e) {
            return false;
        }
    }

    function avatar() {
        try {
            if (window.YX && window.YX.profile) {
                var p = window.YX.profile();
                if (p && p.avatar) return p.avatar;
            }
        } catch (e) {}
        return "🐣";
    }

    /* ---------- 顶部统一外壳 ---------- */
    function renderBar() {
        var bar = document.getElementById("yx-bar");
        if (!bar) {
            bar = document.createElement("div");
            bar.id = "yx-bar";
            bar.className = "yx-bar";
            bar.innerHTML =
                '<a class="yx-bar__back" href="learn.html" title="回到初 / 中 / 高学习路径"><i>←</i><span class="yx-bar__back-full">返回学习路径</span><span class="yx-bar__back-short">返回</span></a>' +
                '<a class="yx-bar__brand" href="start.html" title="音感觉醒"><span class="dot">🎵</span><span class="yx-bar__name">音感觉醒</span></a>' +
                '<span class="ys-chip ys-chip--star" id="yx-star" title="累计获得的星星">⭐ <b>0</b></span>' +
                '<span class="ys-chip ys-chip--fire" id="yx-fire" title="连续练习天数">🔥 <b>0</b></span>' +
                '<a class="ys-avatar" id="yx-avatar" href="me.html" title="我的">🐣</a>';
            document.body.insertBefore(bar, document.body.firstChild);
        }

        var s = stats();
        var star = document.getElementById("yx-star");
        var fire = document.getElementById("yx-fire");
        var av = document.getElementById("yx-avatar");
        if (star) star.innerHTML = "⭐ <b>" + s.stars + "</b>";
        if (fire) fire.innerHTML = "🔥 <b>" + s.streak + "</b>";
        if (av) {
            av.textContent = avatar();
            av.title = isOnline()
                ? "我的 · 云端已同步"
                : "我的 · 未登录，点此登录后云端保存";
        }

        root().classList.add("yx-hasbar");
    }

    /* ---------- 清掉早期版本的注入物 ---------- */
    function cleanupLegacy() {
        ["yx-pill", "yx-nav-entry", "yx-nav-gate"].forEach(function (id) {
            var el = document.getElementById(id);
            if (el && el.parentNode) el.parentNode.removeChild(el);
        });
    }

    function render() {
        try { ensureStylesheet(); } catch (e) {}
        try { ensureLight(); } catch (e) {}
        try { cleanupLegacy(); } catch (e) {}
        try { renderBar(); } catch (e) {}
    }

    function boot() {
        if (window[SHELL_FLAG]) return;
        window[SHELL_FLAG] = true;

        render();

        if (window.YX && window.YX.init) {
            try {
                if (window.YX.onChange) window.YX.onChange(render);
                window.YX.init().then(render).catch(function () {});
            } catch (e) {}
        }

        document.addEventListener("visibilitychange", function () {
            if (!document.hidden) render();
        });
        window.addEventListener("pageshow", function () {
            /* 从缓存返回时可能停在淡出态，复位一下 */
            root().classList.remove("yx-out");
            root().classList.add("yx-in");
            render();
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }
})();
