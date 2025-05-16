 // ---- COUNTDOWN TO 10PM & PROGRESS BAR ----
  function updateCountdown() {
      const now = new Date();
      const targetTime = new Date(now);
      // Set target time to 10PM UTC+3:30 (6:30 PM UTC)
      targetTime.setUTCHours(18, 30, 0, 0);
      if (now > targetTime) targetTime.setDate(targetTime.getDate() + 1);
      const timeDifference = targetTime - now;

      if (timeDifference <= 0) {
          document.getElementById("countdown").innerText = "It's 10 PM (UTC +3:30)!";
          document.title = "It's 10 PM!";
          document.getElementById('countdown-bar').style.width = "0%";
      } else {
          const hoursLeft = Math.floor(timeDifference / (1000 * 60 * 60));
          const minutesLeft = Math.floor((timeDifference / (1000 * 60)) % 60);
          const secondsLeft = Math.floor((timeDifference / 1000) % 60);
          const countdownText = `${hoursLeft} hours, ${minutesLeft} minutes, and ${secondsLeft} seconds left until 10 PM (UTC +3:30).`;
          document.getElementById("countdown").innerText = countdownText;
          document.title = `${hoursLeft}h ${minutesLeft}m ${secondsLeft}s until 10 PM`;

          // Progress bar calculation (from last 10PM to next 10PM)
          const prevTarget = new Date(targetTime);
          prevTarget.setDate(targetTime.getDate() - 1);
          const totalSeconds = (targetTime - prevTarget) / 1000; // Always 24h = 86400s
          const secondsPassed = (now - prevTarget) / 1000;
          const percentLeft = Math.max(0, Math.min(100, 100 - (secondsPassed / totalSeconds) * 100));
          document.getElementById('countdown-bar').style.width = percentLeft + "%";
      }
  }
  setInterval(updateCountdown, 1000);
  updateCountdown();

  // ---- COUNTDOWN TO NEAREST 6PM ON ODD SUNDAY/TUESDAY/THURSDAY + PROGRESS ----
  function updateOddDayCountdown() {
      const now = new Date();
      let targetTime = new Date(now);
      const currentDay = now.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
      const isOddDay = (currentDay === 0 || currentDay === 2 || currentDay === 4); // Sun, Tue, Thu

      // Find the next odd Sunday, Tuesday, or Thursday at 6 PM
      if (isOddDay) {
          targetTime.setHours(18, 0, 0, 0);
          if (now > targetTime) {
              // Already past 6PM, move to the next valid odd day
              do {
                  targetTime.setDate(targetTime.getDate() + 1);
              } while (![0,2,4].includes(targetTime.getDay()));
              targetTime.setHours(18, 0, 0, 0);
          }
      } else {
          // Find the next Sunday, Tuesday, or Thursday
          do {
              targetTime.setDate(targetTime.getDate() + 1);
          } while (![0,2,4].includes(targetTime.getDay()));
          targetTime.setHours(18, 0, 0, 0);
      }

      const timeDifference = targetTime - now;
      if (timeDifference <= 0) {
          document.getElementById("odd-day-countdown").innerText = "It's 6 PM!";
          document.getElementById('odd-day-bar').style.width = "0%";
      } else {
          const hoursLeft = Math.floor(timeDifference / (1000 * 60 * 60));
          const minutesLeft = Math.floor((timeDifference / (1000 * 60)) % 60);
          const secondsLeft = Math.floor((timeDifference / 1000) % 60);

          const countdownText = `${hoursLeft} hours, ${minutesLeft} minutes, and ${secondsLeft} seconds left until the nearest 6 PM on an odd Sunday, Tuesday, or Thursday.`;
          document.getElementById("odd-day-countdown").innerText = countdownText;

          // Progress bar (from last such day 6PM to next 6PM)
          const prevOdd = new Date(targetTime);
          do {
              prevOdd.setDate(prevOdd.getDate() - 1);
          } while (![0,2,4].includes(prevOdd.getDay()));
          prevOdd.setHours(18, 0, 0, 0);
          const totalSeconds = (targetTime - prevOdd) / 1000;
          const secondsPassed = (now - prevOdd) / 1000;
          const percentLeft = Math.max(0, Math.min(100, 100 - (secondsPassed / totalSeconds) * 100));
          document.getElementById('odd-day-bar').style.width = percentLeft + "%";
      }
  }
  setInterval(updateOddDayCountdown, 1000);
  updateOddDayCountdown();

  // ---- DAILY QUOTE FROM BIBLE API ----
  async function getBibleVerse() {
      try {
          const response = await fetch('https://labs.bible.org/api/?passage=random&type=json');
          const data = await response.json();
          const verse = data[0];
          document.getElementById('daily-quote').innerHTML =
              `"${verse.text.trim()}" <br><b>${verse.bookname} ${verse.chapter}:${verse.verse}</b>`;
      } catch (e) {
          document.getElementById('daily-quote').innerText = "Couldn't fetch verse right now.";
      }
  }
  window.addEventListener('DOMContentLoaded', getBibleVerse);

  // ---- TO-DO LIST PERSISTENCE ----
  function saveTasks() {
      const tasks = [];
      document.querySelectorAll('#task-list li').forEach(li => {
          const taskText = li.querySelector('span:nth-child(1)').innerText;
          const taskTime = li.querySelector('span:nth-child(2)').innerText;
          tasks.push({ taskText, taskTime });
      });
      localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  function loadTasks() {
      const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
      const taskList = document.getElementById("task-list");
      taskList.innerHTML = '';
      tasks.forEach(({ taskText, taskTime }) => {
          const li = document.createElement("li");
          li.innerHTML = `<span>${taskText}</span> - <span>${taskTime}</span>
                          <button onclick="deleteTask(this)" class="delete-btn">Delete</button>`;
          taskList.appendChild(li);
      });
  }
  window.addEventListener("DOMContentLoaded", loadTasks);

  function addTask() {
      const taskInput = document.getElementById("task");
      const taskText = taskInput.value.trim();
      const taskStartTime = document.getElementById("task-start-time").value;
      const taskEndTime = document.getElementById("task-end-time").value;

      if (taskText !== "" && taskStartTime !== "" && taskEndTime !== "") {
          const taskList = document.getElementById("task-list");
          const li = document.createElement("li");
          li.innerHTML = `<span>${taskText}</span> - <span>${taskStartTime} to ${taskEndTime}</span>
                          <button onclick="deleteTask(this)" class="delete-btn">Delete</button>`;
          taskList.appendChild(li);

          taskInput.value = "";
          document.getElementById("task-start-time").value = "";
          document.getElementById("task-end-time").value = "";

          saveTasks();
      }
  }

  document.getElementById("task").addEventListener('keydown', function(e){
      if(e.key === "Enter") addTask();
  });

  function deleteTask(button) {
      const taskList = document.getElementById("task-list");
      const listItem = button.parentNode;
      taskList.removeChild(listItem);
      saveTasks();
  }

  function deleteAll() {
      const taskList = document.getElementById("task-list");
      while (taskList.firstChild) {
          taskList.removeChild(taskList.firstChild);
      }
      saveTasks();
  }

  // ---- EXPORT TASKS TO CSV ----
  function exportTasks() {
      const tasks = [];
      document.querySelectorAll('#task-list li').forEach(li => {
          const taskText = li.querySelector('span:nth-child(1)').innerText;
          const taskTime = li.querySelector('span:nth-child(2)').innerText;
          tasks.push([taskText, taskTime]);
      });
      let csvContent = "data:text/csv;charset=utf-8,Task,Time\n" + tasks.map(e => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "tasks.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  }
