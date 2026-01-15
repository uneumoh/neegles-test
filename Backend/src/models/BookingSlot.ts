import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  Unique,
} from "sequelize-typescript";

@Table({
  tableName: "booking_slots",
  timestamps: false,
})
export default class BookingSlot extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column(DataType.INTEGER)
  booking_id!: number;

  @Unique("vendor_slot_unique")
  @Column(DataType.INTEGER)
  vendor_id!: number;

  @Unique("vendor_slot_unique")
  @Column(DataType.DATE)
  slot_start_utc!: Date;
}
