import { DataTypes } from "sequelize";

const User = (sequelize) => {
  const UserModel = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("admin", "trainer", "student"),
        allowNull: false,
        defaultValue: "student",
      },
      profile_picture: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      email_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
      tableName: "users",
      timestamps: false,
      underscored: true,
      defaultScope: {
        attributes: { exclude: ["password_hash"] },
      },
    },
  );

  UserModel.associate = (models) => {
    UserModel.hasMany(models.RefreshToken, {
      foreignKey: "user_id",
      as: "refresh_tokens",
    });

    UserModel.hasMany(models.Course, {
      foreignKey: "trainer_id",
      as: "courses_taught",
    });

    UserModel.hasMany(models.Enrollment, {
      foreignKey: "user_id",
      as: "enrollments",
    });

    UserModel.hasMany(models.Payment, {
      foreignKey: "user_id",
      as: "payments",
    });

    UserModel.hasMany(models.Report, {
      foreignKey: "user_id",
      as: "reports",
    });

    UserModel.hasMany(models.Team, {
      foreignKey: "created_by",
      as: "teams_created",
    });

    UserModel.belongsToMany(models.Team, {
      through: "TeamMembers",
      foreignKey: "user_id",
      as: "teams",
    });
  };

  return UserModel;
};

export default User;
