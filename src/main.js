import './styles.css';
import * as d3 from 'd3';
import Scatterplot from './visualizations/Scatterplot.js';

// document.querySelector('#app').innerHTML = `
//   <main class="app-shell">
//     <h1>You Might Be Addicted Without Even Knowing It</h1>
//     <p>Project setup complete. Narrative, components, and D3 charts will be implemented in later steps.</p>
//   </main>
// `;

history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

const phone = document.querySelector('#phone');
const startStoryLink = document.querySelector('#start-story');
const sideContent = document.querySelector('#side-content');
const chat = document.querySelector('#chat');
const scrollHint = document.querySelector('.scroll-hint');
const scrollStep = document.querySelector('#scroll-step');

let storyStarted = false;
let nextScrollMessageIndex = 0;

const messageScrollStart = 280;
const messageScrollStep = 320;
const scrollStepBaseHeight = 260;

const scrollTriggeredMessages = [
  {
    text: 'Yep. Most people lose several hours per week without even noticing.',
    type: 'other',
  },
  {
    text: 'That makes every minute count even more.',
    type: 'user',
  },
  {
    text: 'Let\'s keep going and compare these numbers with average usage.',
    type: 'other',
  },
  {
    text: 'A few more insights should make the story clearer.',
    type: 'other',
  },
  {
    text: 'This is the kind of data that makes people stop and think.',
    type: 'user',
  },
];

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
  };
});

console.log(dataSet);

const scatterplot = new Scatterplot(dataSet, {
  parentElement: '.chart-placeholder',
  width: 500,
  height: 360,
  xAxisLabel: 'Sleep (h)',
  yAxisLabel: 'Screen time (h)',
  dataAccessor: {
    x: 'sleep_hours',
    y: 'daily_screen_time_hours',
  },
});

scatterplot.updateViz();

function getScrollThreshold(index) {
  return messageScrollStart + index * messageScrollStep;
}

function updateScrollSpacer() {
  if (!scrollStep) return;

  scrollStep.style.minHeight = `${Math.max(
    scrollStepBaseHeight + scrollTriggeredMessages.length * messageScrollStep,
    window.innerHeight
  )}px`;
}

function registerScrollTriggeredMessage(text, type = 'other') {
  scrollTriggeredMessages.push({ text, type });
  updateScrollSpacer();
}

startStoryLink.addEventListener('click', event => {
  event.preventDefault();

  if (storyStarted) return;

  window.scrollTo(0, 0);

  storyStarted = true;

  document.body.classList.add('story-started');
  phone.classList.add('is-left');
  sideContent.classList.add('is-visible');
  scrollHint.classList.add('visible');

  setTimeout(() => {
    appendChatMessage(
      'I had no idea it was this much until I saw the graph.',
      'user'
    );
  }, 700);

  updateScrollSpacer();
});

window.addEventListener('scroll', () => {
  if (!storyStarted) return;

  const scrollY = window.scrollY;
  const atTop = scrollY <= 20;

  while (
    nextScrollMessageIndex > 0 &&
    scrollY <= getScrollThreshold(nextScrollMessageIndex - 1)
  ) {
    nextScrollMessageIndex -= 1;
    const id = `scroll-message-${nextScrollMessageIndex + 1}`;
    removeChatMessageById(id);
  }

  while (
    nextScrollMessageIndex < scrollTriggeredMessages.length &&
    scrollY > getScrollThreshold(nextScrollMessageIndex)
  ) {
    const { text, type } = scrollTriggeredMessages[nextScrollMessageIndex];
    const id = `scroll-message-${nextScrollMessageIndex + 1}`;

    appendChatMessage(text, type, id);
    nextScrollMessageIndex += 1;
  }

  if (atTop) {
    scrollHint.classList.add('visible');
  } else {
    scrollHint.classList.remove('visible');
  }
});

function appendChatMessage(text, type = 'other', id = undefined) {
  if (id && document.querySelector(`#${id}`)) return;

  const message = document.createElement('div');

  message.classList.add('message', type, 'entering');

  if (id) {
    message.id = id;
  }

  message.textContent = text;
  chat.appendChild(message);

  requestAnimationFrame(() => {
    message.classList.remove('entering');
    chat.scrollTop = chat.scrollHeight;
  });
}

function removeChatMessageById(id) {
  const message = document.querySelector(`#${id}`);

  if (!message) return;

  message.classList.add('exiting');

  message.addEventListener(
    'transitionend',
    () => {
      message.remove();
    },
    { once: true }
  );
}