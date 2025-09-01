export class collectionFilter{
    is_public?:         boolean = true;
    collection_type?:   number;
    author?:            number;
    new_first?:         boolean = true;
    best_first?:        boolean = false;
    subscription_first?:boolean = false;
    limit?:             number;
}