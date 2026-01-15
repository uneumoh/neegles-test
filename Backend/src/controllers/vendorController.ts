import { Request, Response } from "express";
import { DateTime } from "luxon";
import Vendor from "../models/Vendor";
import BookingSlot from "../models/BookingSlot"; // ensure this model exists

const getStringQueryParam = (req: Request, name: string): string | null => {
  const value = req.query[name];

  if (!value) return null;

  // If it's a string, return it
  if (typeof value === "string") return value;

  // If it's an array, return the first string element
  if (Array.isArray(value)) {
    for (const v of value) {
      if (typeof v === "string") return v;
    }
    return null;
  }

  // Ignore ParsedQs object
  return null;
};

export const getAllVendors = async (req: Request, res: Response) => {
  try {
    const vendors = await Vendor.findAll();
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const getVendorAvailability = async (req: Request, res: Response) => {
  try {
    // --- Vendor ID ---
    const vendorIdStr = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    if (!vendorIdStr)
      return res.status(400).json({ error: "Missing vendor ID" });

    const vendorId = parseInt(vendorIdStr, 10);
    if (isNaN(vendorId))
      return res.status(400).json({ error: "Invalid vendor ID" });

    // --- Date query param ---
    const dateStr = getStringQueryParam(req, "date");
    if (!dateStr)
      return res.status(400).json({ error: "Missing date parameter" });

    // Convert start/end of day in Africa/Lagos to UTC
    const startOfDayUTC = DateTime.fromISO(dateStr, { zone: "Africa/Lagos" })
      .startOf("day")
      .toUTC();
    const endOfDayUTC = DateTime.fromISO(dateStr, { zone: "Africa/Lagos" })
      .endOf("day")
      .toUTC();

    // Fetch booked slots for the vendor on that date
    const bookedSlots = await BookingSlot.findAll({
      where: {
        vendor_id: vendorId,
        slot_start_utc: {
          $gte: startOfDayUTC.toJSDate(),
          $lte: endOfDayUTC.toJSDate(),
        },
      },
      order: [["slot_start_utc", "ASC"]],
    });

    // Generate all possible 30-min slots for the day (UTC)
    const slots: DateTime[] = [];
    let current = startOfDayUTC;
    while (current < endOfDayUTC) {
      slots.push(current);
      current = current.plus({ minutes: 30 });
    }

    // Remove booked slots
    const bookedTimes = bookedSlots.map((s) =>
      DateTime.fromJSDate(s.slot_start_utc)
    );
    const freeSlots = slots.filter(
      (slot) => !bookedTimes.some((b) => b.equals(slot))
    );

    // Return free slots as ISO UTC strings
    res.json(freeSlots.map((s) => s.toISO()));
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};
