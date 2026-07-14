// models/Team.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Team extends Model {
    static associate(models) {
      // No associations needed - we're keeping it simple
    }

    // Helper method to get team 1 object
    getTeam1() {
      return {
        name: this.team1_name,
        emoji: this.team1_emoji,
        color: this.team1_color,
        score: this.team1_score,
        wins: this.team1_wins,
        losses: this.team1_losses,
        total_points: this.team1_total_points,
        games_played: this.team1_games_played,
      };
    }

    // Helper method to get team 2 object
    getTeam2() {
      return {
        name: this.team2_name,
        emoji: this.team2_emoji,
        color: this.team2_color,
        score: this.team2_score,
        wins: this.team2_wins,
        losses: this.team2_losses,
        total_points: this.team2_total_points,
        games_played: this.team2_games_played,
      };
    }

    // Helper method to get winner
    getWinner() {
      if (this.team1_score > this.team2_score) {
        return { team: 1, name: this.team1_name, score: this.team1_score };
      } else if (this.team2_score > this.team1_score) {
        return { team: 2, name: this.team2_name, score: this.team2_score };
      } else {
        return { team: 0, name: 'Draw', score: this.team1_score };
      }
    }

    // Helper method to get match summary
    getMatchSummary() {
      return {
        match: `${this.team1_name} vs ${this.team2_name}`,
        score: `${this.team1_score} - ${this.team2_score}`,
        winner: this.getWinner(),
        is_active: this.is_active,
        week_number: this.week_number,
        game_date: this.game_date,
      };
    }
  }

  Team.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      // Team 1 Fields
      team1_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'team1_name',
        validate: {
          notEmpty: {
            msg: 'Team 1 name is required',
          },
          len: {
            args: [1, 100],
            msg: 'Team 1 name must be between 1 and 100 characters',
          },
        },
      },
      team1_emoji: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: '🔵',
        field: 'team1_emoji',
      },
      team1_color: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'blue',
        field: 'team1_color',
      },
      team1_score: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'team1_score',
        validate: {
          min: {
            args: [0],
            msg: 'Score cannot be negative',
          },
        },
      },
      team1_wins: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'team1_wins',
      },
      team1_losses: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'team1_losses',
      },
      team1_total_points: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'team1_total_points',
      },
      team1_games_played: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'team1_games_played',
      },
      
      // Team 2 Fields
      team2_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'team2_name',
        validate: {
          notEmpty: {
            msg: 'Team 2 name is required',
          },
          len: {
            args: [1, 100],
            msg: 'Team 2 name must be between 1 and 100 characters',
          },
        },
      },
      team2_emoji: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: '🔴',
        field: 'team2_emoji',
      },
      team2_color: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'red',
        field: 'team2_color',
      },
      team2_score: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'team2_score',
        validate: {
          min: {
            args: [0],
            msg: 'Score cannot be negative',
          },
        },
      },
      team2_wins: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'team2_wins',
      },
      team2_losses: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'team2_losses',
      },
      team2_total_points: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'team2_total_points',
      },
      team2_games_played: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'team2_games_played',
      },
      
      // Game Info
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active',
      },
      game_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'game_date',
      },
      week_number: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'week_number',
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
      },
    },
    {
      sequelize,
      modelName: 'Team',
      tableName: 'teams',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
      hooks: {
        beforeCreate: (team) => {
          if (team.team1_name === team.team2_name) {
            throw new Error('Team 1 and Team 2 cannot have the same name');
          }
          return team;
        },
      },
    }
  );

  return Team;
};