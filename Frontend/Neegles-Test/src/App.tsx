import { Routes, Route } from "react-router";
import VendorsList from "./pages/VendorsList";
import VendorsDetails from "./pages/VendorsDetails";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<VendorsList />} />
      <Route path="/vendors/:id" element={<VendorsDetails />} />
    </Routes>
  );
}
