/**
 * 把带 data-segmented 属性的下拉框渲染成开关式的分段按钮，原下拉框保留并隐藏，
 * 这样既统一了外观，又不影响页面原有的取值逻辑。
 */
(function () {
    "use strict";

    function buildSegmented(select) {
        if (select.dataset.segmentedReady) return;
        select.dataset.segmentedReady = "1";

        var wrap = document.createElement("div");
        wrap.className = "seg";
        wrap.setAttribute("role", "group");

        Array.prototype.forEach.call(select.options, function (option) {
            var button = document.createElement("button");
            button.type = "button";
            button.className = "seg-item";
            button.textContent = option.textContent.trim();
            button.dataset.value = option.value;
            if (option.selected) button.classList.add("active");

            button.addEventListener("click", function () {
                select.value = option.value;
                Array.prototype.forEach.call(wrap.querySelectorAll(".seg-item"), function (item) {
                    item.classList.toggle("active", item.dataset.value === option.value);
                });
                select.dispatchEvent(new Event("change", { bubbles: true }));
            });

            wrap.appendChild(button);
        });

        select.classList.add("seg-source");
        select.parentNode.insertBefore(wrap, select.nextSibling);
    }

    function init() {
        Array.prototype.forEach.call(document.querySelectorAll("select[data-segmented]"), buildSegmented);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
