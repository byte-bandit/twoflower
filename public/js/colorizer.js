class Colorizer {

    static #decimalHash(str) {
        let sum = 0;
        for (let i = 0; i < str.length; i++)
            sum += (i + 1) * str.codePointAt(i) / (1 << 8)
        return sum % 1;
    }

    static #stringToColorCode(str) {
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }

        var color = "#";
        for (var j = 0; j < 3; j++) {
            var value = (hash >> (j * 8)) & 0xff;
            color += ("00" + value.toString(16)).substr(-2);
        }
        const hue = 360 * Colorizer.#decimalHash(str);
        return `hsla(${hue}, 60%,  72%, 0.8)`;
        return color;
    }

    static #applyBackgroundColor(element) {
        var textContent = element.textContent;
        var colorCode = Colorizer.#stringToColorCode(textContent);
        element.style.backgroundColor = colorCode;
    }

    static #traverseAndApplyBackgroundColor(node) {
        if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('colored')) {
            Colorizer.#applyBackgroundColor(node);
        }

        var childNodes = node.childNodes;
        for (var i = 0; i < childNodes.length; i++) {
            var childNode = childNodes[i];
            Colorizer.#traverseAndApplyBackgroundColor(childNode);
        }
    }

    static observeDOMChanges() {
        var targetNode = document.body;
        var config = { childList: true, subtree: true };

        var observer = new MutationObserver(function(mutationsList, observer) {
            for (var i = 0; i < mutationsList.length; i++) {
                var mutation = mutationsList[i];
                if (mutation.type === 'childList') {
                    var addedNodes = mutation.addedNodes;
                    for (var j = 0; j < addedNodes.length; j++) {
                        var addedNode = addedNodes[j];
                        Colorizer.#traverseAndApplyBackgroundColor(addedNode);
                    }
                }
            }
        });

        observer.observe(targetNode, config);
    }
}

