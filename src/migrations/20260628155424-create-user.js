"use strict";
/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("Users", {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    name: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    email: {
      allowNull: false,
      unique: true,
      type: Sequelize.STRING,
    },
    password_hash: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    role: {
      allowNull: false,
      type: Sequelize.ENUM("student", "trainer", "admin"),
      defaultValue: "student",
    },
    profile_picture: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    phone: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    bio: {
      allowNull: true,
      type: Sequelize.TEXT,
    },
    is_active: {
      allowNull: true,
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
    email_verified: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
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
  await queryInterface.dropTable("Users");
}
