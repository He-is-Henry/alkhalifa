import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NoteService } from './note.service';
import { CreateNoteDto, UpdateNoteDto, NoteQueryDto } from './note.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../user/user.schema';

@Controller('notes')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  // All authenticated users — syllabus view
  @Get()
  findAll(@Query() query: NoteQueryDto) {
    return this.noteService.findAll(query);
  }

  // All authenticated users — full note
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.noteService.findOne(id);
  }

  // Teachers and admin — create note
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @Post()
  create(@Body() dto: CreateNoteDto) {
    return this.noteService.create(dto);
  }

  // Teachers and admin — edit note
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateNoteDto) {
    return this.noteService.update(id, dto);
  }

  // Admin only — delete note
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.noteService.remove(id);
  }
}
