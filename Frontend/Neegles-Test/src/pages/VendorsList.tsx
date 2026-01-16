import { useEffect, useState } from "react";
import getVendors from "../api/vendors";
import VendorCard from "../components/VendorCard";
import type { Vendor } from "../types/vendor";

const VendorsList = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVendors()
      .then(setVendors)
      .catch((err) => setError(err.message || "Error fetching vendors"))
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="p-6">Loading Vendors...</p>;
  }

  if (error) {
    return <p className="p-6 text-red-600">{error}</p>;
  }
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-sky-600">SwiftSlot</h1>
        <p className="text-gray-600 mt-1">Book 30-minute slots with ease</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 ">
        {vendors.map((vendor) => (
          <VendorCard key={vendor.id} vendor={vendor} />
        ))}
      </div>
    </div>
  );
};

export default VendorsList;
