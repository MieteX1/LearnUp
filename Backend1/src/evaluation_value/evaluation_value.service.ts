import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateEvaluationValueDto } from './dto/create-evaluation_value.dto';
import { UpdateEvaluationValueDto } from './dto/update-evaluation_value.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class EvaluationValueService {

  constructor(private prisma: PrismaService) {}

  async getById(id: number) {
    const value = await this.prisma.evaluation_value.findUnique({
      where: {
        id: +id
      }
    });
    if(!value) throw new NotFoundException('evaluation value not found');

    return value;
  }

  async getValue(id: number) {
    const positive = await this.prisma.evaluation_value.count({
      where: {
        evaluation_id: {
          equals: +id
        },
        is_positive: {
          equals: true
        }
      }
    });

    const negative = await this.prisma.evaluation_value.count({
      where: {
        evaluation_id: {
          equals: +id
        },
        is_positive: {
          equals: false
        }
      }
    });

    return positive - negative;
  }

  async create(dto: CreateEvaluationValueDto) {
    // Sprawdź czy użytkownik już ocenił ten komentarz
    const existingValue = await this.prisma.evaluation_value.findFirst({
      where: {
        evaluation_id: dto.evaluation_id,
        evaluator_id: dto.evaluator_id
      }
    });

    // Jeśli istnieje poprzednia ocena i jest taka sama jak nowa, zwróć błąd
    if (existingValue && existingValue.is_positive === dto.is_positive) {
      throw new ConflictException('You have already rated this comment');
    }

    // Jeśli istnieje poprzednia ocena ale jest przeciwna, usuń ją
    if (existingValue) {
      await this.prisma.evaluation_value.delete({
        where: {
          id: existingValue.id
        }
      });
    }

    // Utwórz nową ocenę
    return this.prisma.evaluation_value.create({
      data: dto
    });
  }

  async update(id: number, dto: UpdateEvaluationValueDto) {
    const value = await this.getById(id);

    return this.prisma.evaluation_value.update({
      where: {
        id: value.id
      },
      data: {
        is_positive: dto.is_positive
      }
    });
  }

  async delete(id: number) {
    const value = await this.getById(id);

    return this.prisma.evaluation_value.delete({
      where: {
        id: value.id
      }
    });
  }
}