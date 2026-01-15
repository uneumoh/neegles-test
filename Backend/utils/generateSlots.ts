import { DateTime } from "luxon";

export const generateSlots = (
  startUTC: DateTime,
  endUTC: DateTime
): DateTime[] => {
  const slots: DateTime[] = [];
  let cursor = startUTC;

  while (cursor < endUTC) {
    slots.push(cursor);
    cursor = cursor.plus({ minutes: 30 });
  }

  return slots;
};
