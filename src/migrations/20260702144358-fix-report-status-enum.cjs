
"use strict";
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Reports", "status", {
      type: Sequelize.ENUM(
        "draft",
        "submitted",
        "reviewed",
        "approved",
        "rejected"
      ),
      allowNull: false,
      defaultValue: "draft",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Reports", "status", {
      type: Sequelize.ENUM(
        "pending",
        "reviewed",
        "approved",
        "rejected"
      ),
      allowNull: false,
      defaultValue: "pending",
    });
  },
};
