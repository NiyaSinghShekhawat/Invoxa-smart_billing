import "./EmergencyList.css";

export function SearchBar({ value, onChange, placeholder = "Search by ID, location, guest name, phone…" }) {
  return (
    <label className="field field--grow">
      <span className="field-label">Search</span>
      <input
        className="field-input"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
