const apiKey = 'eddb6f6ee4d3940f8c25b9141b0307fe'; // Replace with your actual OpenWeather API key
let temperatureChart; // Global variable to store the chart instance
const defaultCity = "London";
const temperatureData = []; // To store temperature data for the graph
const labels = []; // To store dates for the graph
// Example weather conditions
// Replace with your OpenWeatherMap API key
const searchBtn = document.getElementById('searchBtn');
const citySearch = document.getElementById('citySearch');
const cityName = document.getElementById('cityName');
const tempElement = document.getElementById('temp');
const conditionElement = document.getElementById('condition');
const windElement = document.getElementById('wind');
const humidityElement = document.getElementById('humidity');
const weatherDisplay = document.getElementById('weather-display');

// Function to get weather data
async function getWeatherData(city) {
  const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
  const data = await response.json();
  return data;
}
async function displayWeather() {
  const city = citySearch.value;
  if (city) {
    const weatherData = await getWeatherData(city);
    const weatherCondition = weatherData.weather[0].main;
    const temperature = weatherData.main.temp;
    const weatherDescription = weatherData.weather[0].description;
    const windSpeed = weatherData.wind.speed;
    const humidity = weatherData.main.humidity;

    // Update the HTML content
    cityName.innerHTML = city;
    tempElement.innerHTML = `${temperature}°C`;
    conditionElement.innerHTML = `${weatherDescription}`;
    windElement.innerHTML = `${windSpeed} km/h | Wind`;
    humidityElement.innerHTML = `${humidity}% | Humidity`;

  }
}

// Add event listener to search button
searchBtn.addEventListener('click', displayWeather);


getWeather(defaultCity);
function getWeather(city) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('City not found');
      }
      return response.json();
    })
    .then(data => {
      displayCurrentWeather(data); // Display current weather data
      getForecast(city); // Then get the forecast
    })
    .catch(error => {
      console.error('Error fetching weather data:', error);
      alert(error.message);
    });
}

function getForecast(city) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;

  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('City not found');
      }
      return response.json();
    })
    .then(data => {
      processForecastData(data);
    })
    .catch(error => {
      console.error('Error fetching forecast data:', error);
      alert(error.message);
    });
}


function displayCurrentWeather(data) {
  // Update the HTML elements with current weather data
  document.getElementById('cityName').innerText = data.name; // Display city name
  document.getElementById('temp').innerText = ` ${data.main.temp.toFixed(1)}°C`; // Display temperature
  document.getElementById('condition').innerText = `${data.weather[0].description}`; // Display condition
  document.getElementById('wind').innerText = ` ${data.wind.speed} km/h  |  Wind`; // Display wind speed
  document.getElementById('humidity').innerText = `${data.main.humidity}%  |  Humidity`; // Display humidity
}

function processForecastData(data) {
  const dailyForecast = {};

  // Clear previous data
  temperatureData.length = 0;
  labels.length = 0;

  // Process the 3-hour data
  data.list.forEach(item => {
    const date = new Date(item.dt * 1000).toDateString(); // Get the date

    // Store data for the graph
    if (!labels.includes(date)) {
      labels.push(date); // Add date to labels if not already included
      temperatureData.push(item.main.temp); // Push the temperature for the graph
    }

    if (!dailyForecast[date]) {
      dailyForecast[date] = {
        maxTemp: item.main.temp,
        minTemp: item.main.temp,
        weatherConditions: [item.weather[0].description]
      };
    } else {
      dailyForecast[date].maxTemp = Math.max(dailyForecast[date].maxTemp, item.main.temp);
      dailyForecast[date].minTemp = Math.min(dailyForecast[date].minTemp, item.main.temp);
      dailyForecast[date].weatherConditions.push(item.weather[0].description);
    }
  });

  displayDailyForecast(dailyForecast);
  displayTemperatureGraph(); // Call to display the graph
}


function displayDailyForecast(dailyForecast) {
  const forecastCards = document.getElementById('forecast-cards');
  forecastCards.innerHTML = ''; // Clear previous data

  // Loop through the daily forecast and create HTML elements
  for (const date in dailyForecast) {
    const card = document.createElement('div');
    card.classList.add('forecast-card');

    // Use the first condition as representative
    const representativeCondition = dailyForecast[date].weatherConditions[0];

    card.innerHTML = `
      <p>${date}</p>
      <p>Max: ${dailyForecast[date].maxTemp.toFixed(1)}°C</p>
      <p>Min: ${dailyForecast[date].minTemp.toFixed(1)}°C</p>
      <p>Condition: ${representativeCondition}</p>
    `;
    forecastCards.appendChild(card);
  }
}

// Function to display the temperature graph
function displayTemperatureGraph() {
  const ctx = document.getElementById('temperatureChart').getContext('2d');

  // Check if the chart instance exists and destroy it
  if (temperatureChart) {
    temperatureChart.destroy();
  }

  // Create a new chart
  temperatureChart = new Chart(ctx, {
    type: 'line', // Type of chart
    data: {
      labels: labels, // Dates for the x-axis
      datasets: [{
        label: 'Temperature (°C)',
        data: temperatureData, // Temperature data for the y-axis
        borderColor: '#FF5733', // Bright red color for the line
        backgroundColor: 'rgba(255, 87, 51, 0.2)', // Light red color for the fill
        borderWidth: 2, // Thicker line for better visibility
        pointBackgroundColor: '#FF5733', // Color for the points
        pointBorderColor: '#fff', // White border for the points
        pointHoverBackgroundColor: '#fff', // White background on hover
        pointHoverBorderColor: '#FF5733', // Red border on hover
        tension: 0.4, // Smooth curve effect for the line
        fill: true, // Fill the area under the line
      }]
    },
    options: {
      responsive: true, // Make the chart responsive
      maintainAspectRatio: false, // Disable maintaining aspect ratio
      scales: {
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: 'Temperature (°C)',
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          grid: {
            color: '#e0e0e0', // Light grey grid lines
            lineWidth: 1,
          },
        },
        x: {
          title: {
            display: true,
            text: 'Date',
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          grid: {
            color: '#e0e0e0', // Light grey grid lines
            lineWidth: 1,
          },
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            font: {
              size: 14,
              weight: 'bold',
            },
            color: '#333', // Color of legend text
          }
        },
        tooltip: {
          backgroundColor: '#fff', // Background color of the tooltip
          titleColor: '#333', // Title color in tooltip
          bodyColor: '#333', // Body color in tooltip
          borderColor: '#FF5733', // Border color of tooltip
          borderWidth: 1,
        }
      }
    }
  });
}

// Event listener for the search button
document.getElementById('searchBtn').addEventListener('click', () => {
  const city = document.getElementById('citySearch').value;
  if (city) {
    getWeather(city); // Changed to call getWeather to fetch current weather
  } else {
    alert('Please enter a city name');
  }
});
// Listen for the Enter key press on the city input field
citySearch.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
      const city = citySearch.value.trim();
      if (city) {
          getWeather(city); // Call the function to fetch weather data
          citySearch.value = ''; // Clear the input field
      }
  }
});



// Theme toggle functionality
document.querySelector('.theme-toggle').addEventListener('click', () => {
  document.body.classList.toggle('dark'); // Toggle dark class on body
  const navbar = document.querySelector('.navbar');
  const searchBar = document.querySelector('.search-bar');
  const forecastCards = document.querySelectorAll('.forecast-card');

  // Toggle dark classes on navbar and search bar
  navbar.classList.toggle('dark');
  searchBar.classList.toggle('dark');

  // Toggle dark classes on forecast cards
  forecastCards.forEach(card => {
    card.classList.toggle('dark');
  });

  // Toggle icons visibility
  const sunIcon = document.getElementById('sun-icon');
  const moonIcon = document.getElementById('moon-icon');
  sunIcon.style.display = sunIcon.style.display === 'none' ? 'inline' : 'none'; // Show/hide sun icon
  moonIcon.style.display = moonIcon.style.display === 'none' ? 'inline' : 'none'; // Show/hide moon icon
});


document.getElementById('searchBtn').addEventListener('click', () => {
  const city = document.getElementById('cityInput').value;
  getWeather(city);
});



//map
let map;

function showMap(lat, lon) {
  if (!map) {
    map = L.map('map').setView([lat, lon], 13);
  } else {
    map.setView([lat, lon], 13);
  }

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  L.marker([lat, lon]).addTo(map);
}

function displayCurrentWeather(data) {
  // Weather data update
  document.getElementById('cityName').innerText = data.name;
  document.getElementById('temp').innerText = ` ${data.main.temp.toFixed(1)}°`;
  document.getElementById('condition').innerText = ` ${data.weather[0].description}`;

  // Display map based on coordinates
  showMap(data.coord.lat, data.coord.lon);
}

const forecastCards = document.getElementById('forecast-cards');

// Function to move the forecast cards based on mouse position
document.addEventListener('mousemove', (event) => {
    const width = window.innerWidth;
    const mouseX = event.clientX;

    // Calculate the percentage of mouse position relative to the screen width
    const percentage = (mouseX / width) * 100;

    // Determine the shift amount
    const shiftAmount = (percentage - 10) * 0.5; // Adjust the multiplier for speed
    forecastCards.style.transform = `translateX(${shiftAmount}px)`;
});

// Optional: Reset position on mouse leave
document.querySelector('.weather-container').addEventListener('mouseleave', () => {
    forecastCards.style.transform = `translateX(0px)`;
});


//recent Search city
async function displayWeather() {
  const city = citySearch.value;
  if (city) {
    const weatherData = await getWeatherData(city);
    
    // Check if the response contains valid data
    if (weatherData && weatherData.main) {
      const weatherCondition = weatherData.weather[0].main;
      const temperature = weatherData.main.temp;
      const weatherDescription = weatherData.weather[0].description;
      const windSpeed = weatherData.wind.speed;
      const humidity = weatherData.main.humidity;

      // Update the HTML content
      cityName.innerHTML = city;
      tempElement.innerHTML = `${temperature}°C`;
      conditionElement.innerHTML = `${weatherDescription}`;
      windElement.innerHTML = `${windSpeed} km/h | Wind`;
      humidityElement.innerHTML = `${humidity}% | Humidity`;

      // Prepare weather data for recent searches
      const weatherInfo = {
        city: city,
        temp: temperature.toFixed(1),
        weather: weatherDescription,
        icon: weatherData.weather[0].icon
      };

      // Add to recent searches
      addToRecentSearches(weatherInfo);
    } else {
      alert("Unable to retrieve weather data for the specified city.");
    }
  }
}

const recentSearchList = document.getElementById('recentSearchList');

const maxRecentSearches = 4; // Max number of recent searches to store

// Load recent searches from localStorage on page load
document.addEventListener('DOMContentLoaded', () => {
    const recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
    displayRecentSearches(recentSearches);
});

// Add search city to recent searches
// searchBtn.addEventListener('click', () => {
//     const city = cityInput.value.trim();
//     if (city) {
//         getWeather(city);
//         cityInput.value = ''; // Clear input field
//     }
// });
// Listen for the Enter key press on the recent search input field


// Add weather data to recent searches and store it in localStorage
function addToRecentSearches(weatherData) {
    let recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];

    // If the city is already in recent searches, remove it
    recentSearches = recentSearches.filter(search => search.city.toLowerCase() !== weatherData.city.toLowerCase());

    // Add the new city weather data to the beginning of the list
    recentSearches.unshift(weatherData);

    // Limit the number of recent searches to the max limit
    if (recentSearches.length > maxRecentSearches) {
        recentSearches.pop();
    }

    // Save updated searches in localStorage
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));

    // Display updated search list
    displayRecentSearches(recentSearches);
}

// Display the recent searches in the list with weather details
function displayRecentSearches(searches) {
    recentSearchList.innerHTML = '';
    searches.forEach(search => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div><strong>${search.city}</strong></div>
            <div class="weather-details">${search.temp}°C, ${search.weather}</div>
            <img src="https://openweathermap.org/img/wn/${search.icon}@2x.png" alt="weather icon">
        `;
        recentSearchList.appendChild(li);
    });
}
// Function to get background image based on city name
function getBackgroundImage(city) {
  switch (city.toLowerCase()) {
      case 'paris':
          return 'url(city-images/paris.jpg)'; // Replace with actual path to Paris image
      case 'london':
          return 'url(city-images/london.jpg)'; // Replace with actual path to London image
      case 'new york':
          return 'url(city-images/new-york.jpg)'; // Replace with actual path to New York image
      case 'tokyo':
          return 'url(city-images/tokyo.jpeg)'; // Replace with actual path to Tokyo image
      case 'sydney':
          return 'url(city-images/sydney.jpg)'; // Replace with actual path to Sydney image
      case 'africa':
          return 'url(city-images/africa.jpg)';
      case 'dubai':
          return 'url(city-images/dubai.jpeg)';
      case 'delhi':
          return 'url(city-images/delhi.jpeg)';
      case 'mumbai':
          return 'url(city-images/mumbai.jpg)';
      case 'rio':
          return 'url(city-images/rio.jpg)';
      case 'ahmedabad':
          return 'url(city-images/ahme.jpg)';
      default:
          return 'url(city-images/default-bg.jpg)'; // Fallback image if city not found
  }
}

// Display the recent searches in the list with weather details
function displayRecentSearches(searches) {
  recentSearchList.innerHTML = '';
  searches.forEach(search => {
      const li = document.createElement('li');

      // Get the background image for the city
      const bgImage = getBackgroundImage(search.city);
      
      // Apply the background image to the li element
      li.style.backgroundImage = bgImage;
      li.style.backgroundSize = 'cover'; // Cover the entire li element
      li.style.backgroundPosition = 'center'; // Center the image

      li.innerHTML = `
          <div><strong>${search.city}</strong></div>
          <div class="weather-details">${search.temp}°C, ${search.weather}</div>
          <img src="https://openweathermap.org/img/wn/${search.icon}@2x.png" alt="weather icon">
      `;
      recentSearchList.appendChild(li);
  });

}


