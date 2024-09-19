export default function Navbar({ query, setQuery, onCityName, isLoading }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onCityName(query);
        console.log(e.target.value);
      }}
    >
      <input
        type="text"
        placeholder="Search for City's Weather"
        // disabled={isLoading}
        value={query}
        onChange={(e)=> setQuery(e.target.value)}
      />
    </form>
  );
}
