/*
 * 滚动位置保护
 * 页面里的列表、选项、卡片在点击后经常会被重新生成，被点掉的那个元素从页面上消失时，
 * 浏览器会把焦点交还给页面本身，滚动位置有时会被顶回顶部，看起来像“自动返回原界面”。
 * 这里记录点击时的滚动位置，只在“被点击的元素确实从页面上消失且视图跳走”时还原。
 */
(function () {
    "use strict";

    var WATCH_MS = 1600;
    var TOLERANCE = 6;

    function currentY() {
        return window.pageYOffset || document.documentElement.scrollTop || 0;
    }

    document.addEventListener(
        "click",
        function (event) {
            var node = event.target;
            if (!node || node.nodeType !== 1) return;
            var startY = currentY();
            if (startY < 40) return;

            var deadline = Date.now() + WATCH_MS;
            var timer = null;

            function stop() {
                if (timer !== null) {
                    window.clearInterval(timer);
                    timer = null;
                }
                window.removeEventListener("scroll", onScroll, true);
            }

            // 滚动一旦发生就立刻判断并还原，比定时轮询快得多，肉眼看不到跳动
            function onScroll() {
                if (node.isConnected === false) {
                    var nowY = currentY();
                    if (Math.abs(nowY - startY) > TOLERANCE) {
                        window.scrollTo(0, startY);
                    }
                    stop();
                    return;
                }
                if (Date.now() > deadline) stop();
            }

            window.addEventListener("scroll", onScroll, true);
            timer = window.setInterval(onScroll, 120);
        },
        true,
    );

    /*
     * 侧边导航位置记忆
     * 左侧功能列表比屏幕高，需要滚动才能看到下面的分组。点击功能会打开新页面，
     * 导航如果重新从顶部开始，找过的位置就白找了，看起来像“跳回了滚动之前的状态”。
     * 这里把导航自身的滚动位置记下来，换页后放回原处。
     */
    var NAV_KEY = "lg-nav-scroll";

    function navElement() {
        return document.querySelector(".main-nav");
    }

    function saveNavPos(nav) {
        try {
            window.sessionStorage.setItem(NAV_KEY, String(Math.round(nav.scrollTop)));
        } catch (error) {
            /* 存储不可用时忽略 */
        }
    }

    function restoreNavPos(nav) {
        var value = null;
        try {
            value = window.sessionStorage.getItem(NAV_KEY);
        } catch (error) {
            value = null;
        }
        if (value === null) return;
        var top = Number(value);
        if (!isFinite(top) || top <= 0) return;
        nav.scrollTop = top;
        window.requestAnimationFrame(function () {
            nav.scrollTop = top;
        });
    }

    function setupNavMemory() {
        var nav = navElement();
        if (!nav) return;
        restoreNavPos(nav);
        nav.addEventListener("scroll", function () {
            saveNavPos(nav);
        });
        nav.addEventListener(
            "click",
            function (event) {
                saveNavPos(nav);
                var link = event.target && event.target.closest ? event.target.closest("a") : null;
                if (!link) return;
                var href = link.getAttribute("href") || "";
                if (!href || href.charAt(0) === "#") return;
                // 页面即将跳转，把当前位置再写一次，避免被后续滚动事件覆盖
                saveNavPos(nav);
            },
            true,
        );
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", setupNavMemory);
    } else {
        setupNavMemory();
    }
})();
