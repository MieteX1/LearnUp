import { Difficulty } from "@prisma/client"

export class CreateTaskTestDto {
    collection_id:  number
    name:           string
    description:    string
    difficulty:     Difficulty
    category:       string
    order_:        number
}
