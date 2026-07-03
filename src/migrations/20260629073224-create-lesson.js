"use strict";
/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("Lessons", {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    module_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "Modules",
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
      allowNull: true,
    },
    video_url: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    duration: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    order: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
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
  await queryInterface.dropTable("Lessons");
}
