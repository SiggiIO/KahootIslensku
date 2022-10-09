// SPDX-License-Identifier: MIT
/*!
 * Copyright 2022 Sigurður Jón (hey@siggi.io)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// ==UserScript==
// @name         Kahoot! á íslensku
// @namespace    https://siggi.io/
// @version      0.1
// @description  Translate gameplay of Kahoot! into Icelandic. Kinda silly that it was in English only in Icelandic class. Must set kahoot language to English in order for it to work.
// @author       Sigurður Jón
// @match        https://kahoot.it/*
// @match        https://www.kahoot.it/*
// @match        https://play.kahoot.it/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=kahoot.it
// @grant        none
// ==/UserScript==

(function () {
    // Look for any text that matches exactly these strings (including spaces) and replace them with another string
    let exactTexts: { [key: string]: string } = {
        "Loading…": "Hleður…",
        // Loading might not get replaced since we only start replacing text after window.onload event is fired

        "Get ready to join": "Vertu tilbúinn til að taka þátt",
        "Loading Game PIN": "Hleður PIN-númer leiksins",
        "Join at ": "Skráðu þig á ",
        "or with the ": "eða í ",
        "Kahoot! app": "Kahoot! appinu",
        "This game is locked": "Þessi leikur er læst",
        "No one else can join": "Enginn annar getur verið með",
        "Waiting for players…": "Bíðum eftir leikmönnum…",
        "Game PIN: ": "PIN-númer leiksins: ",
        "Game PIN:": "PIN-númer leiksins:",
        "Start": "Byrja",
        "Scoreboard": "Stigatafla",
        "Podium": "Verðlaunapallur",
        "Drum roll…": "Trommusláttur…",
        "Next": "Næst",
        "Skip": "Sleppa",

        "Quiz": "Spurningakeppni",

        "True or false": "Satt eða ósatt",
        "True": "Satt",
        "False": "Ósatt",

        "Type answer": "Sláðu inn svar",
        "Players, type your answer!": "Sláðu inn svarið þitt!",
        "Type your answer here": "Sláðu inn svarið þitt hér!",
        "Your answer might be displayed on the big screen": "",
        "Submit": "Leggja fram",

        "Answer": "Svar",
        "Answers": "Svör",

        "This edition of Kahoot! is limited to personal use.": "Do whatever you want with the free version of Kahoot!",
        "Upgrade to use for commercial purposes": "Optionally, click here to throw some money away.",

        // Texts below are player side only
        "Get Ready!": "Vertu tilbúinn!",
        "Correct": "Rétt!",
        "Incorrect": "Rangt!",
        "Time's up": "Þú kláraðir tíma!",
        "Answer Streak": "Rétt Svarlína",
        "Answer Streak lost": "Þú missti rétt svarlínuna þinni!",
        "You're on the podium!": "Þú ert á verðlaunapalli!",

        // Screen that is shown when joining in the middle of a game
        "Get ready!": "Vertu tilbúinn!",
        "You'll be able to join soon": "Þú getur tekið þátt fljótlega",

        "Game PIN": "PIN-númer leiksins",
        "Nickname": "Gælunafn",
        "Checking your nickname": "Augnablik",
        "You're in!": "Þú ert inni!",
        "See your nickname on screen?": "Sérðu gælunafnið þitt á skjánum?",
        "Enter": "Fara inn", // this shows when asking the player to enter the game PIN
        "Connecting to Kahoot!": "Tengist við Kahoot!",
        "OK, go!": "Áfram", // this shows when asking the player to enter their name
        "We didn't recognize that game PIN. Please check and try again.": "Þú slóst inn rangt PIN-númer!",
        "Your nickname has been updated": "Gælunafni þínu var breytt!",
        "Oh, no! You've been kicked out of the game.": "Gestgjafinn fjarlægði þig.",
        "Oops! You need to enter a game PIN before you can play": "Þú þarft að slá inn PIN-númer",
        "Your network is slow, so you might experience delays": "",
        "Create your own kahoot for FREE at ": "Búa til kahoot þitt á ",
        "Terms": "Skilmálar",
        "Privacy": "Friðhelgisstefna",

        "Genius machine?": "",
        "Pure genius?": "",
        "Lightning smart?": "",
        "Classroom perfection?": "",

        "Great try.": "",
        "We believe in you!": "",
        "Dig deep on the next one!": "",
        "It's not over just yet!": "",
        "Dust yourself off. Greatness awaits!": "",
        "No one said it would be easy 😉": "",
        "Nothing worth having comes easy!": "",

        "Epic win!": "",

        "Ready…": "",
        "Set…": "",
        "Go!": "",
    };

    let regexReplacements: Array<{ regex: RegExp, to: string }> = [
        {
            regex: /(\d+) out of (\d+)/g,
            to: "$1 af $2"
        },
        {
            regex: /(\d+) of (\d+)/g,
            to: "$1 af $2"
        },
        {
            regex: /Question\s(\d+)/g,
            to: "Spurning $1"
        },
        {
            regex: /(\d+)(st|nd|rd|th) place/g,
            to: "$1. sæti"
        },
        {
            regex: /(\d+) points behind (.*)/g,
            to: "$1 stigum á eftir $2"
        },
        // {
        //     regex: /(.*) has the highest Answer Streak of (\d+)!/g,
        //     to: ""
        // },
    ];

    // Don't touch anything below :D

    let intervalTimer: number;
    const getAllTexts: (parentNode?: HTMLElement, nodes?: Array<HTMLElement>) => Array<HTMLElement> = function (parentNode, nodes) {
        if (!parentNode) {
            parentNode = document.body;
        }
        if (!nodes) {
            nodes = [];
        }
        let childNodes = parentNode.childNodes;
        for (let i = 0; i < childNodes.length; i++) {
            let node = childNodes[i] as HTMLElement;
            if (node.nodeType == 3 || node.nodeName == "INPUT") {
                nodes.push(node);
            } else {
                getAllTexts(node, nodes);
            }
        }
        return nodes;
    };

    const replaceLoop: () => void = function () {
        let textNodes = getAllTexts();
        for (let i = 0; i < textNodes.length; i++) {
            replaceInTextNode(textNodes[i]);
        }
        replaceSvgText();
    };

    const replaceInTextNode: (node: HTMLElement) => void = function (node) {
        if (node.nodeType == 3) {
            let text: string | null = node.textContent;
            if (text == null || text == "") return;
            let newText = replaceText(text);
            if (text !== newText) {
                node.textContent = newText;
            }
        } else if (node.nodeName == "INPUT") {
            let inputElement = node as HTMLInputElement;
            let text: string | null = inputElement.placeholder;
            if (text == null || text == "") return;
            let newText = replaceText(text);
            if (text !== newText) {
                inputElement.placeholder = newText;
            }
        }
    };

    const replaceText: (text: string) => string = function (text) {
        let newText = exactTexts[text];
        if (newText) {
            return newText;
        }
        newText = text;
        for (let i = 0; i < regexReplacements.length; i++) {
            let replacement = regexReplacements[i];
            newText = newText.replace(replacement.regex, replacement.to);
        }
        return newText;
    };

    const findATextElement: () => SVGTextElement | null = function () {
        let elementsByTagName = document.getElementsByTagName("text");
        if (elementsByTagName.length < 2) return null;
        return elementsByTagName[1];
    }
    const replaceSvgText: () => void = function () {
        let element = findATextElement();
        if (element == null)
            return;
        let parent = element.parentNode as HTMLElement;
        if (parent == null)
            return;
        let textContent = parent.textContent;
        if (textContent == null)
            return;
        textContent = textContent.replace(/[\r\n]/, "");
        let replacement = exactTexts[textContent];
        if (!replacement)
            return;
        removeAllChildren(element);
        let template = element.outerHTML;
        removeAllChildren(parent);
        let newElements = [];
        let newElementsSize = 0;
        for (let i = 0; i < replacement.length; i++) {
            let newText = document.createElement("text") as unknown as SVGTextElement;
            parent.appendChild(newText);
            newText.outerHTML = template;
            newText = parent.lastChild as SVGTextElement;
            newText.innerHTML = replacement.substring(i, i + 1);
            //newText.appendChild(document.createTextNode(replacement.substring(i, i + 1)));
            newElements.push(newText);
            newElementsSize += newText.getBBox().width / 2;
            // I don't know why the bounding box width is double the actual width
            // it just happens to work out correctly when I do this
        }
        let x = -(newElementsSize / 2);
        for (let i = 0; i < newElements.length; i++) {
            let element = newElements[i];
            let elementWidth = element.getBBox().width / 2;
            // divide by 2 just like above
            element.transform.baseVal[0].matrix.e = x;
            x += elementWidth;
        }
    };
    const removeAllChildren: (element: Element) => void = function(element) {
        while (element.hasChildNodes()) {
            // @ts-ignore ignore null check, since firstChild cannot be null if hasChildNodes() is true
            element.removeChild(element.firstChild);
        }
    }

    window.addEventListener("load", () => {
        intervalTimer = window.setInterval(replaceLoop, 5);
    });

    let w: any = window;
    w.stopReplacing = function () {
        window.clearInterval(intervalTimer);
    };
})();
