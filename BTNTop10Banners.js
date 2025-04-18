// ==UserScript==
// @name         BTN Top 10 Banners
// @version      1.4.3
// @description  Display banners on Top 10 and optionally resize banners on torrents page
// @match        https://broadcasthe.net/top10.php*
// @match        https://broadcasthe.net/torrents.php*
// @grant        GM_xmlhttpRequest
// @connect      broadcasthe.net
// ==/UserScript==

(function () {
    'use strict';

    const ENABLE_RESIZE_TORRENTS = true; // Toggle to false to disable resizing on torrents.php

    const IS_TOP10 = location.pathname.includes('/top10.php');
    const IS_TORRENTS = location.pathname.includes('/torrents.php');

    const BANNER_SIZE = '37%';

    function addAllTop10Banners() {
        const rows = document.querySelectorAll('#content tbody tr.group_torrent');
        const headers = document.querySelectorAll('#content tbody tr.colhead');

        headers.forEach(header => {
            const bannerHeader = document.createElement('td');
            header.insertBefore(bannerHeader, header.children[2]);
        });

        rows.forEach(row => {
            const seriesLink = row.querySelector('a[href*="series.php?id="]');
            if (!seriesLink) return;

            const seriesUrl = seriesLink.href;

            GM_xmlhttpRequest({
                method: 'GET',
                url: seriesUrl,
                onload: response => {
                    const doc = new DOMParser().parseFromString(response.responseText, 'text/html');
                    const banner = doc.querySelector('#banner');
                    if (banner && banner.src) {
                        const td = document.createElement('td');
                        td.style.width = BANNER_SIZE;

                        const a = document.createElement('a');
                        a.href = seriesUrl;

                        const img = new Image();
                        img.src = banner.src;
                        img.style.width = '100%';
                        img.style.borderRadius = '8px';
                        img.style.display = 'block';

                        a.appendChild(img);
                        td.appendChild(a);
                        row.insertBefore(td, row.children[2]);
                    }
                }
            });
        });
    }

    function resizeTorrentBanners() {
        const cells = document.querySelectorAll('#torrent_table tr.torrent td:nth-child(2)');

        if (!cells.length) {
            console.log('[BTN Resize] Waiting for banners...');
            setTimeout(resizeTorrentBanners, 500);
            return;
        }

        cells.forEach(cell => {
            cell.style.width = '100%';
            cell.style.minWidth = '100%';
            cell.style.textAlign = 'center';
            cell.style.verticalAlign = 'middle';

            const img = cell.querySelector('img');
            if (img) {
                img.onload = () => {
                    img.removeAttribute('width');
                    img.removeAttribute('height');
                    img.style.width = '100%';
                    img.style.maxWidth = '100%';
                    img.style.height = 'auto';
                    img.style.borderRadius = '8px';
                    img.style.display = 'block';
                    img.style.margin = '0 auto';
                };
                if (img.complete) img.onload();
            }
        });

        console.log(`[BTN Resize] Resized ${cells.length} banner cells.`);
    }

    window.addEventListener('load', () => {
        if (IS_TOP10) {
            addAllTop10Banners();
        } else if (IS_TORRENTS && ENABLE_RESIZE_TORRENTS) {
            resizeTorrentBanners();
        }
    });
})();
