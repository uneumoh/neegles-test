import { Request, Response } from "express";
import { sequelize } from "../db";
import Booking from "../models/Bookings";
import BookingSlot from "../models/BookingSlot";
import IdempotencyKey from "../models/IdempotencyKeys";
import { DateTime } from "luxon";
import { generateSlots } from "../../utils/generateSlots";

export const createBooking = async (req: Request, res: Response) => {
  const idempotencyKey = req.header("Idempotency-Key");

  if (!idempotencyKey) {
    return res.status(400).json({ error: "Missing Idempotency-Key header" });
  }

  const { vendorId, startISO, endISO } = req.body;

  if (!vendorId || !startISO || !endISO) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const existingKey = await IdempotencyKey.findByPk(idempotencyKey);
  if (existingKey) {
    try {
      return res.json(JSON.parse(existingKey.response_hash));
    } catch {
      return res.status(500).json({ error: "Corrupted idempotency response" });
    }
  }

  const startUTC = DateTime.fromISO(startISO, {
    zone: "Africa/Lagos",
  }).toUTC();

  const endUTC = DateTime.fromISO(endISO, {
    zone: "Africa/Lagos",
  }).toUTC();

  const slots = generateSlots(startUTC, endUTC);

  const transaction = await sequelize.transaction();

  try {
    const booking = await Booking.create(
      {
        vendor_id: vendorId,
        start_time_utc: startUTC.toJSDate(),
        end_time_utc: endUTC.toJSDate(),
        status: "confirmed",
      },
      { transaction }
    );

    console.log("Slots to book:", slots);
    for (const slot of slots) {
      await BookingSlot.create(
        {
          booking_id: booking.id,
          vendor_id: vendorId,
          slot_start_utc: slot.toJSDate(),
        },
        { transaction }
      );
    }

    const responseBody = { bookingId: booking.id };

    await IdempotencyKey.create(
      {
        key: idempotencyKey,
        scope: "booking.create",
        response_hash: JSON.stringify(responseBody),
        created_at: new Date(),
      },
      { transaction }
    );

    await transaction.commit();
    return res.status(201).json(responseBody);
  } catch (err: any) {
    await transaction.rollback();

    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ error: "Slot already booked" });
    }

    return res.status(500).json({ error: err.message });
  }
};

export const getBookingById = async (req: Request, res: Response) => {
  const idParam = req.params.id;

  const bookingId = Number(idParam);
  if (Number.isNaN(bookingId)) {
    return res.status(400).json({ error: "Invalid booking id" });
  }

  const booking = await Booking.findByPk(bookingId);

  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }

  return res.json({
    id: booking.id,
    vendor_id: booking.vendor_id,
    buyer_id: booking.buyer_id,
    start_time_utc: booking.start_time_utc,
    end_time_utc: booking.end_time_utc,
    status: booking.status,
    created_at: booking.created_at,
  });
};
