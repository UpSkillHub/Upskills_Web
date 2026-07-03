"use strict";
/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("Payments", {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    course_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "Courses",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    amount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "USD",
    },
    status: {
      type: Sequelize.ENUM("pending", "completed", "failed"),
      defaultValue: "pending",
      allowNull: false,
    },
    transaction_id: {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    },
    payment_method: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    paid_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    created_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updated_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("Payments");
}
