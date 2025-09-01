import { Difficulty } from "@prisma/client"

export class CreateTaskMatchDto {
    collection_id:  number
    description:    string
    name:           string
    difficulty:     Difficulty
    category:       string
    order_:        number
}

