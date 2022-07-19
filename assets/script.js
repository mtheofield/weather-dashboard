var searchedCity = document.getElementById('searchedCity');
var citySearched = document.getElementById('city-searched');
let searchHistory = [];


var formSubmitHandler = (event) => {
    event.preventDefault();
    let citiesName = searchedCity.value.trim();
    if (citiesName) {
        queryWeatherData(citiesName);
        citiesName.value = '';
    } else {
        alert('Enter a city name');
    }
    citySearched.reset();
};

function queryWeatherData(citiesName) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${citiesName}&units=imperial&appid=8bc0c59529456976b25bd3e2e58f2ccd`)
    .then(response => {
        return response.json();
    })
    .then(cityData => {
        if (cityData.message === "please enter a city") {
            return;
        };
        saveSearchHistory(citiesName);

        var lat = cityData.coord.lat
        var lon = cityData.coord.lon
        var weatherIcon = cityData.weather[0].icon
        var weatherTypeIcon = document.getElementById('weatherTypeIcon');
        
        weatherTypeIcon.setAttribute('src', `https://openweathermap.org/img/wn/${weatherIcon}@2x.png`)

        fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=minutely,hourly,alerts&appid=8bc0c59529456976b25bd3e2e58f2ccd`)
        .then(weatherData => {
            return weatherData.json();
        })
        .then(weatherData => {
            fiveDayforecast(weatherData)
            var date = new Date(weatherData.current.dt * 1000);
            var currentDate = Intl.DateTimeFormat().format(date);

            var UVI = Math.round(weatherData.current.uvi);

            if (UVI < 3) {
                document.getElementById('UVI').classList.remove("moderateUVI", "highUVI", "severeUVI");
                document.getElementById('UVI').classList.add("favorableUVI");
            } else if (UVI >=3 && UVI < 7) {
                document.getElementById('UVI').classList.remove("favorableUVI", "highUVI", "severeUVI");
                document.getElementById('UVI').classList.add("moderateUVI");
            } else if (UVI >=7 && UVI <= 10) {
                document.getElementById('UVI').classList.remove("favorableUVI", "moderateUVI", "severeUVI");
                document.getElementById('UVI').classList.add("highUVI");
            } else {
                document.getElementById('UVI').classList.remove("favorableUVI", "moderateUVI", "highUVI");
                document.getElementById('UVI').classList.add("severeUVI");
            }

            document.getElementById('searchedCityName').innerHTML = '' + citiesName + currentDate + '';
            document.getElementById('humidity').innerHTML = 'Humidity: ' + weatherData.current.humidity + '%';
            document.getElementById('wind').innerHTML = 'Wind: ' + weatherData.current.wind_speed + ' MPH';
            document.getElementById('temperature').innerHTML = 'Temperature: ' + Math.round(weatherData.current.temp) + '°F';
            document.getElementById('UVI').innerHTML = 'UV Index: ' + weatherData.current.uvi;

            getSearchHistory();
        })
    });
};
function getSearchHistory() {
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

    $('#searchHistoryBtns').empty();
    if (searchHistory.length > 0) {
        for(let i = 0; i < searchHistory.length; i++) {
            let historyCity = $('<button>').attr('class', 'btn btn-secondary searchHistoryBtns').text(searchHistory[i]);
            $('#searchHistoryBtns').append(historyCity);
        }
    }
};
getSearchHistory();


function saveSearchHistory(citiesName) {
    searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

    if (!searchHistory.includes(citiesName)) {
        searchHistory.push(citiesName);
    }

    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
};


citySearched.addEventListener('submit', formSubmitHandler);


$(document).on('click', '.searchHistoryBtns', function(onClick) {
    onClick.preventDefault();
    this.value = '';
    var  displayClickedCity = this.textContent;
    queryWeatherData(displayClickedCity);
});
function fiveDayforecast(forecast) {
    $('#fiveDayContainer').empty();
    for (let i = 0; i < 5; i++) {
        displayDailyforecast(forecast.daily[i]);
    }
};

function displayDailyforecast(fiveDayData) {
    var date = Intl.DateTimeFormat('en-US').format(new Date(fiveDayData.dt * 1000));
    var weatherTypeIcon = fiveDayData.weather[0].icon;
    var Temperature = fiveDayData.temp.day;
    var Humidity = fiveDayData.humidity;
    var Wind = fiveDayData.wind_speed;

    var dailyCard = `
        <div class="column col s12 m6">
            <div class="card">
                <ul class="list-group list-group-flush">
                    <h4 class="list-group-item date">${date}</h4>
                    <img class="list-group-item weather-icon" src="https://openweathermap.org/img/wn/${weatherTypeIcon}@2x.png" alt="weather icon">
                    <li class="list-group-item temp">Temperature: ${Math.round(Temperature)}°F </li>
                    <li class="list-group-item wind">Wind Speed: ${Wind} MPH</li>
                    <li class="list-group-item humidity">Humidity: ${Humidity}% </li>
                </ul>
            </div>
        </div>
    `;

    $('#fiveDayContainer').append(dailyCard);
};
