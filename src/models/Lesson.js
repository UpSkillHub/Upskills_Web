import { DataTypes } from "sequelize";

const Lesson = (sequelize) => {
  const Lesson = sequelize.define(
    "Lesson",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      module_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      video_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      duration: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
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
      tableName: "Lessons",
      timestamps: false,
      underscored: true,
    },
  );

  Lesson.associate = (models) => {
    Lesson.belongsTo(models.Module, {
      foreignKey: "module_id",
      as: "module",
    });
  };

  return Lesson;
};

export default Lesson;
