import { Answer_type } from "../answer.type"

export class CreateAnswerDto {
    type:           Answer_type
    collection_id:  number
    option_id?:     number
    test_id?:       number
    answer?:        string
    open_id?:       number
    gap_id?:        number
    match_id?:      number
    answer_id?:     number
}