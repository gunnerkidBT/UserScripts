// ==UserScript==
// @name         BTN Top 10 Banners
// @version      1.3.5
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

    // Function to get the number of torrent rows
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
        torrentRows.forEach((row, index) => {
            const tvTitleUrl = getTitleUrl(index);
            if (tvTitleUrl) {
                fetchBannerUrl(tvTitleUrl, row);
            }
        });
    }

    // Function to get the TV title URL for a given row index
    function getTitleUrl(rowIndex) {
        const aElements = document.querySelectorAll('a[href*="series.php?id="]');
        return aElements[rowIndex] ? aElements[rowIndex].href : null;
    }

    // Function to fetch the banner URL and add it to the row
    function fetchBannerUrl(tvTitleUrl, torrentRow) {
        if (tvShowUrls.has(tvTitleUrl)) {
            addBannerToRow(tvShowUrls.get(tvTitleUrl), torrentRow);
        } else {
            GM_xmlhttpRequest({
                method: "GET",
                url: tvTitleUrl,
                onload: (response) => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(response.responseText, "text/html");
                    const spanElement = doc.querySelector("#banner");
                    if (spanElement) {
                        const bannerUrl = spanElement.src;
                        tvShowUrls.set(tvTitleUrl, bannerUrl);
                        addBannerToRow(bannerUrl, torrentRow);
                    } else {
                        console.error('Banner element not found for URL:', tvTitleUrl);
                    }
                },
                onerror: (error) => {
                    console.error('Error fetching banner URL:', error);
                }
            });
        }
    }

    // Function to add a banner to the specified row
    function addBannerToRow(bannerUrl, torrentRow) {
        const bannerTd = document.createElement('td');
        bannerTd.classList.add('banner');
        bannerTd.style.width = '37%'; //Adjust Banner Size
        bannerTd.style.height = '37%'; //Adjust Banner Size
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
