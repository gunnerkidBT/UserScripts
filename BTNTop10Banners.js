// ==UserScript==
// @name         BTN Top 10 Banners
// @version      1.0.1
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
        for (let i = 0; i <= 59; i++) {
            getUrlForBanner(i);
        }
    }

    //Get URL for Title
    function searchTitleUrl(columnCount) {
        var element = [];
        let aElements = document.getElementsByTagName('a');
        for (let i = 0; i < aElements.length; i++) {
            let aElement = aElements[i];
            if (aElement.href.includes('series.php?id=')) {
                element.push(aElement.href);
            }
        }
        return element[columnCount];
    }

    function getUrlForBanner(columnCount) {
        let tvTitleUrl = searchTitleUrl(columnCount);
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
                        addLogoToPanel(bannerUrl, columnCount);
                    }
                }
            });
        }
    }

    function addLogoToPanel(bannerUrl, columnCount) {

        const container = document.querySelectorAll("#content tbody tr.group_torrent td.center img");
        container[columnCount].style.width = '100%';
        container[columnCount].src = bannerUrl
}

    addAllBanners();

})();
