import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Note, NoteDocument } from './note.schema';
import { Quiz, QuizDocument } from '../quiz/quiz.schema';
import { CreateNoteDto, UpdateNoteDto, NoteQueryDto } from './note.dto';

@Injectable()
export class NoteService {
  constructor(
    @InjectModel(Note.name)
    private readonly noteModel: Model<NoteDocument>,

    @InjectModel(Quiz.name)
    private readonly quizModel: Model<QuizDocument>,
  ) {}

  //  Syllabus view — lightweight, titles + weekNum only

  findAll(query: NoteQueryDto) {
    return this.noteModel
      .find({
        classId: query.classId,
        subjectId: query.subjectId,
        term: query.term,
      })
      .select('title weekNum term objectives')
      .sort({ weekNum: 1 })
      .lean();
  }

  //  Full note — student and teacher

  async findOne(id: string) {
    const note = await this.noteModel
      .findById(id)
      .populate('classId', 'name')
      .populate('subjectId', 'name color icon')
      .lean();

    if (!note) throw new NotFoundException('Note not found');
    return note;
  }

  //  Create — teacher and admin only

  async create(dto: CreateNoteDto) {
    const exists = await this.noteModel.findOne({
      classId: dto.classId,
      subjectId: dto.subjectId,
      term: dto.term,
      weekNum: dto.weekNum,
    });

    if (exists) {
      throw new ConflictException('A note already exists for this week slot');
    }

    return this.noteModel.create(dto);
  }

  //  Update — teacher and admin only

  async update(id: string, dto: UpdateNoteDto) {
    const note = await this.noteModel.findByIdAndUpdate(id, dto, { new: true });
    if (!note) throw new NotFoundException('Note not found');
    return note;
  }

  //  Delete — admin only, checks for quizzes

  async remove(id: string) {
    const hasQuizzes = await this.quizModel.exists({ noteId: id });
    if (hasQuizzes) {
      throw new ConflictException(
        'Cannot delete note with existing quizzes — delete quizzes first',
      );
    }

    const note = await this.noteModel.findByIdAndDelete(id);
    if (!note) throw new NotFoundException('Note not found');
    return { message: 'Note deleted' };
  }
}
