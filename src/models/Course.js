import { DataTypes } from "sequelize";

const Course = (sequelize) => {
  const Course = sequelize.define(
    "Course",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
      trainer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
        allowNull: false,
      },
      is_published: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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
      tableName: "Courses",
      timestamps: false,
      underscored: true,
    },
  );

  Course.associate = (models) => {
    Course.belongsTo(models.User, {
      foreignKey: "trainer_id",
      as: "trainer",
    });

    Course.hasMany(models.Module, {
      foreignKey: "course_id",
      as: "modules",
    });

    Course.hasMany(models.Enrollment, {
      foreignKey: "course_id",
      as: "enrollments",
    });

    Course.hasMany(models.Payment, {
      foreignKey: "course_id",
      as: "payments",
    });

    Course.hasMany(models.Report, {
      foreignKey: "course_id",
      as: "reports",
    });

    Course.hasMany(models.Team, {
      foreignKey: "course_id",
      as: "teams",
    });
  };

  return Course;
};

export default Course;
