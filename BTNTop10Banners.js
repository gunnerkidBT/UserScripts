// ==UserScript==
// @name         BTN Top 10 Banners
// @version      1.4.0
// @grant        GM_xmlhttpRequest
// @grant        GM.notification
// @match        https://broadcasthe.net/top10.php*
// @exclude      https://broadcasthe.net/top10.php?type=users
// @exclude      https://broadcasthe.net/top10.php?type=forums
// @description  Display Banners on Top 10 page
// @icon         https://broadcasthe.net/favicon.ico
// @author       gunnerkid
// ==/UserScript==

(function () {
    'use strict';

    const BANNER_SIZE = '37%';
    const BANNER_COLUMN_INDEX = 2;
    const TV_SHOW_URL_SELECTOR = 'a[href*="series.php?id="]';
    const tvShowUrls = new Map();

    // Add banner column to header row
    function addBannerColumn(column) {
        if (column.querySelector('td.banner')) return;
        const bannerTd = document.createElement('td');
        bannerTd.classList.add('banner');
        column.insertBefore(bannerTd, column.children[BANNER_COLUMN_INDEX]);
    }

    // Get the series page URL from the row
    function getTitleUrl(row) {
        const a = row.querySelector(TV_SHOW_URL_SELECTOR);
        return a ? a.href : null;
    }

    // Add loading spinner to row while banner is loading
    function addLoadingCell(row) {
        const td = document.createElement('td');
        td.classList.add('banner');
        td.style.width = BANNER_SIZE;
        td.style.height = BANNER_SIZE;
        td.style.display = 'flex';
        td.style.justifyContent = 'center';
        td.style.alignItems = 'center';

        const spinner = document.createElement('div');
        spinner.style.border = '4px solid #ccc';
        spinner.style.borderTop = '4px solid #666';
        spinner.style.borderRadius = '50%';
        spinner.style.width = '24px';
        spinner.style.height = '24px';
        spinner.style.animation = 'spin 1s linear infinite';

        td.appendChild(spinner);
        row.insertBefore(td, row.children[BANNER_COLUMN_INDEX]);
    }

    // Add banner image to a row
    function addBannerToRow(bannerUrl, tvTitleUrl, row) {
        const bannerTd = document.createElement('td');
        bannerTd.classList.add('banner');
        bannerTd.style.width = BANNER_SIZE;
        bannerTd.style.height = BANNER_SIZE;

        const bannerLink = document.createElement('a');
        bannerLink.href = tvTitleUrl;

        const bannerImg = new Image();
        bannerImg.style.width = '100%';
        bannerImg.style.borderRadius = '4px';
        bannerImg.style.opacity = '0';
        bannerImg.style.transition = 'opacity 0.3s ease-in-out';
        bannerImg.onload = () => {
            bannerImg.style.opacity = '1';
        };
        bannerImg.src = bannerUrl;

        bannerLink.appendChild(bannerImg);
        bannerTd.appendChild(bannerLink);

        replaceBannerCell(row, bannerTd);
    }

    // Add a placeholder when no banner is found
    function addEmptyBannerCell(row) {
        const td = document.createElement('td');
        td.classList.add('banner');
        td.style.width = BANNER_SIZE;
        td.style.height = BANNER_SIZE;
        td.style.color = '#999';
        td.style.fontStyle = 'italic';
        td.style.textAlign = 'center';
        td.style.verticalAlign = 'middle';
        td.textContent = 'No Banner';

        replaceBannerCell(row, td);
    }

    // Replace loading cell or old banner cell with new one
    function replaceBannerCell(row, newCell) {
        const existing = row.querySelector('td.banner');
        if (existing) {
            row.replaceChild(newCell, existing);
        } else {
            row.insertBefore(newCell, row.children[BANNER_COLUMN_INDEX]);
        }
    }

    // Fetch the banner for a given series page
    function fetchBannerUrl(tvTitleUrl, row) {
        GM_xmlhttpRequest({
            method: "GET",
            url: tvTitleUrl,
            onload: (response) => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(response.responseText, "text/html");
                const bannerElement = doc.querySelector("#banner");

                if (bannerElement && bannerElement.src) {
                    const bannerUrl = bannerElement.src;
                    tvShowUrls.set(tvTitleUrl, bannerUrl);
                    addBannerToRow(bannerUrl, tvTitleUrl, row);
                } else {
                    tvShowUrls.set(tvTitleUrl, null);
                    addEmptyBannerCell(row);
                    console.warn('No banner found at:', tvTitleUrl);
                }
            },
            onerror: (error) => {
                console.error('Error fetching banner:', error);
                addEmptyBannerCell(row);
            }
        });
    }

    // Fetch or use cached banner
    function fetchAndAddBanner(row) {
        const tvTitleUrl = getTitleUrl(row);
        if (!tvTitleUrl) return;

        addLoadingCell(row); // Insert loading cell while fetching

        const cached = tvShowUrls.get(tvTitleUrl);
        if (cached !== undefined) {
            if (cached) {
                addBannerToRow(cached, tvTitleUrl, row);
            } else {
                addEmptyBannerCell(row);
            }
        } else {
            fetchBannerUrl(tvTitleUrl, row);
        }
    }

    // Inject banners into the table
    function addAllBanners() {
        const headerRows = document.querySelectorAll('#content tbody tr.colhead');
        const torrentRows = document.querySelectorAll('#content tbody tr.group_torrent');

        headerRows.forEach(addBannerColumn);
        torrentRows.forEach(fetchAndAddBanner);
    }

    // Inject CSS for spinner
    function injectCSS() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    // Init
    function init() {
        injectCSS();
        addAllBanners();
    }

    init();

})();
