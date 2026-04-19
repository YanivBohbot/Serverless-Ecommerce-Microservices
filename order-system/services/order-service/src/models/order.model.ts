import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export enum OrderStatus {
  PENDING = "PENDING",
  VALIDATED = "VALIDATED",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELED = "CANCELED",
}

export class Order extends Model {
  public id!: number;
  public customerId!: number;
  public items!: object; // מערך של מוצרים בפורמט JSON
  public totalAmount!: number;
  public status!: OrderStatus;
}

Order.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    customerId: { type: DataTypes.INTEGER, allowNull: false },
    items: { type: DataTypes.JSONB, allowNull: false }, // JSONB יעיל לשאילתות ב-Postgres
    totalAmount: { type: DataTypes.FLOAT, allowNull: false },
    status: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      defaultValue: OrderStatus.PENDING,
    },
  },
  {
    sequelize,
    tableName: "Orders",
  },
);
