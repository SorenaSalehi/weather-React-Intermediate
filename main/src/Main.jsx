import { useEffect, useState } from "react";
import Navbar from "./component/navbar/Navbar";
import Section from "./component/section/Section";
import Footer from "./component/footer/Footer";
import DailyWeather from "./component/footer/DailyWeather";
const KEY = "a8d00e8852085aa1237b5d745e484172";

export default function Main() {
  const [coords, setCoords] = useState({ lat: null, lon: null });
  const [cityName, setCityName] = useState({
    city: "",
    state: "",
    country: "",
  });
  const [weather, setWeather] = useState("");
  const [query, setQuery] = useState("");
  const [SearchedCity, setSearchedCity] = useState({});
  const { newLat, newLon } = SearchedCity;
  const [sun, setSun] = useState({ sunrise: "", sunset: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { lat, lon } = coords;
  const { state, city, country } = cityName;
  const { sunrise, sunset } = sun;
  const Temperature = weather && weather.list[0]?.main.temp;
  const { description, icon } = weather && weather.list[0]?.weather[0];
  // console.log("city name:", cityName);
  // console.log("weather:", weather);
  // console.log("sun:", sun);
  // console.log('temp:',Temperature)
  // console.log(description,icon)

  //current position on mount
  useEffect(function () {
    async function currentPosition() {
      setIsLoading(true);
      try {
        navigator.geolocation.getCurrentPosition(
          function success(position) {
            const pos = position.coords;
            // console.log("current position:", pos);
            setCoords({ lat: pos.latitude, lon: pos.longitude });
            setError("");
          },
          function error(err) {
            setError(err.message);
          }
        );
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    }
    currentPosition();
  }, []);

  //fetch weather based on coords
  useEffect(
    function () {
      async function fetchWeather() {
        setIsLoading(true);
        try {
          if (!lat || !lon) {
            setError("Coordinates not Available !");
            return;
          }
          const res = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${KEY}`
          );
          if (!res) throw new Error(res.message);
          const data = await res.json();
          // console.log(data);
          if (!data) {
            setError("Weather Data not Fount !");
          }
          if (data) {
            setWeather(data);
            setSun({
              sunrise: handleConversionUTC(data.city?.sunrise),
              sunset: handleConversionUTC(data.city?.sunset),
            });
            setError("");

            setIsLoading(false);
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
        try {
          const res = await fetch(
            `https://us1.locationiq.com/v1/reverse?key=pk.d91f88ff4d19bf8dada031715a6889ab&lat=${lat}&lon=${lon}&format=json&`
          );
          const data = await res.json();

          if (!data) {
            setError("Address not Found ,Please Try Again :)");
            setIsLoading(false);
          }

          if (data) {
            // console.log("city details", data);
            setCityName({
              state: data.address?.state?.split(" ")[0],
              city: data.address?.city?.split(" ")[0],
              country: data.address?.country,
            });
            setError("");

            setIsLoading(false);
          }
        } catch (err) {
          console.error(err);
          setError(err.message);
        }
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
          if (!query || query.length < 4) {
            setCoords({ lat: null, lon: null });
            setIsLoading(false);
            return;
          }
          setIsLoading(true);
          const res = await fetch(
            `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${KEY}`,
            { signal }
          );
          const data = await res.json();

          if (!data || data.length === 0) {
            setCoords({ lat: null, lon: null });
            setError("Address not Found ,Please Try Again :)");
          }
          if (data) {
            // console.log("query:", data);

            setSearchedCity({ newLat: data[0]?.lat, newLon: data[0]?.lon });
            setError("");
          }
        } catch (err) {
          if (err.name === "AbortError") {
            console.error("Fetch aborted");
          } else {
            setIsLoading(false);

            console.error(err.message);
            setError(err.message);
          }
        } finally {
          setIsLoading(false);
        }
      }
      getCoordsByAddress();
      // return function () {
      //   controller.abort();
      // };
    },
    [query]
  );

  //fetch weather based on search address
  useEffect(
    function () {
      async function fetchWeatherByQuery() {
        setIsLoading(true);
        try {
          if (!newLat || !newLon) return;
          setIsLoading(true);
          const res = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${newLat}&lon=${newLon}&appid=${KEY}`
          );
          const data = await res.json();

          // if(!data){
          //   setError('Something Went Wrong , Please Try Again :)')
          //   setSun({sunrise:''});
          //   setWeather("");
          // }
          if (data) {
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
          setError(err.message);
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
        setIsLoading(true);
        try {
          if (!newLat || !newLon) return;
          const res = await fetch(
            `https://us1.locationiq.com/v1/reverse?key=pk.d91f88ff4d19bf8dada031715a6889ab&lat=${newLat}&lon=${newLon}&format=json&`
          );
          const data = await res.json();
          if (!data) {
            setError("Something Went Wrong , Please Try Again :)");
          }
          if (data) {
            console.log("new address:", data);
            setCityName({
              country: data.address?.country,
              city: data.address?.city,
            });

            setIsLoading(false);
          }
        } catch (err) {
          console.log(err.message);
          // setError(err.message);
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
        SearchedCity={SearchedCity}
        state={state}
        city={city}
        country={country}
        isLoading={isLoading}
        error={error}
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

function Header({ SearchedCity, state, city, country, error, isLoading }) {
  return (
    <header>
      {isLoading && <p className="loading">is Loading... </p>}
      {error && <p>{error}</p>}
      {!SearchedCity && !country && (
        <p className="error">Please Try Again :)</p>
      )}
      {!isLoading &&
        !error &&
        `${city ? city : ""} ${state ? state : ""} ${
          country ? country : "Please Try Again :)"
        }`}
    </header>
  );
}
