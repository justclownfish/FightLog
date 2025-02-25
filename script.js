// ==UserScript==
// @name         Лог ударов
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  Подсчитывает количество ударов по противнику и от противника, фиксируя каждую новую запись (стек сверху вниз) и отображая точное время удара
// @author       Далёкая Офелия [1622860]
// @match        https://catwar.net/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function trackHits() {
        let fightLog = document.getElementById('fightLog');
        let hitHistory = [];
        let hitCount = {};
        let lastHitTime = null;

        if (!fightLog) return;

        let counterDisplay = document.createElement('div');
        counterDisplay.style.border = '1px solid #ccc';
        counterDisplay.style.padding = '5px';
        counterDisplay.style.marginTop = '10px';
        counterDisplay.style.background = '#f9f9f9';
        counterDisplay.style.fontSize = '12px';
        counterDisplay.textContent = 'Счётчик ударов:';
        fightLog.parentElement.appendChild(counterDisplay);

        let lastHitDisplay = document.createElement('div');
        lastHitDisplay.style.marginTop = '5px';
        lastHitDisplay.style.fontSize = '12px';
        counterDisplay.appendChild(lastHitDisplay);

        let lastKey = null;

        let observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.ELEMENT_NODE) {
                        let text = node.textContent.trim();
                        let match = text.match(/(.+) => (.+) \((.+)\)/);

                        if (match) {
                            let attacker = match[1];
                            let opponent = match[2];
                            let hitPlace = match[3];
                            let key = `${attacker} -> ${opponent} (${hitPlace})`;
                            let currentTime = new Date();

                            let hours = currentTime.getHours().toString().padStart(2, '0');
                            let minutes = currentTime.getMinutes().toString().padStart(2, '0');
                            let seconds = currentTime.getSeconds().toString().padStart(2, '0');
                            let formattedTime = `${hours}:${minutes}:${seconds}`;

                            if (lastHitTime) {
                                lastHitDisplay.textContent = `Последний удар: ${formattedTime}`;
                            } else {
                                lastHitDisplay.textContent = `Первый удар: ${formattedTime}`;
                            }

                            lastHitTime = currentTime;

                            if (lastKey !== key) {
                                if (lastKey !== null) {
                                    hitHistory.unshift(Object.entries(hitCount).map(([k, v]) => `${k}: ${v}`).join(', '));
                                }
                                hitCount = {};
                            }

                            if (!hitCount[key]) {
                                hitCount[key] = 0;
                            }
                            hitCount[key]++;
                            lastKey = key;

                            let historyText = [Object.entries(hitCount).map(([k, v]) => `${k}: ${v}`).join(', ')].concat(hitHistory).join('<br>');

                            counterDisplay.innerHTML = '<strong>Счётчик ударов:</strong><br>' + historyText;
                            counterDisplay.appendChild(lastHitDisplay);
                        }
                    }
                });
            });
        });

        observer.observe(fightLog, { childList: true, subtree: true });
    }

    window.addEventListener('load', trackHits);
})();
