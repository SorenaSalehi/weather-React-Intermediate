export default function Section({
  description,
  icon,
  Temperature,
  sunrise,
  sunset,
  isLoading,
}) {
  return (
    <section>
      {isLoading ? (
        <div>🤔</div>
      ) : (
        <div className="display">
          <img
            src={`http://openweathermap.org/img/wn/${icon}.png`}
            alt={description}
          ></img>
          <div className="temp">
            <p>{Math.round(Temperature - 273.15)} c</p>
            <h2>{description}</h2>
          </div>
        </div>
      )}
      <div className="desc">
        {isLoading ? (
          <h1>please wait</h1>
        ) : (
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
