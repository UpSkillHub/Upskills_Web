import { DataTypes } from "sequelize";

const Team = (sequelize) => {
  const Team = sequelize.define(
    "Team",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      course_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
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
      tableName: "Teams",
      timestamps: false,
      underscored: true,
    },
  );

  Team.associate = (models) => {
    Team.belongsTo(models.User, {
      foreignKey: "created_by",
      as: "creator",
    });

    Team.belongsTo(models.Course, {
      foreignKey: "course_id",
      as: "course",
    });

    Team.belongsToMany(models.User, {
      through: "TeamMembers",
      foreignKey: "team_id",
      as: "members",
    });

    Team.hasMany(models.TeamMember, {
      foreignKey: "team_id",
      as: "team_members",
    });
  };

  return Team;
};

export default Team;
