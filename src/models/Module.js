import { DataTypes } from "sequelize";

const Module = (sequelize) => {
  const Module = sequelize.define(
    "Module",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
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
      tableName: "Modules",
      timestamps: false,
      underscored: true,
    },
  );

  Module.associate = (models) => {
    Module.belongsTo(models.Course, {
      foreignKey: "course_id",
      as: "course",
    });

    Module.hasMany(models.Lesson, {
      foreignKey: "module_id",
      as: "lessons",
    });
  };

  return Module;
};

export default Module;
