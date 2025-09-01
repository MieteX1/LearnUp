export class CreateEvaluationValueDto {
    evaluation_id:  number
    // author of comment
    user_id:        number      
    evaluator_id:   number
    is_positive:    boolean
}
