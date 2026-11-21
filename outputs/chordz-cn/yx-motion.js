/* ============================================================
   音感觉醒 · 跨页过渡  (yx-motion.js)
   ------------------------------------------------------------
   解决“点进下一页像换了个 App”的生硬感。

   入场交给 CSS（body 上的 yx-fadein 动画）—— 不依赖 JS 时序，
   JS 挂了也只是没有动画，页面绝不会卡在半透明。
   这里只负责：
     1. 点站内链接时先淡出，再跳转
     2. 内容块自上而下依次浮现（stagger）
     3. 从缓存返回时把状态复位
   任何一步失败都静默跳过。
   ============================================================ */
(function () {
    "use strict";

    var ROOT = document.documentElement;
    var EXIT_MS = 170;
    var STAGGER_MAX = 14;
    var STAGGER_SEL = [
        ".yx-bar", ".ys-card", ".ys-tier",
        ".panel", ".training-card", ".card",
        ".results", ".controls", ".guide-container",
        ".hero", ".home-hero", ".home-card"
    ].join(",");

    function stagger() {
        var nodes;
        try {
            nodes = document.querySelectorAll(STAGGER_SEL);
        } catch (e) {
            return;
        }
        var n = 0;
        for (var i = 0; i < nodes.length && n < STAGGER_MAX; i++) {
            var el = nodes[i];
            /* 跳过隐藏元素，免得延迟白排 */
            if (el.offsetHeight === 0 && el.offsetWidth === 0) continue;
            el.style.animationDelay = (n * 22) + "ms";
            el.classList.add("yx-stagger");
            n++;
        }
    }

    function leave(href) {
        ROOT.classList.add("yx-out");
        var done = false;
        function go() {
            if (done) return;
            done = true;
            location.href = href;
        }
        setTimeout(go, EXIT_MS);
        /* 兜底：万一定时器被节流，1.2 秒后也要走 */
        setTimeout(go, 1200);
    }

    function sameSite(href) {
        if (!href) return false;
        if (/^(https?:|mailto:|tel:|javascript:|\/\/|data:)/i.test(href)) return false;
        if (href.charAt(0) === "#") return false;
        return true;
    }

    function onClick(event) {
        if (event.defaultPrevented || event.button !== 0) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        var target = event.target;
        var a = target && target.closest ? target.closest("a[href]") : null;
        if (!a) return;
        if (a.target && a.target !== "_self") return;
        if (a.hasAttribute("download")) return;
        if (a.getAttribute("data-no-transition") === "1") return;
        var href = a.getAttribute("href");
        if (!sameSite(href)) return;
        event.preventDefault();
        leave(href);
    }

    function onPageShow(event) {
        /* 从缓存返回：把“已淡出”状态复位，并跳过重播入场 */
        if (event && event.persisted) {
            ROOT.classList.remove("yx-out");
            ROOT.classList.add("yx-settled");
        }
    }

    function start() {
        try {
            stagger();
            document.addEventListener("click", onClick, true);
            window.addEventListener("pageshow", onPageShow);
            document.addEventListener("visibilitychange", function () {
                if (!document.hidden) ROOT.classList.remove("yx-out");
            });
        } catch (e) {}
    }

    /* 等 DOM 就绪再找卡片；但无论 DOM 是否就绪，链接拦截都必须挂上 */
    try {
        if (document.readyState === "loading") {
            document.addEventListener("click", onClick, true);
            window.addEventListener("pageshow", onPageShow);
            document.addEventListener("DOMContentLoaded", stagger);
            document.addEventListener("visibilitychange", function () {
                if (!document.hidden) ROOT.classList.remove("yx-out");
            });
        } else {
            start();
        }
    } catch (e) {}
})();
