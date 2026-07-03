export async function up(queryInterface, Sequelize) {
  await queryInterface.changeColumn("Reports", "status", {
    type: Sequelize.ENUM(
      "draft",
      "submitted",
      "reviewed",
      "approved",
      "rejected",
    ),
    allowNull: false,
    defaultValue: "draft",
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.changeColumn("Reports", "status", {
    type: Sequelize.ENUM("pending", "reviewed", "approved", "rejected"),
    allowNull: false,
    defaultValue: "pending",
  });
}
