/* ============================================================
   音感觉醒 · 个性化设置  (yx-theme.js)
   ------------------------------------------------------------
   一套状态、两个入口：
     · 学生端 —— me.html 的「个性化」卡片
     · 内页   —— 右下角「🎛 模式」面板里的「配色方案」

   状态存在 localStorage 的 lg-modes 里（和 focus / light / large 同一个键），
   这个键已经在 yx-cloud.js 的同步名单中，所以登录后配色会跟着账号走。
   写回时只覆盖自己管的字段，不动 modes.js 写的那些。
   ============================================================ */
(function (global) {
    "use strict";

    var KEY = "lg-modes";

    var PALETTES = [
        { id: "indigo", name: "靛蓝", a: "#3b5bfd", b: "#06b6d4" },
        { id: "ocean", name: "海洋", a: "#0284c7", b: "#22d3ee" },
        { id: "forest", name: "森林", a: "#10b981", b: "#34d399" },
        { id: "sunset", name: "暖阳", a: "#f97316", b: "#fbbf24" },
        { id: "berry", name: "莓果", a: "#8b5cf6", b: "#ec4899" },
        { id: "graphite", name: "石墨", a: "#475569", b: "#0ea5e9" }
    ];

    var listeners = [];

    function each(list, fn) {
        Array.prototype.forEach.call(list || [], fn);
    }

    function read() {
        var v = null;
        try { v = JSON.parse(global.localStorage.getItem(KEY) || "{}"); } catch (e) { v = null; }
        return (v && typeof v === "object") ? v : {};
    }

    function find(id) {
        for (var i = 0; i < PALETTES.length; i++) {
            if (PALETTES[i].id === id) return PALETTES[i];
        }
        return null;
    }

    function state() {
        var v = read();
        return {
            palette: find(v.palette) ? v.palette : "indigo",
            light: v.light === undefined ? true : !!v.light,
            large: !!v.large,
            focus: !!v.focus
        };
    }

    /* 读-改-写：modes.js 也写同一个键，不能整体覆盖 */
    function persist(s) {
        var v = read();
        v.palette = s.palette;
        v.light = !!s.light;
        v.large = !!s.large;
        v.focus = !!s.focus;
        try { global.localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {}
    }

    function apply(s) {
        var r = document.documentElement;
        r.setAttribute("data-ys-palette", s.palette);
        r.classList.toggle("lg-light", !!s.light);
        r.classList.toggle("ys-dark", !s.light);
        r.classList.toggle("lg-large", !!s.large);
        r.classList.toggle("lg-focus", !!s.focus);
    }

    function emit(s) {
        each(listeners, function (cb) {
            try { cb(s); } catch (e) {}
        });
    }

    function label(s) {
        var p = find(s.palette) || PALETTES[0];
        return p.name + " · " + (s.light ? "亮色" : "深色") + (s.large ? " · 大屏" : "");
    }

    function set(patch) {
        var s = state();
        if (patch) {
            if (patch.palette !== undefined && find(patch.palette)) s.palette = patch.palette;
            if (patch.light !== undefined) s.light = !!patch.light;
            if (patch.large !== undefined) s.large = !!patch.large;
            if (patch.focus !== undefined) s.focus = !!patch.focus;
        }
        persist(s);
        apply(s);
        syncUI();
        emit(s);
        return s;
    }

    /* ---------- 界面 ---------- */

    function swatchesHTML() {
        var s = state();
        return '<div class="yx-swatches">' + PALETTES.map(function (p) {
            return '<button type="button" class="yx-swatch" data-palette="' + p.id + '"' +
                ' aria-pressed="' + (p.id === s.palette ? "true" : "false") + '"' +
                ' style="--a:' + p.a + ';--b:' + p.b + '">' +
                '<span class="yx-swatch__dot"></span>' +
                '<span class="yx-swatch__name">' + p.name + "</span>" +
                "</button>";
        }).join("") + "</div>";
    }

    function switchHTML(key, title, desc) {
        return '<label class="yx-row">' +
            '<span class="yx-row__txt"><strong>' + title + "</strong><small>" + desc + "</small></span>" +
            '<input type="checkbox" class="yx-sw" data-sw="' + key + '">' +
            "</label>";
    }

    function syncUI() {
        var s = state();
        each(document.querySelectorAll("[data-palette]"), function (b) {
            b.setAttribute("aria-pressed", b.getAttribute("data-palette") === s.palette ? "true" : "false");
        });
        each(document.querySelectorAll("[data-sw]"), function (i) {
            var k = i.getAttribute("data-sw");
            i.checked = (k === "dark") ? !s.light : !!s[k];
        });
        each(document.querySelectorAll("[data-theme-label]"), function (el) {
            el.textContent = label(s);
        });
    }

    function bind(scope) {
        var root = scope || document;
        if (root.__yxThemeBound) return;
        root.__yxThemeBound = true;

        root.addEventListener("click", function (ev) {
            var t = ev.target;
            var b = (t && t.closest) ? t.closest("[data-palette]") : null;
            if (!b) return;
            ev.preventDefault();
            if (ev.stopPropagation) ev.stopPropagation();
            set({ palette: b.getAttribute("data-palette") });
        });

        root.addEventListener("change", function (ev) {
            var i = ev.target;
            if (!i || !i.getAttribute) return;
            var k = i.getAttribute("data-sw");
            if (!k) return;
            var patch = {};
            if (k === "dark") patch.light = !i.checked;
            else patch[k] = !!i.checked;
            set(patch);
        });
    }

    /* 一次性搭好一个设置区 */
    function mount(container, opts) {
        if (!container) return;
        opts = opts || {};
        container.innerHTML =
            swatchesHTML() +
            switchHTML("dark", "深色模式", "晚上或关灯练习时用，眼睛舒服些") +
            (opts.noLarge ? "" : switchHTML("large", "大屏模式", "整体放大，投影和后排也看得清")) +
            (opts.noFocus ? "" : switchHTML("focus", "专注模式", "收起左侧导航，需要时鼠标移到左边滑出"));
        bind(container);
        syncUI();
    }

    function boot() {
        try { apply(state()); } catch (e) {}
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", function () {
                try { syncUI(); } catch (e) {}
            });
        } else {
            try { syncUI(); } catch (e) {}
        }
    }

    global.YXTheme = {
        PALETTES: PALETTES,
        state: state,
        set: set,
        label: label,
        onChange: function (cb) { if (typeof cb === "function") listeners.push(cb); },
        swatchesHTML: swatchesHTML,
        switchHTML: switchHTML,
        syncUI: syncUI,
        bind: bind,
        mount: mount,
        apply: function () { apply(state()); }
    };

    boot();
})(window);
