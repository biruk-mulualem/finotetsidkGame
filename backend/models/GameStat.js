// models/GameStat.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class GameStat extends Model {
    static associate(models) {
      // Add associations if needed
    }
  }

  GameStat.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      total_games: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'total_games',
      },
      total_questions_answered: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'total_questions_answered',
      },
      correct_answers: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'correct_answers',
      },
      wrong_answers: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'wrong_answers',
      },
      average_time_per_question: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'average_time_per_question',
      },
      most_played_type: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'most_played_type',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'updated_at',
      },
    },
    {
      sequelize,
      modelName: 'GameStat',
      tableName: 'game_stats',
      timestamps: true,
      updatedAt: 'updated_at',
      createdAt: false,
    }
  );

  return GameStat;
};