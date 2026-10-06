/**
 * AI 图片异步生成 · 自动刷新器
 * 首次请求只返回"生成中"占位图，服务器后台出图。
 * 通过给 URL 追加片段标识（#gen1、#gen2……）强制浏览器重新请求同一地址——
 * 片段不会发送到服务器，不影响按 prompt 缓存的服务端结果；
 * 生成完成后，图片会在下一轮自动替换为真图，无需手动刷新。
 */
(function () {
    const KEY = 'text_to_image';
    // 刷新轮次（毫秒）：越早越密，兜底到 100 秒
    const ROUNDS = [3000, 10000, 20000, 35000, 55000, 80000, 110000];

    let targets = [];

    function collect() {
        const list = [];
        // 1) 所有 <img>
        document.querySelectorAll('img').forEach(img => {
            if (img.src && img.src.includes(KEY)) {
                list.push({ el: img, type: 'img', tpl: img.src.split('#')[0] });
            }
        });
        // 2) 所有带 CSS 背景图的元素
        document.querySelectorAll('*').forEach(el => {
            const bg = getComputedStyle(el).backgroundImage;
            if (bg && bg.includes(KEY)) {
                list.push({ el, type: 'bg', tpl: bg });
            }
        });
        return list;
    }

    function refresh(round) {
        const frag = '#gen' + round;
        targets.forEach(t => {
            if (t.type === 'img') {
                t.el.src = t.tpl + frag;
            } else {
                t.el.style.backgroundImage = t.tpl.replace(
                    /url\(("|')?(https:[^"')]*text_to_image[^"')]*)\1\)/g,
                    (m, q, u) => 'url("' + u.split('#')[0] + frag + '")'
                );
            }
        });
    }

    window.addEventListener('DOMContentLoaded', () => {
        targets = collect();
        ROUNDS.forEach((delay, i) => setTimeout(() => refresh(i + 1), delay));
    });
})();
