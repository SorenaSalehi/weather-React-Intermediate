import { useEffect, useState } from "react";
import Navbar from "./component/navbar/Navbar";
import Section from "./component/section/Section";
import Footer from "./component/footer/Footer";
import DailyWeather from "./component/footer/DailyWeather";
const KEY = "a8d00e8852085aa1237b5d745e484172";

export default function Main() {
  const [coords, setCoords] = useState({ lat: null, lon: null });
  const [cityName, setCityName] = useState({city:'',state:'',country:''});
  const [weather, setWeather] = useState("");
  const [query, setQuery] = useState("");
  const [SearchedCity, setSearchedCity] = useState({});
  const { newLat, newLon } = SearchedCity;
  console.log(SearchedCity);
  const [sun, setSun] = useState({ sunrise: "", sunset: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { lat, lon } = coords;
  const { state, city, country } = cityName;
  const { sunrise, sunset } = sun;
  const Temperature = weather && weather.list[0].main.temp;
  const { description, icon } = weather && weather.list[0].weather[0];
  // console.log("city name:", cityName);
  // console.log("weather:", weather);
  // console.log("sun:", sun);
  // console.log('temp:',Temperature)
  // console.log(description,icon)

  //current position on mount
  useEffect(function () {
    async function currentPosition() {
      navigator.geolocation.getCurrentPosition(
        function success(position) {
          const pos = position.coords;
          // console.log("current position:", pos);
          setCoords({ lat: pos.latitude, lon: pos.longitude });
        },
        function error(err) {}
      );
    }
    currentPosition();
  }, []);

  //fetch weather based on coords
  useEffect(
    function () {
      async function fetchWeather() {
        try {
          if (!lat || !lon) return;
          const res = await fetch(
            `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${KEY}`
          );
          if (!res) throw new Error(res.message);
          const data = await res.json();
          // console.log(data);
          if (data) {
            setWeather(data);
            setSun({
              sunrise: handleConversionUTC(data.city.sunrise),
              sunset: handleConversionUTC(data.city.sunset),
            });
          }
        } catch (err) {
          console.error(err);
          setError(err.message);
        }
      }
      fetchWeather();
    },
    [lat, lon]
  );

  //fetch city details based on coords
  //rest country api
  useEffect(
    function () {
      async function fetchCityName() {
        setIsLoading(true);
        if (!lat || !lon) return;
        const res = await fetch(
          `https://us1.locationiq.com/v1/reverse?key=pk.d91f88ff4d19bf8dada031715a6889ab&lat=${lat}&lon=${lon}&format=json&`
        );
        const data = await res.json();

        if (data) {
          // console.log("city details", data);
          setCityName({
            state: data.address.state?.split(" ")[0],
            city: data.address.city?.split(" ")[0],
            country: data.address.country,
          });
        }
        setIsLoading(false);
      }
      fetchCityName();
    },
    [lat, lon]
  );

  //get coords by Address open weather api
  useEffect(
    function () {
      const controller = new AbortController();
      const signal = controller.signal;

      async function getCoordsByAddress() {
        try {
          if (!query || query.length < 4) return;
          const res = await fetch(
            `http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${KEY}`,
            { signal }
          );
          const data = await res.json();
          if (data) {
            if (data) {
              // console.log("query:", data);
              setSearchedCity({ newLat: data[0].lat, newLon: data[0].lon });
            }
          }
        } catch (err) {
          if (err.name === "AbortError") {
            console.error("Fetch aborted");
          } else {
            console.log(err.message);
          }
        }
      }
      getCoordsByAddress();
      return function () {
        controller.abort();
      };
    },
    [query]
  );

  //fetch weather based on search address
  useEffect(
    function () {
      async function fetchWeatherByQuery() {
        try {
          if (!newLat || !newLon) return;
          setIsLoading(true);
          const res = await fetch(
            `http://api.openweathermap.org/data/2.5/forecast?lat=${newLat}&lon=${newLon}&appid=${KEY}`
          );
          const data = await res.json();
          if (data) {
            setSun({});
            setWeather("");
            console.log("new coords:", data);
            setWeather(data);
            setSun({
              sunrise: handleConversionUTC(data.city.sunrise),
              sunset: handleConversionUTC(data.city.sunset),
            });
            setIsLoading(false);
          }
        } catch (err) {
          console.log(err);
        }
      }
      fetchWeatherByQuery();
    },
    [newLat, newLon]
  );

  //fetch address details based on search address
  useEffect(
    function () {
      async function fetchAddressByDetails() {
        try {
          if (!newLat || !newLon) return;
          setIsLoading(true);
          const res = await fetch(
            `https://us1.locationiq.com/v1/reverse?key=pk.d91f88ff4d19bf8dada031715a6889ab&lat=${newLat}&lon=${newLon}&format=json&`
          );
          const data = await res.json();
          if (data) {
            setCityName({});
            console.log("new address:", data);
            setCityName({
              country: data.address.country,
              city: data.address.city,
            });

            setIsLoading(false);
          }
        } catch (err) {
          console.log(err);
        }
      }
      fetchAddressByDetails();
    },
    [newLat, newLon]
  );

  //convert date for human
  function handleConversionUTC(utc) {
    const date = new Date(utc * 1000);
    const hour = date.getHours();
    const minute = date.getMinutes();
    return `${hour}:${minute}`;
  }

  function handleCityName(query) {
    setQuery(query);
  }

  return (
    <main>
      <Navbar
        query={query}
        setQuery={setQuery}
        onCityName={handleCityName}
        isLoading={isLoading}
      />
      <Header
        cityName={cityName}
        state={state}
        city={city}
        country={country}
        isLoading={isLoading}
      />
      <Section
        description={description}
        icon={icon}
        Temperature={Temperature}
        sunrise={sunrise}
        sunset={sunset}
        isLoading={isLoading}
      />
      <Footer>
        <DailyWeather />
      </Footer>
      <p className="sorena">
        practice after finished React intermediate By
        <a href={`https://www.linkedin.com/in/sorenasalehi/`}>
          {" "}
          @Sorena Salehi
        </a>{" "}
      </p>
    </main>
  );
}

function Header({ cityName, state, city, country, isLoading }) {
  return (
    <header>
      {isLoading && <p>is Loading </p>}
      {!isLoading && `${city ? city : ''} ${state ? state : ""} ${country}`}
    </header>
  );
}
