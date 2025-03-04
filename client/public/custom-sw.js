self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  console.log("Push received...", data);

  self.registration.showNotification(data.title, {
    body: data.message,
    icon: "/assets/logo.svg",
  });
});
console.log("Service worker loaded");