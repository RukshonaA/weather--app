const input = document.querySelector('.input');
const block = document.querySelector('.block');
const forecastBox = document.querySelector('.forecast');
const apiKey = '9bab81fbda15bc2fa6edeb80f24b4639';

navigator.geolocation.getCurrentPosition(success, error);

function success(pos) {
  getWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
  showMap(pos.coords.latitude, pos.coords.longitude);
}

function error() {
  block.innerHTML = "<p>Joylashuv aniqlanmadi.</p>";
}

function searchInput(event) {
  if (event.key === "Enter") search();
}

async function search() {
  const city = input.value.trim();
  if (!city) return alert("Iltimos, shahar nomini kiriting!");

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=uz`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=uz`;

  try {
    const [weatherRes, forecastRes] = await Promise.all([
      fetch(url),
      fetch(forecastUrl)
    ]);
    if (!weatherRes.ok || !forecastRes.ok) return alert("Shahar topilmadi!");

    const weatherData = await weatherRes.json();
    const forecastData = await forecastRes.json();

    showWeather(weatherData);
    showForecast(forecastData.list);
    showMap(weatherData.coord.lat, weatherData.coord.lon);
  } catch (err) {
    
  }
}

function getWeatherByCoords(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=uz`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=uz`;

  Promise.all([fetch(url), fetch(forecastUrl)])
    .then(async ([res1, res2]) => {
      if (!res1.ok || !res2.ok) {
        block.innerHTML = "<p>Ob-havo ma'lumotlari olinmadi.</p>";
        return;
      }
      const data1 = await res1.json();
      const data2 = await res2.json();
      showWeather(data1);
      showForecast(data2.list);
    });
}

function showWeather(data) {
  block.innerHTML = `
    <h2>${data.name}, ${data.sys.country}</h2>
    <p>Harorat: ${data.main.temp} ℃</p>
    <p>Holat: ${data.weather[0].description}</p>
    <p>Namlik: ${data.main.humidity}%</p>
    <p>Shamol: ${data.wind.speed} m/s</p>
  `;
}

function showForecast(list) {
  const days = {};
  list.forEach(item => {
    const date = item.dt_txt.split(" ")[0];
    if (!days[date] && item.dt_txt.includes("12:00:00")) {
      days[date] = item;
    }
  });

  const fiveDays = Object.values(days).slice(0, 5);
  forecastBox.innerHTML = fiveDays.map(item => `
    <div class="card">
      <p><strong>${item.dt_txt.split(" ")[0]}</strong></p>
      <p>${item.main.temp} ℃</p>
      <p>${item.weather[0].description}</p>
    </div>
  `).join('');
}

function startVoice() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'uz-UZ';
  recognition.start();
  recognition.onresult = function (event) {
    input.value = event.results[0][0].transcript;
    search();
  };
}

function showMap(lat, lon) {
  if (window.map) {
    map.setView([lat, lon], 10);

    if (window.marker) {
      map.removeLayer(window.marker);
    }
    window.marker = L.marker([lat, lon]).addTo(map);
    return;
  }

  window.map = L.map('map').setView([lat, lon], 10);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
  }).addTo(map);

  window.marker = L.marker([lat, lon]).addTo(map);
}

function toggleMode() {
  document.body.classList.toggle("dark");
  const btn = document.querySelector('.mode-toggle');
  btn.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
}
