// models/Question.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    static associate(models) {
      // No associations if we remove sessions
    }
  }

  Question.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM('sign', 'proverb', 'choice', 'truefalse', 'short', 'song'),
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      question: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
     options: {
  type: DataTypes.ARRAY(DataTypes.TEXT),
  allowNull: true,
  defaultValue: null,
},
      correct: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      answer: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      image_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'image_url',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      audio_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'audio_url',
      },
      difficulty: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          min: 1,
          max: 5,
        },
      },
      points: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10,
      },
      time_limit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 30,
        field: 'time_limit',
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active',
      },
      card_number: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'card_number',
        validate: {
          min: 1,
          max: 10,
        },
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'updated_at',
      },
    },
    {
      sequelize,
      modelName: 'Question',
      tableName: 'questions',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Question;
};