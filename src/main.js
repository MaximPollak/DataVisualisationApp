import './styles.css';

// document.querySelector('#app').innerHTML = `
//   <main class="app-shell">
//     <h1>You Might Be Addicted Without Even Knowing It</h1>
//     <p>Project setup complete. Narrative, components, and D3 charts will be implemented in later steps.</p>
//   </main>
// `;

const phone = document.querySelector("#phone");
const startStoryLink = document.querySelector("#start-story");
const sideContent = document.querySelector("#side-content");
const chat = document.querySelector("#chat");

startStoryLink.addEventListener("click", (event) => {
  event.preventDefault();

  phone.classList.add("is-left");
  sideContent.classList.add("is-visible");

  // setTimeout(() => {
  //   addMessage("user", "Yep. That number is not a typo.");
  // }, 1000);
});

function addMessage(type, text) {
  const message = document.createElement("div");

  message.classList.add("message", type);
  message.textContent = text;

  chat.appendChild(message);
}