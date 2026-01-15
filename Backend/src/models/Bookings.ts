import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
} from "sequelize-typescript";

@Table({
  tableName: "bookings",
  timestamps: false,
})
export default class Booking extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column(DataType.INTEGER)
  vendor_id!: number;

  @Column(DataType.INTEGER)
  buyer_id!: number;

  @Column({
    type: DataType.DATE(3), 
  })
  start_time_utc!: Date;

  @Column({
    type: DataType.DATE(3), 
  })
  end_time_utc!: Date;

  @Column(DataType.STRING)
  status!: string;

  @Column(DataType.STRING)
  name!: string;

  @Column({
    type: DataType.DATE(3), 
    defaultValue: DataType.NOW,
  })
  created_at!: Date;
}
