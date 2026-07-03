"use strict";
/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("Reports", {
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
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    content: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    status: {
      type: Sequelize.ENUM("pending", "reviewed", "approved", "rejected"),
      defaultValue: "pending",
      allowNull: false,
    },
    submitted_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    reviewed_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    reviewer_comment: {
      type: Sequelize.TEXT,
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
  await queryInterface.dropTable("Reports");
}
