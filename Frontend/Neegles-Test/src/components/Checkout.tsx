import { v4 as uuidv4 } from "uuid"; // for idempotency key
import axios from "axios";
import type { Vendor, Slot } from "../types/vendor";
import { useState } from "react";
import { DateTime } from "luxon";

type CheckoutStatus = "idle" | "loading" | "success" | "error";

const Checkout = ({
  vendor,
  slot,
  onSuccess,
}: {
  vendor: Vendor | null;
  slot: Slot;
  onSuccess: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [status, setStatus] = useState<CheckoutStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleBookingAndPayment = async () => {
    if (!vendor) return;
    setLoading(true);
    setError(null);

    const idempotencyKey = uuidv4(); // generate unique key per request
    try {
      // 1️⃣ Create booking
      const bookingRes = await axios.post(
        "http://localhost:4000/api/bookings",
        {
          vendorId: vendor.id,
          startISO: slot.slot_start_utc,
          endISO: slot.slot_start_utc, // 30-min slot, adjust as needed
        },
        {
          headers: { "Idempotency-Key": idempotencyKey },
        }
      );

      const bookingId = bookingRes.data.bookingId;

      // 2️⃣ Initialize payment
      const paymentRes = await axios.post(
        "http://localhost:4000/api/payments/initialize",
        { bookingId }
      );

      const ref = paymentRes.data.ref;

      // 3️⃣ Mock webhook call
      await axios.post("http://localhost:4000/api/payments/webhook", {
        event: "charge.success",
        data: { reference: ref },
      });

      setStatus("success");
      setMessage("Booking confirmed. Payment successful 🎉");

      setSuccess(true);
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 p-4 border rounded bg-gray-50">
      <h3 className="font-semibold mb-2">Review & Checkout</h3>
      {success ? (
        <p className="text-green-600 font-semibold">
          Booking & Payment successful!
        </p>
      ) : (
        <>
          <p>
            Vendor: <strong>{vendor?.name}</strong>
          </p>
          <p>
            Date (Lagos):{" "}
            <strong>
              {DateTime.fromISO(slot.slot_start_utc)
                .setZone("Africa/Lagos")
                .toFormat("yyyy-MM-dd HH:mm")}
            </strong>
          </p>
          <p>
            Date (UTC): <strong>{slot.slot_start_utc}</strong>
          </p>
          <p>
            Price: <strong>$0.00 </strong>
          </p>

          {error && <p className="text-red-600 mt-2">{error}</p>}

          <button
            className="mt-3 px-4 py-2 bg-sky-600 text-white rounded disabled:bg-gray-400"
            disabled={loading}
            onClick={handleBookingAndPayment}
          >
            {loading ? "Processing..." : "Book & Pay"}
          </button>
        </>
      )}
    </div>
  );
};
export default Checkout;
