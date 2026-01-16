import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { DateTime } from "luxon";
import { getVendorAvailability, getVendorById } from "../api/vendors";
import type { Vendor, Slot } from "../types/vendor";
import Checkout from "../components/Checkout";

export default function VendorsDetails() {
  const { id } = useParams<{ id: string }>();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [date, setDate] = useState<string>(
    DateTime.now().setZone("Africa/Lagos").toISODate() || ""
  );
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch vendor info
  useEffect(() => {
    if (!id) return;
    getVendorById(id).then((data) => setVendor(data));
  }, [id]);

  // Fetch slots for selected date
  useEffect(() => {
    const fetchSlots = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getVendorAvailability(id, date);

        setSlots(
          data.map((iso: string) => ({
            slot_start_utc: iso,
          }))
        );
      } catch (err) {
        console.error("Error fetching slots:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, [id, date]);

  const handleSlotClick = (slot: Slot) => {
    setSelectedSlot(slot);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {vendor && (
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-sky-600">{vendor.name}</h1>
          <span className="text-sm bg-sky-100 text-sky-800 px-2 py-1 rounded">
            {vendor.timezone}
          </span>
        </div>
      )}

      <div className="mb-4">
        <label className="block mb-1 font-semibold">Select Date:</label>
        <input
          type="date"
          className="border rounded px-3 py-2"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div>
        <h2 className="font-semibold mb-2">Available Slots</h2>
        {loading ? (
          <p>Loading...</p>
        ) : slots.length === 0 ? (
          <p>No slots available.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 ">
            {slots.map((slot) => {
              const slotLagos = DateTime.fromISO(slot.slot_start_utc)
                .setZone("Africa/Lagos")
                .toFormat("HH:mm");

              const isSelected =
                selectedSlot?.slot_start_utc === slot.slot_start_utc;

              return (
                <button
                  key={slot.slot_start_utc}
                  // ensures unique key
                  className={`border rounded px-2 py-1 text-sm ${
                    isSelected
                      ? "bg-sky-600 text-white"
                      : "bg-white hover:bg-sky-100"
                  }`}
                  onClick={() => handleSlotClick(slot)}
                >
                  {slotLagos}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedSlot && vendor && (
        <Checkout
          vendor={vendor}
          slot={selectedSlot}
          onSuccess={() => {
            setSelectedSlot(null);
          }}
        />
      )}
    </div>
  );
}
