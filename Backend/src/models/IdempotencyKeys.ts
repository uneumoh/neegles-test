import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default
} from "sequelize-typescript";

@Table({
  tableName: "idempotency_keys",
  timestamps: false,
})
export default class IdempotencyKey extends Model {
  @PrimaryKey
  @Column(DataType.STRING)
  key!: string;

  @Column(DataType.STRING)
  scope!: string;

  @Column(DataType.STRING)
  response_hash!: string;

  @Default(DataType.NOW)
  @Column({
    type: DataType.DATE(3), // DATETIME(3) for milliseconds precision
  })
  created_at!: Date;
}
