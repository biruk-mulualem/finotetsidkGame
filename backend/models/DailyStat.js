// models/DailyStat.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DailyStat extends Model {
    static associate(models) {
      // Add associations if needed
    }
  }

  DailyStat.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      stat_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        unique: true,
        field: 'stat_date',
      },
      games_played: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'games_played',
      },
      questions_answered: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'questions_answered',
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
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
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
      modelName: 'DailyStat',
      tableName: 'daily_stats',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return DailyStat;
};