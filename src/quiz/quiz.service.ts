import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Quiz, QuizDocument } from './quiz.schema';
import { Note, NoteDocument } from '../note/note.schema';
import { CreateQuizDto, UpdateQuizDto } from './quiz.dto';
import { JwtPayload } from '../common/types/jwt-payload.type';
import { UserRole } from '../user/user.schema';

@Injectable()
export class QuizService {
  constructor(
    @InjectModel(Quiz.name)
    private readonly quizModel: Model<QuizDocument>,

    @InjectModel(Note.name)
    private readonly noteModel: Model<NoteDocument>,
  ) {}

  //  All authenticated — fetch quizzes for a note

  findAll(noteId: string) {
    return this.quizModel
      .find({ noteId })
      .select('-questions.correctAnswer') // don't expose answer on list
      .lean();
  }

  //  Full quiz — strips correct answers for students

  async findOne(id: string, user: JwtPayload) {
    const quiz = await this.quizModel.findById(id).lean();
    if (!quiz) throw new NotFoundException('Quiz not found');

    // Students don't get correct answers upfront
    if (user.role === UserRole.STUDENT) {
      const sanitized = quiz.questions.map(({ correctAnswer, ...q }) => q);
      return { ...quiz, questions: sanitized };
    }

    return quiz;
  }

  //  Submit answers — students only

  async submit(id: string, answers: number[]) {
    const quiz = await this.quizModel.findById(id).lean();
    if (!quiz) throw new NotFoundException('Quiz not found');

    const results = quiz.questions.map((q, i) => ({
      question: q.question,
      selected: answers[i],
      correct: q.correctAnswer,
      isCorrect: answers[i] === q.correctAnswer,
      explanation: q.explanation,
    }));

    const score = results.filter((r) => r.isCorrect).length;

    return {
      score,
      total: quiz.questions.length,
      percentage: Math.round((score / quiz.questions.length) * 100),
      results,
    };
  }

  //  Create — teacher and admin

  async create(dto: CreateQuizDto) {
    const note = await this.noteModel.findById(dto.noteId);
    if (!note) throw new NotFoundException('Note not found');
    return this.quizModel.create(dto);
  }

  //  Update — teacher and admin

  async update(id: string, dto: UpdateQuizDto) {
    const quiz = await this.quizModel.findByIdAndUpdate(id, dto, { new: true });
    if (!quiz) throw new NotFoundException('Quiz not found');
    return quiz;
  }

  //  Delete — admin only

  async remove(id: string) {
    const quiz = await this.quizModel.findByIdAndDelete(id);
    if (!quiz) throw new NotFoundException('Quiz not found');
    return { message: 'Quiz deleted' };
  }
}
