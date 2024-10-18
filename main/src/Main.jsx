import { useEffect, useState } from "react";
import Navbar from "./component/navbar/Navbar";
import Section from "./component/section/Section";

const KEY = "a8d00e8852085aa1237b5d745e484172";

export default function Main() {

  const [coords, setCoords] = useState({
    lat: "",
    lon: "",
  });
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
  const Temperature = weather?.list?.[0]?.main?.temp ?? "N/A";
  const { description = "no Description", icon = "🤔" } =
    weather?.list?.[0]?.weather[0] || [];


  //current position on mount
  useEffect(function () {
    async function currentPosition() {
      setIsLoading(true);
      setError('please wait ... ')
      try {
        navigator.geolocation.getCurrentPosition(
          function success(position) {
            const pos = position.coords;
            setCoords({ lat: pos.latitude, lon: pos.longitude });
            setError("");
        setIsLoading(false);

          },
          function error(err) {
            setError(err.message);
          }
        );
      } catch (err) {
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
            setIsLoading(false);
            return;
          }
          const res = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${KEY}`
          );
          if (!res) throw new Error(res.message);
          const data = await res.json();
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
        if (!lat || !lon) {
          setIsLoading(false);
          return;
        }
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
            setCityName({
              state: data.address?.state?.split(" ")[0],
              city: data.address?.city?.split(" ")[0],
              country: data.address?.country,
            });
            setError("");

            setIsLoading(false);
          }
        } catch (err) {
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
      

      async function getCoordsByAddress() {
        setIsLoading(true);
        try {
          const res = await fetch(
            `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${KEY}`
          );
          const data = await res.json();
          if (!data || data.length < 1) {
            setCoords({});
            setWeather({});
            setCityName({});
            setQuery("");
            setSearchedCity({});
            setSun({});
            setError("Address not Found ,Please Try Again :)");
            setIsLoading(false);
          }
          if (data) {
            setSearchedCity({ newLat: data[0]?.lat, newLon: data[0]?.lon });
            setError("");
          }
        } catch (err) {
          if (err.name === "AbortError") {
          } else {
            setError(err.message);
          }
        } finally {
          setIsLoading(false);
        }
      }
      getCoordsByAddress();
     
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
          const res = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${newLat}&lon=${newLon}&appid=${KEY}`
          );
          const data = await res.json();

          if (data) {
            setWeather(data);
            setSun({
              sunrise: handleConversionUTC(data.city.sunrise),
              sunset: handleConversionUTC(data.city.sunset),
            });
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setIsLoading(false);
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
            setCityName({
              country: data.address?.country,
              city: data.address?.city,
            });
          }
        } catch (err) {
          // setError(err.message);
        } finally {
          setIsLoading(false);
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
    if (query === "") return;
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
        error={error}
        description={description}
        icon={icon}
        Temperature={Temperature}
        sunrise={sunrise}
        sunset={sunset}
        isLoading={isLoading}
      />
     
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
