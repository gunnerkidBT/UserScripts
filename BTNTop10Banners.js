// ==UserScript==
// @name         BTN Top 10 Banners
// @version      1.4.1
// @grant        GM_xmlhttpRequest
// @grant        GM.notification
// @match        https://broadcasthe.net/top10.php*
// @exclude      https://broadcasthe.net/top10.php?type=users
// @exclude      https://broadcasthe.net/top10.php?type=forums
// @description  Display Banners on Top 10 page with rounded corners
// @icon         https://broadcasthe.net/favicon.ico
// @author       gunnerkid
// ==/UserScript==

(function () {
    'use strict';

    const BANNER_SIZE = '37%';
    const BANNER_COLUMN_INDEX = 2;
    const TV_SHOW_URL_SELECTOR = 'a[href*="series.php?id="]';
    const bannerCache = new Map();

    function init() {
        const content = document.querySelector('#content');
        if (!content) return;

        const rows = content.querySelectorAll('tbody tr.group_torrent');
        const headers = content.querySelectorAll('tbody tr.colhead');
        const links = content.querySelectorAll(TV_SHOW_URL_SELECTOR);

        headers.forEach(addBannerColumn);
        rows.forEach((row, i) => {
            const link = links[i];
            if (link) {
                const tvShowUrl = link.href;
                const showId = new URL(tvShowUrl).searchParams.get("id");

                if (!showId) return;

                if (bannerCache.has(showId)) {
                    addBannerToRow(bannerCache.get(showId), tvShowUrl, row);
                } else {
                    fetchBanner(tvShowUrl, showId, row);
                }
            }
        });
    }

    function addBannerColumn(headerRow) {
        const bannerTd = document.createElement('td');
        bannerTd.className = 'banner';
        headerRow.insertBefore(bannerTd, headerRow.children[BANNER_COLUMN_INDEX]);
    }

    function fetchBanner(url, showId, row) {
        GM_xmlhttpRequest({
            method: "GET",
            url,
            onload: (res) => {
                const doc = new DOMParser().parseFromString(res.responseText, "text/html");
                const banner = doc.querySelector("#banner");

                if (banner && banner.src) {
                    bannerCache.set(showId, banner.src);
                    addBannerToRow(banner.src, url, row);
                } else {
                    console.warn(`No banner found for ${url}`);
                }
            },
            onerror: (err) => {
                console.error(`Failed to fetch ${url}:`, err);
            }
        });
    }

    function addBannerToRow(bannerUrl, linkUrl, row) {
        const bannerTd = document.createElement('td');
        bannerTd.className = 'banner';
        bannerTd.style.width = BANNER_SIZE;
        bannerTd.style.height = BANNER_SIZE;

        const a = document.createElement('a');
        a.href = linkUrl;

        const img = new Image();
        img.src = bannerUrl;
        img.style.width = '100%';
        img.style.borderRadius = '8px'; // Rounded corners

        a.appendChild(img);
        bannerTd.appendChild(a);

        row.insertBefore(bannerTd, row.children[BANNER_COLUMN_INDEX]);
    }

    init();

})();
