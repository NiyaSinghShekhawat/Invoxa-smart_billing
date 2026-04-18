// src/components/EmergencyList/SearchBar.jsx
export function SearchBar({ value, onChange }) {
  return (
    <div className="field field--grow">
      <label className="field-label">Search</label>
      <input
        className="field-input"
        type="search"
        placeholder="Location, type, reporter name…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
