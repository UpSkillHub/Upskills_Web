import { DataTypes } from "sequelize";

const RefreshToken = (sequelize) => {
  const RefreshToken = sequelize.define(
    "RefreshToken",
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
      token: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      is_revoked: {
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
      tableName: "RefreshTokens",
      timestamps: false,
      underscored: true,
    },
  );

  RefreshToken.associate = (models) => {
    RefreshToken.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });
  };

  return RefreshToken;
};

export default RefreshToken;
