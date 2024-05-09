// ==UserScript==
// @name         BTN Top 10 Banners
// @version      1.3.3
// @grant        GM_xmlhttpRequest
// @grant        GM.notification
// @match        https://broadcasthe.net/top10.php*
// @exclude      https://broadcasthe.net/top10.php?type=users
// @exclude      https://broadcasthe.net/top10.php?type=forums
// @description  Display Banners on Top 10 page
// @icon         https://broadcasthe.net/favicon.ico
// @author       gunnerkid
// ==/UserScript==

(function() {
    'use strict';

    // Map to store TV show URLs
    const tvShowUrls = new Map();

    function getRowCount() {
        return document.querySelectorAll('#content tbody tr.group_torrent').length;
    }

    // Function to add banners to all torrent columns
    function addAllBanners() {
        const torrentColumns = document.querySelectorAll('#content tbody tr.colhead');
        torrentColumns.forEach((column) => {
            const bannerTd = document.createElement('td');
            bannerTd.classList.add('banner');
            column.insertBefore(bannerTd, column.children[2]);
        });

        const torrentRows = document.querySelectorAll('#content tbody tr.group_torrent');

        for (let i = 0; i < getRowCount(); i++) {
            const tvTitleUrl = searchTitleUrl(i);
            if (tvTitleUrl) {
                getUrlForBanner(tvTitleUrl, torrentRows[i]);
            }
        }
    }

    // Function to search for TV title URL
    function searchTitleUrl(rowCount) {
        const aElements = document.querySelectorAll('a[href*="series.php?id="]');
        return aElements[rowCount] ? aElements[rowCount].href : null;
    }

    // Function to get URL for banner
    function getUrlForBanner(tvTitleUrl, torrentRow) {
        if (!tvTitleUrl) {
            return;
        }

        // Check if the URL is already stored in the Map
        if (tvShowUrls.has(tvTitleUrl)) {
            addBannerToTable(tvShowUrls.get(tvTitleUrl), torrentRow);
        } else {
            GM_xmlhttpRequest({
                method: "GET",
                url: tvTitleUrl,
                onload: function(response) {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(response.responseText, "text/html");
                    const spanElement = doc.querySelector("#banner");
                    if (spanElement) {
                        const bannerUrl = spanElement.src;
                        // Store the URL in the Map
                        tvShowUrls.set(tvTitleUrl, bannerUrl);
                        addBannerToTable(bannerUrl, torrentRow);
                    }
                },
                onerror: function(error) {
                    console.error('Error fetching banner URL:', error);
                }
            });
        }
    }

    // Function to add banner to the table
    function addBannerToTable(bannerUrl, torrentRow) {
        const bannerTd = document.createElement('td');
        bannerTd.classList.add('banner');
        const bannerImg = new Image();
        bannerImg.style.width = '100%';
        bannerImg.src = bannerUrl;
        bannerTd.appendChild(bannerImg);
        torrentRow.insertBefore(bannerTd, torrentRow.children[2]);
    }

    // Initialization function
    function init() {
        addAllBanners();
    }

    // Call the initialization function
    init();
})();
