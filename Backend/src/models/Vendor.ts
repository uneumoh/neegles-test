import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement
} from "sequelize-typescript";

@Table({
  tableName: "vendors",
  timestamps: false
})
export default class Vendor extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.STRING)
  timezone!: string;
}
