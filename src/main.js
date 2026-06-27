import './styles.css';
import * as d3 from 'd3';
import BarChart from './visualizations/BarChart.js';
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
const chartKicker = document.querySelector('#chart-kicker');
const chartCaption = document.querySelector('#chart-caption');
const insightTitle = document.querySelector('#insight-title');
const insightCopy = document.querySelector('#insight-copy');
const compareForm = document.querySelector('#compare-form');
const reflectionTitle = document.querySelector('#reflection-title');
const reflectionCopy = document.querySelector('#reflection-copy');
const endingChartContainer = document.querySelector('#ending-chart');
const endingSection = document.querySelector('#ending-section');
const comparisonList = document.querySelector('#comparison-list');

let storyStarted = false;
let nextScrollMessageIndex = 0;
let activeSceneIndex = 0;
let currentChart = null;
let userProfile = getUserProfileFromInputs();
let endingChart = null;

const messageScrollStart = 360;
const messageScrollStep = 560;
const scrollStepBaseHeight = 260;

const storyScenes = [
  {
    kicker: 'First signal',
    title: 'Your phone is probably taking more time than you think.',
    copy: 'Screen time often feels harmless in the moment, but the numbers tell a clearer story. A few short checks can turn into hours across the day.',
    caption: 'Each dot is one person. The chart compares sleep hours with daily screen time.',
    chart: {
      type: 'scatter',
      startAtZero: true,
      xAxisLabel: 'Sleep (h)',
      yAxisLabel: 'Screen time (h)',
      dataAccessor: {
        x: 'sleep_hours',
        y: 'daily_screen_time_hours',
      },
    },
  },
  {
    kicker: 'Attention loop',
    title: 'Notifications can pull you back before you even decide to open the phone.',
    copy: 'When notification counts rise, app opens often rise with them. That repeated checking pattern is one of the clearest signs of attention being interrupted.',
    caption: 'Each dot is one person. This shows whether people with more notifications also open apps more often.',
    chart: {
      type: 'scatter',
      startAtZero: true,
      xAxisLabel: 'Notifications per day',
      yAxisLabel: 'App opens per day',
      dataAccessor: {
        x: 'notifications_per_day',
        y: 'app_opens_per_day',
      },
    },
  },
  {
    kicker: 'Risk groups',
    title: 'Average screen time climbs when the addiction label becomes more serious.',
    copy: 'A bar chart is clearer here because addiction level is categorical. Instead of plotting every person, we compare the average screen time of each group.',
    caption: 'Groups are addiction labels from the dataset. Each bar shows the average daily screen time for that group.',
    chart: {
      type: 'bar',
      groupBy: 'addiction_level',
      value: 'daily_screen_time_hours',
      aggregate: 'mean',
      xAxisLabel: 'Avg screen time (h)',
      sortOrder: ['None', 'Mild', 'Moderate', 'Severe'],
    },
  },
  {
    kicker: 'Stress signal',
    title: 'Stress is easier to compare as groups than as a cloud of points.',
    copy: 'For stress levels, a grouped average keeps the chart readable. The question becomes simple: which stress group receives more notification pressure?',
    caption: 'Groups are stress levels from the dataset. Each bar shows average notifications per day.',
    chart: {
      type: 'bar',
      groupBy: 'stress_level',
      value: 'notifications_per_day',
      aggregate: 'mean',
      xAxisLabel: 'Avg notifications per day',
      sortOrder: ['Low', 'Medium', 'High'],
    },
  },
  {
    kicker: 'Weekend drift',
    title: 'Weekends can quietly stretch daily usage even further.',
    copy: 'Weekend screen time gives the story a different rhythm. It shows how usage changes when the structure of a normal day loosens.',
    caption: 'Each dot is one person. The chart compares regular daily screen time with weekend screen time.',
    chart: {
      type: 'scatter',
      startAtZero: true,
      xAxisLabel: 'Daily screen time (h)',
      yAxisLabel: 'Weekend screen time (h)',
      dataAccessor: {
        x: 'daily_screen_time_hours',
        y: 'weekend_screen_time',
      },
    },
  },
  {
    kicker: 'Final warning',
    title: 'The goal is not panic. It is noticing the pattern early enough to change it.',
    copy: 'Awareness starts when the habit becomes measurable. Once the pattern is visible, it becomes easier to question what the phone is taking from the day.',
    caption: 'Each dot is one person. This checks whether more gaming time appears alongside less sleep.',
    chart: {
      type: 'scatter',
      startAtZero: true,
      xAxisLabel: 'Gaming (h)',
      yAxisLabel: 'Sleep (h)',
      dataAccessor: {
        x: 'gaming_hours',
        y: 'sleep_hours',
      },
    },
  },
];

const scrollTriggeredMessages = [
  {
    text: 'It is not only the total time. It is how often the phone pulls you back.',
    type: 'other',
  },
  {
    text: 'So the checks themselves matter, not just the hours?',
    type: 'user',
  },
  {
    text: 'Exactly. Let’s compare notifications with how often apps get opened.',
    type: 'other',
    sceneIndex: 1,
  },
  {
    text: 'That looks like a habit loop: notification, open, repeat.',
    type: 'user',
  },
  {
    text: 'But for addiction levels, a scatterplot is not the clearest choice.',
    type: 'other',
  },
  {
    text: 'Since those are categories, we should compare groups instead.',
    type: 'other',
    sceneIndex: 2,
  },
  {
    text: 'The average makes the pattern easier to read.',
    type: 'user',
  },
  {
    text: 'Stress is another category, so we keep the grouped comparison.',
    type: 'other',
    sceneIndex: 3,
  },
  {
    text: 'High stress plus constant notifications sounds exhausting.',
    type: 'user',
  },
  {
    text: 'Now let’s switch back to a relationship chart for weekday vs weekend behavior.',
    type: 'other',
    sceneIndex: 4,
  },
  {
    text: 'Weekends are where the extra time can hide.',
    type: 'other',
  },
  {
    text: 'And the final question is what gets traded away when usage keeps growing.',
    type: 'other',
    sceneIndex: 5,
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

updateScene(0);
renderEndingComparison(false);

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

  updateEndingState();

  while (
    nextScrollMessageIndex > 0 &&
    scrollY <= getScrollThreshold(nextScrollMessageIndex - 1)
  ) {
    nextScrollMessageIndex -= 1;
    const id = `scroll-message-${nextScrollMessageIndex + 1}`;
    removeChatMessageById(id);
    updateScene(getSceneIndexForMessageCount(nextScrollMessageIndex));
  }

  while (
    nextScrollMessageIndex < scrollTriggeredMessages.length &&
    scrollY > getScrollThreshold(nextScrollMessageIndex)
  ) {
    const { text, type } = scrollTriggeredMessages[nextScrollMessageIndex];
    const id = `scroll-message-${nextScrollMessageIndex + 1}`;

    appendChatMessage(text, type, id);
    nextScrollMessageIndex += 1;
    updateScene(getSceneIndexForMessageCount(nextScrollMessageIndex));
  }

  if (atTop) {
    scrollHint.classList.add('visible');
  } else {
    scrollHint.classList.remove('visible');
  }
});

window.addEventListener('resize', updateEndingState);

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

function updateEndingState() {
  const endingTop = endingSection.getBoundingClientRect().top;
  const endingIsActive = endingTop < window.innerHeight * 0.72;

  document.body.classList.toggle('ending-active', endingIsActive);
}

function updateScene(sceneIndex) {
  const boundedIndex = Math.max(0, Math.min(sceneIndex, storyScenes.length - 1));

  if (boundedIndex === activeSceneIndex && currentChart) {
    return;
  }

  activeSceneIndex = boundedIndex;

  const scene = storyScenes[activeSceneIndex];

  chartKicker.textContent = scene.kicker;
  chartCaption.textContent = scene.caption;
  insightTitle.textContent = scene.title;
  insightCopy.textContent = scene.copy;

  renderChart(scene.chart);
}

function getSceneIndexForMessageCount(messageCount) {
  return scrollTriggeredMessages
    .slice(0, messageCount)
    .reduce((sceneIndex, message) => message.sceneIndex ?? sceneIndex, 0);
}

function renderChart(chartConfig) {
  const chartContainer = document.querySelector('.chart-placeholder');
  chartContainer.replaceChildren();

  if (chartConfig.type === 'bar') {
    currentChart = new BarChart(createGroupedChartData(chartConfig), {
      parentElement: '.chart-placeholder',
      width: 680,
      height: 390,
      xAxisLabel: chartConfig.xAxisLabel,
    });
  } else {
    currentChart = new Scatterplot(dataSet, {
      parentElement: '.chart-placeholder',
      width: 680,
      height: 390,
      pointRadius: 4.5,
      startAtZero: chartConfig.startAtZero,
      xAxisLabel: chartConfig.xAxisLabel,
      yAxisLabel: chartConfig.yAxisLabel,
      dataAccessor: chartConfig.dataAccessor,
    });
  }

  currentChart.updateViz();
}

function createGroupedChartData(chartConfig) {
  const groupedData = d3.rollups(
    dataSet.filter(row => Number.isFinite(row[chartConfig.value])),
    rows => d3.mean(rows, row => row[chartConfig.value]),
    row => row[chartConfig.groupBy] || 'Unknown'
  ).map(([label, value]) => ({ label, value }));

  if (!chartConfig.sortOrder) {
    return groupedData.sort((a, b) => d3.descending(a.value, b.value));
  }

  return groupedData.sort((a, b) => {
    const aIndex = chartConfig.sortOrder.indexOf(a.label);
    const bIndex = chartConfig.sortOrder.indexOf(b.label);

    return (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) -
      (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex);
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

compareForm.addEventListener('submit', event => {
  event.preventDefault();

  userProfile = getUserProfileFromInputs();
  renderEndingComparison(true);

  appendChatMessage(
    `That ${userProfile.daily_screen_time_hours.toFixed(1)}h number hits different when you compare it.`,
    'user',
    'user-comparison-message'
  );
});

function getUserProfileFromInputs() {
  return {
    daily_screen_time_hours: getInputNumber('input-screen-time'),
    sleep_hours: getInputNumber('input-sleep'),
    notifications_per_day: getInputNumber('input-notifications'),
    app_opens_per_day: getInputNumber('input-app-opens'),
  };
}

function getInputNumber(id) {
  const value = Number(document.querySelector(`#${id}`).value);
  return Number.isFinite(value) ? value : 0;
}

function renderEndingComparison(hasUserInput) {
  endingChartContainer.replaceChildren();

  endingChart = new Scatterplot(dataSet, {
    parentElement: '#ending-chart',
    width: 620,
    height: 350,
    pointRadius: 3.8,
    startAtZero: true,
    xAxisLabel: 'Sleep (h)',
    yAxisLabel: 'Screen time (h)',
    dataAccessor: {
      x: 'sleep_hours',
      y: 'daily_screen_time_hours',
    },
    comparisonPoint: hasUserInput
      ? {
          x: userProfile.sleep_hours,
          y: userProfile.daily_screen_time_hours,
          label: 'You',
        }
      : null,
  });

  endingChart.updateViz();
  updateReflection(hasUserInput);
}

function updateReflection(hasUserInput) {
  const dailyScreenTime = userProfile.daily_screen_time_hours;
  const weeklyHours = dailyScreenTime * 7;
  const monthlyHours = dailyScreenTime * 30;
  const reclaimedWeek = Math.min(dailyScreenTime, 1) * 7;
  const averageScreenTime = d3.mean(dataSet, d => d.daily_screen_time_hours);
  const averageSleep = d3.mean(dataSet, d => d.sleep_hours);
  const metrics = [
    {
      label: 'Screen time',
      value: dailyScreenTime,
      unit: 'h/day',
      percentile: getPercentile(dataSet, dailyScreenTime, d => d.daily_screen_time_hours),
      highText: 'more screen time',
      lowText: 'less screen time',
    },
    {
      label: 'Sleep',
      value: userProfile.sleep_hours,
      unit: 'h/night',
      percentile: getPercentile(dataSet, userProfile.sleep_hours, d => d.sleep_hours),
      highText: 'more sleep',
      lowText: 'less sleep',
    },
    {
      label: 'Notifications',
      value: userProfile.notifications_per_day,
      unit: '/day',
      percentile: getPercentile(dataSet, userProfile.notifications_per_day, d => d.notifications_per_day),
      highText: 'more notifications',
      lowText: 'fewer notifications',
    },
    {
      label: 'App opens',
      value: userProfile.app_opens_per_day,
      unit: '/day',
      percentile: getPercentile(dataSet, userProfile.app_opens_per_day, d => d.app_opens_per_day),
      highText: 'more app opens',
      lowText: 'fewer app opens',
    },
  ];

  if (!hasUserInput) {
    reflectionTitle.textContent = `The dataset average is ${averageScreenTime.toFixed(1)} hours of screen time a day.`;
    reflectionCopy.textContent = `Average sleep is ${averageSleep.toFixed(1)} hours. Add your numbers to see whether your own pattern sits above or below the crowd.`;
    comparisonList.replaceChildren();
    return;
  }

  reflectionTitle.textContent = getPrimaryResult(metrics[0]);
  reflectionCopy.textContent = `That becomes ${weeklyHours.toFixed(1)} hours each week and about ${Math.round(monthlyHours)} hours each month. Cutting just one hour a day gives back ${reclaimedWeek.toFixed(0)} hours every week.`;
  renderComparisonList(metrics);
}

function getPercentile(data, value, accessor) {
  const validValues = data
    .map(accessor)
    .filter(Number.isFinite);

  if (validValues.length === 0) return 0;

  const belowOrEqual = validValues.filter(d => d <= value).length;
  return Math.round((belowOrEqual / validValues.length) * 100);
}

function renderComparisonList(metrics) {
  comparisonList.replaceChildren();

  metrics.forEach(metric => {
    const item = document.createElement('div');
    item.className = 'comparison-item';

    const term = document.createElement('dt');
    term.textContent = metric.label;

    const description = document.createElement('dd');
    description.textContent = getMetricSentence(metric);

    item.append(term, description);
    comparisonList.append(item);
  });
}

function formatMetricValue(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function getPrimaryResult(metric) {
  if (metric.percentile >= 50) {
    return `You spend more time on your phone than about ${metric.percentile}% of this dataset.`;
  }

  return `Your screen time is lower than about ${100 - metric.percentile}% of this dataset.`;
}

function getMetricSentence(metric) {
  const formattedValue = `${formatMetricValue(metric.value)} ${metric.unit}`;

  if (metric.percentile >= 50) {
    return `${formattedValue} means ${metric.highText} than about ${metric.percentile}% of users.`;
  }

  return `${formattedValue} means ${metric.lowText} than about ${100 - metric.percentile}% of users.`;
}
