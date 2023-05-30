const pb = new PocketBase("https://pb.knanet.de");

document.addEventListener('alpine:init', () => {
    if (pb.authStore.isValid) {
        Alpine.store("session", true);
        Alpine.store("router", "home");
    }
});

document.addEventListener('alpine:initialized', () => {
});
