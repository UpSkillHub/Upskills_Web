/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("TeamMembers", {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    team_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "Teams",
        key: "id",
      },
      onDelete: "CASCADE",
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
    role: {
      type: Sequelize.ENUM("lead", "member"),
      defaultValue: "member",
      allowNull: false,
    },
    joined_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    created_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updated_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal(
        "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
      ),
    },
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("TeamMembers");
}
