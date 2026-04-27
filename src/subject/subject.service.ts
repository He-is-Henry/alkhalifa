import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subject, SubjectDocument } from './subject.schema';
import { Note, NoteDocument } from '../note/note.schema';
import { CreateSubjectDto, UpdateSubjectDto } from './subject.dto';

@Injectable()
export class SubjectService {
  constructor(
    @InjectModel(Subject.name)
    private readonly subjectModel: Model<SubjectDocument>,

    @InjectModel(Note.name)
    private readonly noteModel: Model<NoteDocument>,
  ) {}

  findAll(classId: string) {
    return this.subjectModel
      .find({ classId })
      .populate('classId', 'name')
      .lean();
  }

  async findOne(id: string) {
    const subject = await this.subjectModel
      .findById(id)
      .populate('classId', 'name')
      .lean();
    if (!subject) throw new NotFoundException('Subject not found');
    return subject;
  }

  async create(dto: CreateSubjectDto) {
    const exists = await this.subjectModel.findOne({
      name: dto.name,
      classId: dto.classId,
    });
    if (exists)
      throw new ConflictException('Subject already exists in this class');
    return this.subjectModel.create(dto);
  }

  async update(id: string, dto: UpdateSubjectDto) {
    const subject = await this.subjectModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
    if (!subject) throw new NotFoundException('Subject not found');
    return subject;
  }

  async remove(id: string) {
    const hasNotes = await this.noteModel.exists({ subjectId: id });
    if (hasNotes) {
      throw new ConflictException('Cannot delete subject with existing notes');
    }
    const subject = await this.subjectModel.findByIdAndDelete(id);
    if (!subject) throw new NotFoundException('Subject not found');
    return { message: 'Subject deleted' };
  }
}
