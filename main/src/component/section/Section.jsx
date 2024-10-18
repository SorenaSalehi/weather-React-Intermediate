export default function Section({
  description,
  icon,
  Temperature,
  sunrise,
  sunset,
  isLoading,
  error,
}) {
  return (
    <section>
      {!isLoading && !error && (
        <div className="display">
          <div className="icon">
            <img
              src={`https://openweathermap.org/img/wn/${icon}.png`}
              alt={description}
            ></img>
          </div>
          <div className="temp">
            <h2>{Math.round(Temperature - 273.15)} c</h2>
          </div>
          <div>
            <h4>{description}</h4>
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
