import "./Common.css";
import { formatTimestamp } from "../../utils/formatters.js";

export function Timestamp({ value }) {
  return <time className="timestamp" dateTime={value}>{formatTimestamp(value)}</time>;
}
