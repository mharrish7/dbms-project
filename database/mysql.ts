import { Sequelize } from "sequelize-typescript";
import config from "../config/config";
import User from "../model/sql/user/user.model";
import Comment from "../model/sql/comment/comment.model";
import Answer from "../model/sql/answer/answer.model";
import Question from "../model/sql/question/question.model";

const db = new Sequelize(
  config.mysqldatabase,
  config.mysqlusername,
  config.mysqlpassword,
  {
    host: config.host,
    dialect: "mysql",
  }
);

// add models here
db.addModels([Comment, Answer, Question, User]);

const connectSQLDatabase = () => {
  db.sync({ force: false })
    .then(() => console.log("Connected to db successfully"))
    .catch((err) => console.log(err));
};

export { connectSQLDatabase, db };
