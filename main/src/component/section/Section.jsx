export default function Section({
  description,
  icon,
  Temperature,
  sunrise,
  sunset,
  isLoading,
  error
}) {
  return (
    <section>
      {!isLoading && !error && (
        <div className="display">
          <img
            src={`https://openweathermap.org/img/wn/${icon}.png`}
            alt={description}
          ></img>
          <div className="temp">
            <p>{Math.round(Temperature - 273.15)} c</p>
            <h2>{description}</h2>
          </div>
        </div>
      )}
      <div className="desc">
        {!isLoading && !error && (
          <>
            <div className="sun">
              <p>
                sunrise <span>{sunrise} </span>Am
              </p>
              <p>
                sunset <span>{sunset} </span>Pm
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
