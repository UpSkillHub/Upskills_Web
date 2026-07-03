"use strict";
/** @type {import('sequelize-cli').Migration} */

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("Enrollments", {
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
    status: {
      type: Sequelize.ENUM("active", "completed", "dropped"),
      defaultValue: "active",
      allowNull: false,
    },
    progress: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    enrolled_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    completed_at: {
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
  await queryInterface.dropTable("Enrollments");
}
