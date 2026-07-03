import { DataTypes } from "sequelize";

const TeamMember = (sequelize) => {
  const TeamMember = sequelize.define(
    "TeamMember",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      team_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("lead", "member"),
        defaultValue: "member",
        allowNull: false,
      },
      joined_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
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
      tableName: "TeamMembers",
      timestamps: false,
      underscored: true,
    },
  );

  TeamMember.associate = (models) => {
    TeamMember.belongsTo(models.Team, {
      foreignKey: "team_id",
      as: "team",
    });

    TeamMember.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });
  };

  return TeamMember;
};

export default TeamMember;
