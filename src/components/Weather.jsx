
import React, { useEffect, useState, useRef } from 'react';
import './Weather.css';
import search_icon from '../assets/search.png';
import clear_icon from '../assets/clear.png';
import cloud_icon from '../assets/cloud.png';
import humidity_icon from '../assets/humidity.png';
import rain_icon from '../assets/rain.png';
import snow_icon from '../assets/snow.png';
import wind_icon from '../assets/wind.png';
import drizzle_icon from '../assets/drizzle.png';
import pressure_icon from '../assets/pressure.png'; // You'll need to add this asset

const Weather = () => {
  const inputRef = useRef();
  const [weatherData, setWeatherData] = useState(false);
  const [forecastData, setForecastData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('current');
  const [units, setUnits] = useState('metric'); // metric or imperial

  const allIcons = {
    "01d": clear_icon,
    "01n": clear_icon,
    "02d": cloud_icon,
    "02n": cloud_icon,
    "03d": cloud_icon,
    "03n": cloud_icon,
    "04d": drizzle_icon,
    "04n": drizzle_icon,
    "09d": rain_icon,
    "09n": rain_icon,
    "10d": rain_icon,
    "10n": rain_icon,
    "13d": snow_icon,
    "13n": snow_icon,
  };

  const search = async (city) => {
    if (!city || city.trim() === "") {
      alert("Please enter a valid city name");
      return;
    }

    setIsLoading(true);
    
    try {
      const encodedCity = encodeURIComponent(city.trim());
      
      // Fetch current weather
      const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodedCity}&units=${units}&appid=${import.meta.env.VITE_APP_ID}`;
      const weatherResponse = await fetch(currentWeatherUrl);
      const weatherData = await weatherResponse.json();
      
      if (!weatherResponse.ok) {
        throw new Error(weatherData.message || 'Failed to fetch weather data');
      }
      
      const icon = allIcons[weatherData.weather[0].icon] || clear_icon;
      
      setWeatherData({
        humidity: weatherData.main.humidity,
        windSpeed: weatherData.wind.speed,
        temperature: Math.floor(weatherData.main.temp),
        feelsLike: Math.floor(weatherData.main.feels_like),
        description: weatherData.weather[0].description,
        pressure: weatherData.main.pressure,
        location: weatherData.name,
        country: weatherData.sys.country,
        sunset: new Date(weatherData.sys.sunset * 1000).toLocaleTimeString(),
        sunrise: new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString(),
        icon: icon
      });
      
      // Fetch forecast data
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodedCity}&units=${units}&appid=${import.meta.env.VITE_APP_ID}`;
      const forecastResponse = await fetch(forecastUrl);
      const forecastData = await forecastResponse.json();
      
      if (!forecastResponse.ok) {
        throw new Error(forecastData.message || 'Failed to fetch forecast data');
      }
      
      // Process forecast data to get one entry per day
      const dailyForecasts = processForecastData(forecastData.list);
      setForecastData(dailyForecasts);
      
    } catch (error) {
      console.error(error);
      alert(`Error: ${error.message}`);
      setWeatherData(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Process forecast data to get one entry per day
  const processForecastData = (forecastList) => {
    const dailyData = {};
    
    forecastList.forEach(item => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      
      if (!dailyData[date] || new Date(item.dt * 1000).getHours() === 12) {
        dailyData[date] = {
          date: date,
          day: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
          temp: Math.floor(item.main.temp),
          description: item.weather[0].description,
          icon: allIcons[item.weather[0].icon] || clear_icon,
          humidity: item.main.humidity,
          windSpeed: item.wind.speed
        };
      }
    });
    
    return Object.values(dailyData);
  };

  // Toggle between metric and imperial units
  const toggleUnits = () => {
    setUnits(prevUnits => {
      const newUnits = prevUnits === 'metric' ? 'imperial' : 'metric';
      if (weatherData) {
        search(weatherData.location);
      }
      return newUnits;
    });
  };

  useEffect(() => {
    search("Pune");
  }, []);

  const getUnitSymbol = (unitType) => {
    return unitType === 'metric' ? '°C' : '°F';
  };

  const getWindSpeedUnit = (unitType) => {
    return unitType === 'metric' ? 'm/s' : 'mph';
  };

  return (
    <div className='weather-app'>
      <h1 className='app-title'>WeatherWise</h1>
      <p className='app-subtitle'>Your personal weather companion</p>
      
      <div className="search-bar">
        <input 
          ref={inputRef} 
          type="text" 
          placeholder="Search city..." 
          onKeyPress={(e) => e.key === 'Enter' && search(inputRef.current.value)}
        />
        <img src={search_icon} alt="Search" onClick={() => search(inputRef.current.value)} />
      </div>
      
      <div className="units-toggle">
        <button 
          className={`unit-btn ${units === 'metric' ? 'active' : ''}`} 
          onClick={toggleUnits}
        >
          °C
        </button>
        <span className="unit-separator">|</span>
        <button 
          className={`unit-btn ${units === 'imperial' ? 'active' : ''}`} 
          onClick={toggleUnits}
        >
          °F
        </button>
      </div>
      
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'current' ? 'active' : ''}`}
          onClick={() => setActiveTab('current')}
        >
          Current
        </button>
        <button 
          className={`tab ${activeTab === 'forecast' ? 'active' : ''}`}
          onClick={() => setActiveTab('forecast')}
        >
          5-Day Forecast
        </button>
      </div>
      
      {isLoading && (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading weather data...</p>
        </div>
      )}
      
      {!isLoading && weatherData && activeTab === 'current' && (
        <div className="current-weather">
          <div className="weather-header">
            <h2>{weatherData.location}, {weatherData.country}</h2>
            <p className="weather-description">{weatherData.description}</p>
          </div>
          
          <div className="weather-body">
            <img src={weatherData.icon} alt={weatherData.description} className='weather-icon' />
            <div className="temperature-container">
              <p className='temperature'>{weatherData.temperature}{getUnitSymbol(units)}</p>
              <p className='feels-like'>Feels like: {weatherData.feelsLike}{getUnitSymbol(units)}</p>
            </div>
          </div>
          
          <div className='weather-details'>
            <div className='detail-col'>
              <img src={humidity_icon} alt="Humidity" />
              <div>
                <p>{weatherData.humidity}%</p>
                <span>Humidity</span>
              </div>
            </div>
            <div className='detail-col'>
              <img src={wind_icon} alt="Wind" />
              <div>
                <p>{weatherData.windSpeed} {getWindSpeedUnit(units)}</p>
                <span>Wind Speed</span>
              </div>
            </div>
            <div className='detail-col'>
              <img src={pressure_icon} alt="Pressure" />
              <div>
                <p>{weatherData.pressure} hPa</p>
                <span>Pressure</span>
              </div>
            </div>
          </div>
          
          <div className="sun-times">
            <div className="sun-time">
              <span>Sunrise</span>
              <p>{weatherData.sunrise}</p>
            </div>
            <div className="sun-time">
              <span>Sunset</span>
              <p>{weatherData.sunset}</p>
            </div>
          </div>
        </div>
      )}
      
      {!isLoading && forecastData.length > 0 && activeTab === 'forecast' && (
        <div className="forecast">
          <h2>5-Day Forecast</h2>
          <div className="forecast-container">
            {forecastData.map((day, index) => (
              <div key={index} className="forecast-day">
                <h3>{day.day}</h3>
                <p className="forecast-date">{day.date}</p>
                <img src={day.icon} alt={day.description} className="forecast-icon" />
                <p className="forecast-temp">{day.temp}{getUnitSymbol(units)}</p>
                <p className="forecast-desc">{day.description}</p>
                <div className="forecast-details">
                  <div className="forecast-detail">
                    <span>Hum:</span>
                    <p>{day.humidity}%</p>
                  </div>
                  <div className="forecast-detail">
                    <span>Wind:</span>
                    <p>{day.windSpeed} {getWindSpeedUnit(units)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Weather;