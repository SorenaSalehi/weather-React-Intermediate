import { useState } from "react";

export default function Navbar({ query, setQuery, onCityName, isLoading }) {
 const [localQuery,setLocalQuery]=useState('')
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onCityName(localQuery);
        setLocalQuery('')
      }}
    >
      <input
        type="text"
        placeholder="Search for City's Weather"
        autoFocus
        value={localQuery}
        onChange={(e)=> setLocalQuery(e.target.value)}
        disabled={isLoading}
      />
      <button type="submit" disabled={isLoading}>Search</button>
    </form>
  );
}
