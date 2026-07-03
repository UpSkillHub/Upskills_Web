import { DataTypes } from "sequelize";

const Enrollment = (sequelize) => {
  const Enrollment = sequelize.define(
    "Enrollment",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("active", "completed", "dropped"),
        defaultValue: "active",
        allowNull: false,
      },
      progress: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      enrolled_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      completed_at: {
        type: DataTypes.DATE,
        allowNull: true,
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
      tableName: "Enrollments",
      timestamps: false,
      underscored: true,
    },
  );

  Enrollment.associate = (models) => {
    Enrollment.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });

    Enrollment.belongsTo(models.Course, {
      foreignKey: "course_id",
      as: "course",
    });
  };

  return Enrollment;
};

export default Enrollment;
