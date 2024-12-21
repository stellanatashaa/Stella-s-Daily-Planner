
const addTaskButton = document.getElementById("add-task-btn");
const taskList = document.getElementById("task-list");
const monthYear = document.getElementById("month-year");
const calendarDates = document.getElementById("calendar-dates");
const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next");
const eventsList = document.getElementById("events-list");
const glassesContainer = document.getElementById("glasses-container");
const weatherInfo = document.getElementById("weather-info");
const cityInput = document.getElementById("city-input");
const getWeatherBtn = document.getElementById("get-weather-btn");

const API_KEY = "b0772a732f070407cfb5d14caf0ccfc2"; // API
const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

let currentDate = new Date();
const events = {}; // save event based from date

// task list
function createDeleteButton() {
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete-task-btn";
    deleteBtn.addEventListener("click", function () {
        this.parentElement.remove();
    });
    return deleteBtn;
}

addTaskButton.addEventListener("click", () => {
    const newTask = prompt("Enter a new task:");
    if (newTask) {
        const newTaskItem = document.createElement("li");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";

        newTaskItem.appendChild(checkbox);
        newTaskItem.appendChild(document.createTextNode(` ${newTask}`));
        const deleteBtn = createDeleteButton();
        newTaskItem.appendChild(deleteBtn);

        taskList.appendChild(newTaskItem);
    } else {
        alert("Task cannot be empty!");
    }
});

// calendar
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    monthYear.textContent = `${months[month]} ${year}`;
    calendarDates.innerHTML = "";

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const prevLastDate = new Date(year, month, 0).getDate();

    // prev month
    for (let i = firstDay; i > 0; i--) {
        const div = document.createElement("div");
        div.textContent = prevLastDate - i + 1;
        div.classList.add("inactive");
        calendarDates.appendChild(div);
    }

    // current month
    for (let i = 1; i <= lastDate; i++) {
        const div = document.createElement("div");
        div.textContent = i;
        div.addEventListener("click", () => handleDateClick(i, month, year));
        calendarDates.appendChild(div);

        if (i === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()) {
            div.classList.add("today");
        }

        if (events[`${year}-${month}-${i}`]) {
            div.style.backgroundColor = "#f06595";
            div.style.color = "white";
        }
    }

    // next month
    const totalCells = calendarDates.childElementCount;
    const remainingCells = 42 - totalCells;
    for (let i = 1; i <= remainingCells; i++) {
        const div = document.createElement("div");
        div.textContent = i;
        div.classList.add("inactive");
        calendarDates.appendChild(div);
    }
}

function handleDateClick(day, month, year) {
    const eventDate = `${year}-${month + 1}-${day}`;
    const eventText = prompt(`Add an event for ${months[month]} ${day}, ${year}:`);

    if (eventText) {
        if (!events[eventDate]) events[eventDate] = [];
        events[eventDate].push(eventText);

        updateEventsList();
        renderCalendar();
    }
}

function updateEventsList() {
    eventsList.innerHTML = "";
    for (const [date, eventTexts] of Object.entries(events)) {
        eventTexts.forEach(eventText => {
            const listItem = document.createElement("li");
            listItem.textContent = `${date}: ${eventText}`;
            eventsList.appendChild(listItem);
        });
    }
}

prevButton.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

nextButton.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

// water tracker

function renderWaterTracker(totalGlasses = 8) {
    glassesContainer.innerHTML = "";
    for (let i = 0; i < totalGlasses; i++) {
        const glass = document.createElement("div");
        glass.classList.add("glass");
        const water = document.createElement("div");
        water.classList.add("water");
        glass.appendChild(water);

        glass.addEventListener("click", () => {
            glass.classList.toggle("filled");
        });

        glassesContainer.appendChild(glass);
    }
}
renderWaterTracker();

// weather widget
    async function getWeather(city) {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    
        try {
            const response = await fetch(url);
            const data = await response.json();
    
            if (data.cod === 200) {
                const weather = data.weather[0];
                const temp = data.main.temp;
                const cityName = data.name;
                const icon = `https://openweathermap.org/img/wn/${weather.icon}.png`;
    
                weatherInfo.innerHTML = `
                    <h3>${cityName}</h3>
                    <img src="${icon}" alt="Weather Icon">
                    <p>${temp}°C - ${weather.description}</p>
                `;
            } else {
                weatherInfo.innerHTML = `<p>City not found. Try again.</p>`;
            }
        } catch (error) {
            weatherInfo.innerHTML = `<p>Error fetching weather data. Please try again.</p>`;
        }
    }
    

getWeatherBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (city) {
        weatherInfo.innerHTML = "<p>Loading weather...</p>";
        getWeather(city);
    } else {
        weatherInfo.innerHTML = "<p>Please enter a city name.</p>";
    }
});

// geolocation for weather
async function getWeatherByLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;

            try {
                const response = await fetch(url);
                const data = await response.json();
                const weather = data.weather[0];
                const temp = data.main.temp;
                const cityName = data.name;
                const icon = `https://openweathermap.org/img/wn/${weather.icon}.png`;

                weatherInfo.innerHTML = `
                    <h3>${cityName}</h3>
                    <img src="${icon}" alt="Weather Icon">
                    <p>${temp}°C - ${weather.description}</p>
                `;
            } catch (error) {
                weatherInfo.innerHTML = `<p>Unable to fetch location weather.</p>`;
            }
        });
    } else {
        weatherInfo.innerHTML = `<p>Geolocation not supported.</p>`;
    }
}

getWeatherByLocation();

// render
renderCalendar();
        // eyes
        const pupils = document.querySelectorAll(".pupil");
        document.addEventListener("mousemove", (e) => {
            const mouseX = e.clientX;
            const mouseY = e.clientY;

            pupils.forEach(pupil => {
                const rect = pupil.parentElement.getBoundingClientRect();
                const eyeX = rect.left + rect.width / 2;
                const eyeY = rect.top + rect.height / 2;

                const deltaX = mouseX - eyeX;
                const deltaY = mouseY - eyeY;
                const angle = Math.atan2(deltaY, deltaX);
                const distance = Math.min(10, Math.hypot(deltaX, deltaY) / 10);

                pupil.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;
            });
        });

//screeshoot 
document.getElementById('save-btn').addEventListener('click', function () {
    const titleSection = document.querySelector('.title-section');
    titleSection.style.display = 'none'; //hide title

    domtoimage.toPng(document.body)
        .then(function (dataUrl) {
            var link = document.createElement('a');
            link.download = 'screenshot.png';
            link.href = dataUrl;
            link.click(); 

            
            titleSection.style.display = '';//show title after ss
        })
        .catch(function (error) {
            console.error('Screenshot failed:', error);
          
            titleSection.style.display = '';
        });
});

//snake game
let game; 
let gameStarted = false; 

// show game container
function showGame() {
    const gameContainer = document.getElementById('game-container');
    gameContainer.style.display = 'block';
}

function hideGame() {
    const gameContainer = document.getElementById('game-container');
    gameContainer.style.display = 'none'; 
    stopSnakeGame(); 
}

function startSnakeGame() {
    if (gameStarted) return; 

    const canvas = document.getElementById('snake-game');
    const ctx = canvas.getContext('2d');
    const box = 20; 
    let snake = [{ x: 9 * box, y: 10 * box }]; 
    let food = {
        x: Math.floor(Math.random() * 20) * box,
        y: Math.floor(Math.random() * 20) * box,
    };
    let direction = 'RIGHT';

    document.addEventListener('keydown', (event) => {
        // prevent page scroll when pressing arrow keys
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            event.preventDefault();
        }

        if (event.key === 'ArrowLeft' && direction !== 'RIGHT') direction = 'LEFT';
        if (event.key === 'ArrowUp' && direction !== 'DOWN') direction = 'UP';
        if (event.key === 'ArrowRight' && direction !== 'LEFT') direction = 'RIGHT';
        if (event.key === 'ArrowDown' && direction !== 'UP') direction = 'DOWN';
    });

    function collision(head, array) {
        return array.some((segment) => head.x === segment.x && head.y === segment.y);
    }

    function draw() {
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < snake.length; i++) {
            ctx.fillStyle = i === 0 ? '#dd91ab' : '#c9708b'; 
            ctx.fillRect(snake[i].x, snake[i].y, box, box);
        }

        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(food.x, food.y, box, box);

        let snakeX = snake[0].x;
        let snakeY = snake[0].y;

        if (direction === 'LEFT') snakeX -= box;
        if (direction === 'UP') snakeY -= box;
        if (direction === 'RIGHT') snakeX += box;
        if (direction === 'DOWN') snakeY += box;

        if (snakeX === food.x && snakeY === food.y) {
            food = {
                x: Math.floor(Math.random() * 20) * box,
                y: Math.floor(Math.random() * 20) * box,
            };
        } else {
            snake.pop(); 
        }

        const newHead = { x: snakeX, y: snakeY };
        if (
            snakeX < 0 ||
            snakeY < 0 ||
            snakeX >= canvas.width ||
            snakeY >= canvas.height ||
            collision(newHead, snake)
        ) {
            clearInterval(game); 
            alert('Game Over!');
            stopSnakeGame(); 
            return;
        }

        snake.unshift(newHead); 
    }

    gameStarted = true;
    game = setInterval(draw, 100); 
}


function stopSnakeGame() {
    if (game) {
        clearInterval(game); 
        game = null; 
    }
    gameStarted = false;
}

document.getElementById('start-game').addEventListener('click', () => {
    startSnakeGame();
});

document.getElementById('exit-game').addEventListener('click', () => {
    hideGame();
});

function toggleTheme() {
    document.body.classList.toggle('light-mode');
}