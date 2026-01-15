import { Request, Response } from "express";
import Booking from "../models/Bookings";
import Payment from "../models/Payments";

export const initializePayment = async (req: Request, res: Response) => {
  const { bookingId } = req.body;

  if (!bookingId) {
    return res.status(400).json({ error: "bookingId is required" });
  }

  const booking = await Booking.findByPk(bookingId);
  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }

  if (booking.status === "paid") {
    return res.status(409).json({ error: "Booking already paid" });
  }

  // Generate mock reference
  const ref = `REF_${bookingId}_${Date.now()}`;

  await Payment.create({
    booking_id: bookingId,
    ref,
    status: "pending",
    raw_event_json: null,
  });

  return res.json({ ref });
};

export const paymentWebhook = async (req: Request, res: Response) => {
  const { event, data } = req.body;

  if (event !== "charge.success") {
    return res.status(200).json({ ok: true });
  }

  const payment = await Payment.findOne({
    where: { ref: data.reference },
  });

  if (!payment) {
    return res.status(404).json({ error: "Payment not found" });
  }

  // Idempotent: already processed
  if (payment.status === "success") {
    return res.status(200).json({ ok: true });
  }

  payment.status = "success";
  payment.raw_event_json = req.body;
  await payment.save();

  const booking = await Booking.findByPk(payment.bookingId);
  if (booking) {
    booking.status = "paid";
    await booking.save();
  }

  return res.status(200).json({ ok: true });
};
