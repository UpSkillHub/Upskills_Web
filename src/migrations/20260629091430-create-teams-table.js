/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("Teams", {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    name: {
      type: Sequelize.STRING(100),
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    created_by: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
      onDelete: "RESTRICT",
    },
    course_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Courses",
        key: "id",
      },
      onDelete: "SET NULL",
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
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
      defaultValue: Sequelize.literal(
        "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
      ),
    },
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("Teams");
}
