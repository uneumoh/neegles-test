import { Request, Response } from "express";
import { DateTime } from "luxon";
import Vendor from "../models/Vendor";
import BookingSlot from "../models/BookingSlot"; // ensure this model exists
import { Op } from "sequelize";

const getStringQueryParam = (req: Request, name: string): string | null => {
  const value = req.query[name];

  if (!value) return null;

  if (typeof value === "string") return value;

  if (Array.isArray(value)) {
    for (const v of value) {
      if (typeof v === "string") return v;
    }
    return null;
  }

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
    const vendorId = Number(req.params.id);
    if (!vendorId) return res.status(400).json({ error: "Invalid vendor ID" });

    const date = getStringQueryParam(req, "date");
    if (!date) return res.status(400).json({ error: "Missing date parameter" });

    // Lagos working hours
    const startLagos = DateTime.fromISO(date, { zone: "Africa/Lagos" }).set({
      hour: 9,
      minute: 0,
      second: 0,
      millisecond: 0,
    });
    const endLagos = DateTime.fromISO(date, { zone: "Africa/Lagos" }).set({
      hour: 17,
      minute: 0,
      second: 0,
      millisecond: 0,
    });

    const startUTC = startLagos.toUTC();
    const endUTC = endLagos.toUTC();

    const SLOT_INTERVAL_MINUTES = 30;
    const BUFFER_MINUTES = 120;

    // Fetch all booked slots on that day
    const fetchStartUTC = startUTC.minus({ minutes: BUFFER_MINUTES });
    const fetchEndUTC = endUTC.plus({ minutes: BUFFER_MINUTES });

    const bookedSlots = await BookingSlot.findAll({
      where: {
        vendor_id: vendorId,
        slot_start_utc: {
          [Op.gte]: fetchStartUTC.toJSDate(),
          [Op.lt]: fetchEndUTC.toJSDate(),
        },
      },
    });

    // Convert booked slots to buffer ranges
    const blockedRanges = bookedSlots.map((slot) => {
      const bookedTime = DateTime.fromJSDate(slot.slot_start_utc);
      return {
        start: bookedTime.minus({ minutes: BUFFER_MINUTES }),
        end: bookedTime.plus({ minutes: BUFFER_MINUTES }),
      };
    });

    //  Generate free slots
    const freeSlots: string[] = [];
    let cursor = startUTC;

    while (cursor.plus({ minutes: SLOT_INTERVAL_MINUTES }) <= endUTC) {
      const slotEnd = cursor.plus({ minutes: SLOT_INTERVAL_MINUTES });

      // Check if this slot overlaps any blocked range
      const overlaps = blockedRanges.some(
        ({ start, end }) => slotEnd > start && cursor < end
      );

      const iso = cursor.toISO();
      if (!overlaps && iso) freeSlots.push(iso);

      cursor = cursor.plus({ minutes: SLOT_INTERVAL_MINUTES });
    }

    res.json(freeSlots);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const getVendorById = async (req: Request, res: Response) => {
  try {
    const vendorIdStr = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    if (!vendorIdStr)
      return res.status(400).json({ error: "Missing vendor ID" });

    const vendorId = parseInt(vendorIdStr, 10);
    if (isNaN(vendorId))
      return res.status(400).json({ error: "Invalid vendor ID" });

    const vendor = await Vendor.findByPk(vendorId);
    if (!vendor) return res.status(404).json({ error: "Vendor not found" });

    res.json(vendor);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};
