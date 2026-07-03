import { DataTypes } from "sequelize";

const Payment = (sequelize) => {
  const Payment = sequelize.define(
    "Payment",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING(3),
        defaultValue: "USD",
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("pending", "completed", "failed", "refunded"),
        defaultValue: "pending",
        allowNull: false,
      },
      transaction_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true,
      },
      payment_method: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      paid_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "Payments",
      timestamps: false,
      underscored: true,
    },
  );

  Payment.associate = (models) => {
    Payment.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });

    Payment.belongsTo(models.Course, {
      foreignKey: "course_id",
      as: "course",
    });
  };

  return Payment;
};

export default Payment;
