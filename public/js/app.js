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
    query.sort = query.sort ? query.sort : '-created';

    try {
        const records = await pb.collection(collection).getFullList(query);
        return records;
    } catch (e) {
        notyf.error("Ruh roh! Something went wrong. That's not good...");
        console.log(e)
        return [];
    }
}

async function loadAccommodation() {
  var acc = await loadCollectionAsync('accommodation', {sort: 'name'});
  const guests = await loadCollectionAsync('guests', {sort: '-accomodation', filter: "accomodation != null", expand: "accommodation"});

  acc.forEach(a => {
    var idx = 0;
    a.guests = new Array(a.slots).fill({name: "EMPTY"})
    guests.forEach(g => {
      if (a.id == g.accomodation) {
        a.guests[idx] = g
        idx ++
      }
    });
  });

  return acc
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

function alphanumerical(prop, flip) {
    if (flip) return (a,b) => (a[prop] > b[prop] ? -1 : a[prop] < b[prop] ? 1 : 0);
    return (a,b) => (a[prop] < b[prop] ? -1 : a[prop] > b[prop] ? 1 : 0);
}

async function printHouseholdsAsync() {
    const rows = await loadCollectionAsync("households", {sort: "name"});
    const csvContent = "Address,Country\n" + rows.map(e => `"${e.address}","${e.origin}"`).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "addresses.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function applyFilter(a, token) {
    token = token.toLowerCase();

    if (Array.isArray(a)) {
        return a.filter((item) => applyFilter(item, token));
    }

    if (typeof(a) === 'object') {
        for(pname in a) {
            const prop = a[pname];
            if (typeof(prop) === 'string') {
                if (prop.toLowerCase().includes(token)) return true;
            } 

            if (typeof(prop) === 'object') {
                if(applyFilter(prop, token)) return true;
            } 

            if (Array.isArray(prop)) {
                if (applyFilter(prop, token).length > 0) return true;
            }
        }

        return false;
    }

    return undefined;
}

function filterItems(items, token) {
    if (token === '') return items;
    if (items.length < 1) return [];

    return applyFilter(items, token);
}
