const notyf = new Notyf();

document.addEventListener("DOMContentLoaded", function() {
    Colorizer.observeDOMChanges();
});

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

