import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { TestOptionService } from './test_option.service';
import { CreateTestOptionDto } from './dto/create-test_option.dto';
import { UpdateTestOptionDto } from './dto/update-test_option.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AccessGuard } from 'src/auth/guards/access.guard';
import { AccessEntity } from 'src/auth/guards/entity.acces.enum';
import { Access } from 'src/custom_decorator/access.decorator';

@UseGuards(JwtAuthGuard)
@Controller('test-option')
export class TestOptionController {
  constructor(private readonly testOptionService: TestOptionService) {}
  
  @UseGuards(AccessGuard)
  @Access(AccessEntity.TEST_OPTION)
  @Post()
  create(@Body() dto: CreateTestOptionDto) {
    return this.testOptionService.create(dto);
  }

  @Get(':id')
  findByTest(@Param('id') id: string) {
    return this.testOptionService.findByTestId(+id);
  }

  @UseGuards(AccessGuard)
  @Access(AccessEntity.TEST_OPTION)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTestOptionDto) {
    return this.testOptionService.update(+id, dto);
  }

  @UseGuards(AccessGuard)
  @Access(AccessEntity.TEST_OPTION)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.testOptionService.delete(+id);
  }
}
