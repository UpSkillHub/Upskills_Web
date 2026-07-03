import { DataTypes } from "sequelize";

const Report = (sequelize) => {
  const Report = sequelize.define(
    "Report",
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
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(
          "draft",
          "submitted",
          "reviewed",
          "approved",
          "rejected",
        ),
        defaultValue: "draft",
        allowNull: false,
      },
      submitted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      reviewed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      reviewer_comment: {
        type: DataTypes.TEXT,
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
      tableName: "Reports",
      timestamps: false,
      underscored: true,
    },
  );

  Report.associate = (models) => {
    Report.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });

    Report.belongsTo(models.Course, {
      foreignKey: "course_id",
      as: "course",
    });
  };

  return Report;
};

export default Report;
