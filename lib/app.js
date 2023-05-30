//Alpine.plugin(PineconeRouter);
//Alpine.start();

const notyf = new Notyf();

async function login() {
    const name = document.getElementsByName("name")[0].value;
    const pass = document.getElementsByName("password")[0].value;

    try {
        const authData = await pb.collection('users').authWithPassword(name, pass);

        if (pb.authStore.isValid) {
            notyf.success("Welcome!");
            Alpine.store("session", true);
            location.reload();
        }
    }catch(e) {
        notyf.error("Login failed.");
        return;
    }
}

function logout() {
    pb.authStore.clear();
    location.reload();
}

function openNav() {
    document.getElementsByTagName("nav")[0].style.width = "250px";
    document.getElementsByTagName("main")[0].style.marginLeft = "250px";
}

function closeNav() {
    document.getElementsByTagName("nav")[0].style.width = "0";
    document.getElementsByTagName("main")[0].style.marginLeft = "0";
}

async function loadCollectionAsync(collection, query = {}) {
    query.sort = '-created';

    try {
        const records = await pb.collection(collection).getFullList(query);
        return records;
    } catch (e) {
        notyf.error("Ruh roh! Something went wrong. That's not good...");
        console.log(e)
        return [];
    }
}

async function loadRecordAsync(collection, id) {
    try {
        const record = await pb.collection(collection).getOne(id);
        return record;
    } catch (e) {
        notyf.error("Ruh roh! Something went wrong. That's not good...");
        console.log(e)
    }
}

async function updateRecordAsync(collection, model) {
    try {
        const record = await pb.collection(collection).update(model.id, model);
        PineconeRouter.currentContext.redirect(`/${collection}`)
    } catch (e) {
        notyf.error("Ruh roh! Something went wrong. That's not good...");
        console.log(e)
    }
}

async function createRecordAsync(collection, model) {
    try {
        const record = await pb.collection(collection).create(model);
        PineconeRouter.currentContext.redirect(`/${collection}`)
    } catch (e) {
        notyf.error("Ruh roh! Something went wrong. That's not good...");
        console.log(e)
    }
}

async function updateGuestsFromHouseholdAsync(model) {
    const members = Array.from(document.getElementsByName("members")).filter(x => x.checked);

    for(var i=0; i<members.length; i++) {
        await updateRecordAsync('guests', {id: members[i].value, household: model.id})
    }
}

function updateGuestModel(model) {
    const arrival = document.getElementsByName('arrival')[0].value;
    const departure = document.getElementsByName('departure')[0].value;

    model.arrival = arrival ? `${arrival} 00:00:00Z` : '';
    model.departure = departure ? `${departure} 00:00:00Z` : '';
    return model;
}

const decimalHash = string => {
    let sum = 0;
    for (let i = 0; i < string.length; i++)
        sum += (i + 1) * string.codePointAt(i) / (1 << 8)
    return sum % 1;
}


function stringToColorCode(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    var color = "#";
    for (var j = 0; j < 3; j++) {
        var value = (hash >> (j * 8)) & 0xff;
        color += ("00" + value.toString(16)).substr(-2);
    }
    const hue = 360 * decimalHash(str);
    return `hsla(${hue}, 60%,  72%, 0.8)`;
    return color;
}

function applyBackgroundColor(element) {
    var textContent = element.textContent;
    var colorCode = stringToColorCode(textContent);
    element.style.backgroundColor = colorCode;
}

function traverseAndApplyBackgroundColor(node) {
    if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('colored')) {
        applyBackgroundColor(node);
    }

    var childNodes = node.childNodes;
    for (var i = 0; i < childNodes.length; i++) {
        var childNode = childNodes[i];
        traverseAndApplyBackgroundColor(childNode);
    }
}

function observeDOMChanges() {
    var targetNode = document.body;
    var config = { childList: true, subtree: true };

    var observer = new MutationObserver(function(mutationsList, observer) {
        for (var i = 0; i < mutationsList.length; i++) {
            var mutation = mutationsList[i];
            if (mutation.type === 'childList') {
                var addedNodes = mutation.addedNodes;
                for (var j = 0; j < addedNodes.length; j++) {
                    var addedNode = addedNodes[j];
                    traverseAndApplyBackgroundColor(addedNode);
                }
            }
        }
    });

    observer.observe(targetNode, config);
}

document.addEventListener("DOMContentLoaded", function() {
    observeDOMChanges();
});


