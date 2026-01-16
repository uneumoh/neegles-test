import type { Vendor } from "../types/vendor";
import { Link } from "react-router";

const VendorCard = ({ vendor }: { vendor: Vendor }) => {
  return (
    <div className="border rounded-xl p-4 shadow-sm hover:shadow-md transition">
      <h3 className="text-lg font-semibold">{vendor.name}</h3>
      <p className="text-sm text-gray-500 mt-1">Timezone: {vendor.timezone}</p>
      <Link
        to={`/vendors/${vendor.id}`}
        className="inline-block mt-3 text-sky-600 font-medium hover:underline"
      >
        See Availability
      </Link>
    </div>
  );
};

export default VendorCard;
