import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskCollectionDto } from './create-task_collection.dto';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class UpdateTaskCollectionDto extends PartialType(CreateTaskCollectionDto) 
{
    @IsString()
    name: string;
    @IsBoolean()
    is_public: boolean; 
    @IsNumber()
    type_id: number;
}
