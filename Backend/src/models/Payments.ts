import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  Unique,
  Default,
} from "sequelize-typescript";

@Table({
  tableName: "payments",
  timestamps: false,
})
export default class Payment extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column({
    type: DataType.INTEGER,
    field: "booking_id",
  })
  bookingId!: number;

  @Unique
  @Column(DataType.STRING)
  ref!: string;

  @Column(DataType.ENUM("pending", "success", "failed"))
  status!: "pending" | "success" | "failed";

  @Column(DataType.JSON)
  raw_event_json!: object | null;

  @Default(DataType.NOW)
  @Column({
    type: DataType.DATE(3),
  })
  created_at!: Date;
}
