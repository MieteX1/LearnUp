import { Difficulty } from "@prisma/client"

export class CreateTaskGapDto {
    collection_id:  number
    description:    string
    name:           string
    text:           string
    difficulty:     Difficulty
    category:       string
    order_:         number
}
