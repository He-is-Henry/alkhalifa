import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubjectController } from './subject.controller';
import { SubjectService } from './subject.service';
import { Subject, SubjectSchema } from './subject.schema';
import { Note, NoteSchema } from '../note/note.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Subject.name, schema: SubjectSchema },
      { name: Note.name, schema: NoteSchema },
    ]),
  ],
  controllers: [SubjectController],
  providers: [SubjectService],
  exports: [SubjectService],
})
export class SubjectModule {}
