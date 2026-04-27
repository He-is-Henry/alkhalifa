import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClassModel, ClassDocument } from './class.schema';
import { Subject, SubjectDocument } from '../subject/subject.schema';
import { CreateClassDto, UpdateClassDto } from './class.dto';

@Injectable()
export class ClassService {
  constructor(
    @InjectModel(ClassModel.name)
    private readonly classModel: Model<ClassDocument>,

    @InjectModel(Subject.name)
    private readonly subjectModel: Model<SubjectDocument>,
  ) {}

  findAll() {
    return this.classModel.find().sort({ order: 1 }).lean();
  }

  async findOne(id: string) {
    const cls = await this.classModel.findById(id).lean();
    if (!cls) throw new NotFoundException('Class not found');
    return cls;
  }

  async create(dto: CreateClassDto) {
    const exists = await this.classModel.findOne({ name: dto.name });
    if (exists) throw new ConflictException('Class already exists');
    return this.classModel.create(dto);
  }

  async update(id: string, dto: UpdateClassDto) {
    const cls = await this.classModel.findByIdAndUpdate(id, dto, { new: true });
    if (!cls) throw new NotFoundException('Class not found');
    return cls;
  }

  async remove(id: string) {
    const hasSubjects = await this.subjectModel.exists({ classId: id });
    if (hasSubjects) {
      throw new ConflictException('Cannot delete class with existing subjects');
    }
    const cls = await this.classModel.findByIdAndDelete(id);
    if (!cls) throw new NotFoundException('Class not found');
    return { message: 'Class deleted' };
  }
}
