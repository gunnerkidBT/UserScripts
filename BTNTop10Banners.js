// ==UserScript==
// @name         BTN Top 10 Banners + Resize
// @version      1.4.4
// @description  Display banners on Top 10 and optionally resize banners on torrents page
// @match        https://broadcasthe.net/top10.php*
// @match        https://broadcasthe.net/torrents.php*
// @grant        GM_xmlhttpRequest
// @connect      broadcasthe.net
// ==/UserScript==

(function () {
    'use strict';

    // === SETTINGS ===
    const ENABLE_RESIZE_TORRENTS = true;      // Set to false to disable resizing banners on torrents.php
    const ENABLE_ROUNDED_CORNERS = true;      // Set to false to remove rounded corners from banners

    // === PAGE CONTEXT ===
    const IS_TOP10 = location.pathname.includes('/top10.php');      // Are we on the Top 10 page?
    const IS_TORRENTS = location.pathname.includes('/torrents.php'); // Are we on the Torrents page?

    const BANNER_SIZE = '37%'; // Width of the banner column on Top 10 page

    /**
     * Fetches and adds banners to each torrent group listed on the Top 10 page.
     */
    function addAllTop10Banners() {
        const rows = document.querySelectorAll('#content tbody tr.group_torrent'); // Data rows
        const headers = document.querySelectorAll('#content tbody tr.colhead');    // Header rows

        // Add an empty header cell for the new banner column
        headers.forEach(header => {
            const bannerHeader = document.createElement('td');
            header.insertBefore(bannerHeader, header.children[2]); // Insert before the 3rd column
        });

        // Process each row to fetch and insert the banner
        rows.forEach(row => {
            const seriesLink = row.querySelector('a[href*="series.php?id="]');
            if (!seriesLink) return;

            const seriesUrl = seriesLink.href;

            // Fetch the series page to get the banner image
            GM_xmlhttpRequest({
                method: 'GET',
                url: seriesUrl,
                onload: response => {
                    const doc = new DOMParser().parseFromString(response.responseText, 'text/html');
                    const banner = doc.querySelector('#banner');

                    if (banner && banner.src) {
                        // Create new table cell with the banner
                        const td = document.createElement('td');
                        td.style.width = BANNER_SIZE;

                        const a = document.createElement('a');
                        a.href = seriesUrl;

                        const img = new Image();
                        img.src = banner.src;
                        img.style.width = '100%';
                        img.style.display = 'block';
                        if (ENABLE_ROUNDED_CORNERS) {
                            img.style.borderRadius = '8px';
                        }

                        a.appendChild(img);
                        td.appendChild(a);
                        row.insertBefore(td, row.children[2]); // Insert before the 3rd column
                    }
                }
            });
        });
    }

    /**
     * Resizes banners on the torrents.php page to be full-width and styled consistently.
     */
    function resizeTorrentBanners() {
        const cells = document.querySelectorAll('#torrent_table tr.torrent td:nth-child(2)');

        // If banners haven't loaded yet, wait and retry
        if (!cells.length) {
            console.log('[BTN Resize] Waiting for banners...');
            setTimeout(resizeTorrentBanners, 500);
            return;
        }

        // Resize each banner image
        cells.forEach(cell => {
            cell.style.width = '100%';
            cell.style.minWidth = '100%';
            cell.style.textAlign = 'center';
            cell.style.verticalAlign = 'middle';

            const img = cell.querySelector('img');
            if (img) {
                // Remove fixed dimensions and apply responsive styling
                img.onload = () => {
                    img.removeAttribute('width');
                    img.removeAttribute('height');
                    img.style.width = '100%';
                    img.style.maxWidth = '100%';
                    img.style.height = 'auto';
                    img.style.display = 'block';
                    img.style.margin = '0 auto';

                    if (ENABLE_ROUNDED_CORNERS) {
                        img.style.borderRadius = '8px';
                    }
                };

                // If the image is already loaded, call onload manually
                if (img.complete) img.onload();
            }
        });

        console.log(`[BTN Resize] Resized ${cells.length} banner cells.`);
    }

    /**
     * Main execution trigger when the page loads.
     */
    window.addEventListener('load', () => {
        if (IS_TOP10) {
            addAllTop10Banners(); // Apply to Top 10 page
        } else if (IS_TORRENTS && ENABLE_RESIZE_TORRENTS) {
            resizeTorrentBanners(); // Apply to torrents page if enabled
        }
    });
})();
