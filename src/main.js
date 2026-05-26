import './styles.css';
import * as d3 from 'd3';
import Scatterplot from './visualizations/Scatterplot.js';



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
const dataSet = await d3.csv('/data/smartphone_usage_addiction.csv', row => {
  return {
    ...row,
    age: +row.age,
    daily_screen_time_hours: +row.daily_screen_time_hours,
    social_media_hours: +row.social_media_hours,
    gaming_hours: +row.gaming_hours,
    work_study_hours: +row.work_study_hours,
    sleep_hours: +row.sleep_hours,
    notifications_per_day: +row.notifications_per_day,
    app_opens_per_day: +row.app_opens_per_day,
    weekend_screen_time: +row.weekend_screen_time,
  }
});

console.log(dataSet);

const scatterplot = new Scatterplot(dataSet, {
  parentElement: '.chart-placeholder',
  xAxisLabel: 'Sleep (h)',
  yAxisLabel: 'Screen time (h)',
  dataAccessor: {
    x: 'sleep_hours',
    y: 'daily_screen_time_hours',
  },
});
scatterplot.updateViz();


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