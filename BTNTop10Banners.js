// ==UserScript==
// @name         BTN Top 10 Banners
// @version      1.1
// @grant        GM_xmlhttpRequest
// @grant        GM.notification
// @match        https://broadcasthe.net/top10.php
// @description  Display Banners on Top 10 page
// @icon         https://broadcasthe.net/favicon.ico
// @author       gunnerkid
// ==/UserScript==

(function() {
    'use strict';

    function addAllBanners() {
        const torrentColumn = document.querySelectorAll('#content tbody tr.colhead');
        torrentColumn.forEach((el,key) => {
            const bannerTd = document.createElement('td');
            bannerTd.className = 'banner';
            el.insertBefore(bannerTd, el.children[2]);
        })
        for (let i = 0; i <= 59; i++) {
            getUrlForBanner(i);
        }
    }

    //Get URL for Title
    function searchTitleUrl(rowCount) {
        var element = [];
        let aElements = document.getElementsByTagName('a');
        for (let i = 0; i < aElements.length; i++) {
            let aElement = aElements[i];
            if (aElement.href.includes('series.php?id=')) {
                element.push(aElement.href);
            }
        }
        return element[rowCount];
    }

    function getUrlForBanner(rowCount) {
        let tvTitleUrl = searchTitleUrl(rowCount);
        if (tvTitleUrl) {
            GM_xmlhttpRequest({
                method: "GET",
                url: tvTitleUrl,
                onload: function(response) {
                    let parser = new DOMParser();
                    let doc = parser.parseFromString(response.responseText, "text/html");
                    let spanElement = doc.querySelector("#banner");
                    if (spanElement) {
                        let bannerUrl = spanElement.src;
                        addBannerToTable(bannerUrl, rowCount);
                    }
                }
            });
        }
    }

    function addBannerToTable(bannerUrl, rowCount) {
        const torrentRow = document.querySelectorAll('#content tbody tr.group_torrent');
        const bannerTd = document.createElement('td');
        bannerTd.className = 'banner1';
        const bannerImg = document.createElement('img');
        bannerImg.style.width = '100%';
        bannerImg.src = bannerUrl;
        bannerTd.appendChild(bannerImg);
        torrentRow[rowCount].insertBefore(bannerTd, torrentRow[rowCount].children[2]);
}

    addAllBanners();

})();
