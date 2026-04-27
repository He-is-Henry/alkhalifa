import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClassController } from './class.controller';
import { ClassService } from './class.service';
import { ClassModel, ClassSchema } from './class.schema';
import { Subject, SubjectSchema } from '../subject/subject.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ClassModel.name, schema: ClassSchema },
      { name: Subject.name, schema: SubjectSchema },
    ]),
  ],
  controllers: [ClassController],
  providers: [ClassService],
  exports: [ClassService],
})
export class ClassModule {}
