import questionModel from "../../model/sql/question/question.model";
import answerModel from "../../model/sql/answer/answer.model";
import QuestionModel from "../../model/nosql/question/question.model";
import AnswerModel from "../../model/nosql/answer/answer.model";

const getDetails = async (x: any) => {
  const questionDetail = await QuestionModel.findOne({ id: x });
  return questionDetail;
};

const getQuestions = {
  handler: async (req: any, res: any) => {
    try {
      const question = await questionModel.findAll({});
      if (!question) {
        return res.status(400).send({
          message: "Question doesn't exist",
        });
      }

      return res.code(200).send({
        questions: question.map((x) => {
          return {
            details: getDetails(x.details),
            status: x.status,
            view_count: x.viewCount,
            vote_count: x.voteCount,
          };
        }),
      });
    } catch {
      return res.code(400);
    }
  },
};

const postQuestion = {
  handler: async (req: any, res: any) => {
    try {
      const body = req.body;
      const questionDetails = body.questionDetails;
      if (!questionDetails) {
        return res.status(401).send("Error in fetching parameters");
      }

      const nosqlQuestion = new QuestionModel({
        questionDetails: questionDetails,
      });
      nosqlQuestion.save();

      await questionModel.create({
        details: nosqlQuestion.id,
        viewCount: 0,
        status: "open",
        voteCount: 0,
        userId: req.currentUserId ? req.currentUserId : 0,
      });

      // create Question object with the details needed
      return res.status(200).send("Question created");
    } catch (e) {
      return res.status(500).send({
        message: "Error while posting question",
      });
    }
  },
};

const postQuestionAnswers = {
  handler: async (req: any, res: any) => {
    try {
      const body = req.body;
      const answerText = body.answerText;
      const userId = req.currentUserId;
      const q_id = body.questionId;

      const questionAnswer = new AnswerModel({ answers: answerText });
      await questionAnswer.save();

      await answerModel.create({
        answerText: questionAnswer.id,
        accepted: false,
        voteCount: 0,
        userId: userId,
        questionId: q_id,
      });

      return res.status(200).send("Answer created");
    } catch {
      return res.status(500).send({
        message: "Error while obtain the answers for a question",
      });
    }
  },
};

const patchQuestion = {
  handler: async (req: any, res: any) => {
    try {
      const body = req.body;
      const user_id = req.currentUserId;
      const details = body.details;
      const q_id = body.questionId;
      if (!q_id && !details) {
        return res.status(200).send("enter valid body");
      }
      const question = await questionModel.findOne({
        where: {
          id: q_id,
          userId: user_id,
        },
      });

      if (!question) {
        return res.status(400).send({
          message: "Question doesn't exist",
        });
      }

      const x = question.details;
      const questionDetail = await QuestionModel.findOne({ id: x });
      if (!questionDetail) {
        return res.status(500).send({
          message: "Error while obtain the answers for a question",
        });
      }
      questionDetail.questions = details;
      await questionDetail.save();

      return res.code(200).send("Updated");
    } catch {
      return res.code(500).send("internal server error");
    }
  },
};

const postVoteQuestion = {
  handler: async (req: any, res: any) => {
    try {
      const body = req.body;
      const q_id = body.questionId;
      if (!q_id) {
        return res.status(400).send("enter a question id");
      }
      const question = await questionModel.findOne({
        where: {
          id: q_id,
        },
      });
      if (!question) {
        return res.status(400).send("Question is not found");
      }
      question.voteCount += 1;
      await question.save();
      return res.status(200).send("upvoted");
    } catch (e) {
      return res.status(500).send("Internal server error");
    }
  },
};

const patchAnswer = {
  handler: async (req: any, res: any) => {
    try {
      const body = req.body;
      const answer_id = body.answerId;
      const user_id = req.currentUserId;
      const details = body.details;

      if (!answer_id && !details) {
        return res.status(200).send("enter valid body");
      }

      const answer = await answerModel.findOne({
        where: {
          id: answer_id,
          userId: user_id,
        },
      });

      if (!answer) {
        return res.status(400).send({
          message: "answer doesn't exist",
        });
      }

      const answerDetail = await AnswerModel.findOne({ id: answer.id });

      if (!answerDetail) {
        return res.status(500).send("Internal server error");
      }

      answerDetail.answers = details;
      await answerDetail.save();

      // code the rest of the route lamo
      return res.status(200).send("Answer updated");
    } catch {
      return res.status(500).send({
        message: "Error while obtain the answers for a question",
      });
    }
  },
};

const getAllUserQuestions = {
  handler: async (req: any, res: any) => {
    try {
      const userId = req.currentUserId;
      const questions = await questionModel.findAll({
        where: {
          userId: userId,
        },
      });

      if (!questions || questions.length == 0) {
        return res.status(500).send("No questions exists");
      }
      return res.code(200).send({
        questions: questions.map((x) => {
          return {
            details: getDetails(x.details),
            status: x.status,
            view_count: x.viewCount,
            vote_count: x.voteCount,
          };
        }),
      });
    } catch {
      return res.status(500).send("Internal server error");
    }
  },
};

// update this route when you get time
const getSpecificQuestion = {
  handler: async (req: any, res: any) => {
    try {
      const { questionId } = req.params;
      const questionDetails = await questionModel.findOne({
        where: { id: questionId },
        include: [answerModel],
      });
      return res.status(200).send(questionDetails);
    } catch {
      return res.status(500).send({
        message: "Error while fetching the question details",
      });
    }
  },
};

export {
  getAllUserQuestions,
  getQuestions,
  getSpecificQuestion,
  postQuestion,
  postQuestionAnswers,
  postVoteQuestion,
  patchQuestion,
  patchAnswer,
};
