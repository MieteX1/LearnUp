import { IsBoolean, IsNumber, IsString } from "class-validator";

export class CreateTaskCollectionDto 
{
    author_id: number;
    @IsString()
    name: string;
    @IsBoolean()
    is_public: boolean; 
    @IsNumber()
    type_id: number;
}
