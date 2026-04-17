import { DashboardProvider } from "./store/DashboardContext.jsx";
import { DashboardLayout } from "./components/Layout/DashboardLayout.jsx";

export default function App() {
  return (
    <DashboardProvider>
      <DashboardLayout />
    </DashboardProvider>
  );
}
