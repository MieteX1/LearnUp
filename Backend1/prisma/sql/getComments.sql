WITH RECURSIVE CommentTree AS (
    SELECT
        e.id AS comment_id,
        e.user_id,
        u.login AS author_login,
        u.profile_picture AS author_profile_picture,
        u.avatar_id AS author_avatar_id,
        CASE
            WHEN e.is_deleted = true THEN 'The comment has been deleted'
            ELSE e.comment
        END AS comment,
        e.is_deleted,
        e.answer AS parent_id,
        (
            SELECT
                COUNT(*) FILTER (WHERE ev.is_positive = true) -
                COUNT(*) FILTER (WHERE ev.is_positive = false)
            FROM public."Evaluation_value" ev
            WHERE ev.evaluation_id = e.id
        ) AS points,
        e.updated_at,
        e.id AS root_id,
        0 AS depth,
        EXISTS (
            SELECT 1
            FROM public."Evaluation_value" ev
            WHERE ev.evaluation_id = e.id
            AND ev.evaluator_id = $2
            AND ev.is_positive = true
        ) as user_liked,
        EXISTS (
            SELECT 1
            FROM public."Evaluation_value" ev
            WHERE ev.evaluation_id = e.id
            AND ev.evaluator_id = $2
            AND ev.is_positive = false
        ) as user_disliked
    FROM public."Evaluation" e
    LEFT JOIN public."User" u ON e.user_id = u.id
    WHERE e.answer IS NULL AND e.collection_id = $1

    UNION ALL

    SELECT
        c.id AS comment_id,
        c.user_id,
        u.login AS author_login,
        u.profile_picture AS author_profile_picture,
        u.avatar_id AS author_avatar_id,
        CASE
            WHEN c.is_deleted = true THEN 'The comment has been deleted.'
            ELSE c.comment
        END AS comment,
        c.is_deleted,
        c.answer AS parent_id,
        (
            SELECT
                COUNT(*) FILTER (WHERE ev.is_positive = true) -
                COUNT(*) FILTER (WHERE ev.is_positive = false)
            FROM public."Evaluation_value" ev
            WHERE ev.evaluation_id = c.id
        ) AS points,
        c.updated_at,
        ct.root_id,
        ct.depth + 1 AS depth,
        EXISTS (
            SELECT 1
            FROM public."Evaluation_value" ev
            WHERE ev.evaluation_id = c.id
            AND ev.evaluator_id = $2
            AND ev.is_positive = true
        ) as user_liked,
        EXISTS (
            SELECT 1
            FROM public."Evaluation_value" ev
            WHERE ev.evaluation_id = c.id
            AND ev.evaluator_id = $2
            AND ev.is_positive = false
        ) as user_disliked
    FROM public."Evaluation" c
    LEFT JOIN public."User" u ON c.user_id = u.id
    INNER JOIN CommentTree ct ON c.answer = ct.comment_id
)

SELECT
    comment_id,
    user_id,
    author_login,
    author_profile_picture,
    author_avatar_id,
    comment,
    is_deleted,
    parent_id,
    points,
    updated_at,
    root_id,
    depth,
    user_liked,
    user_disliked
FROM CommentTree
ORDER BY
    root_id,
    depth,
    points DESC,
    CASE
        WHEN depth = 0 THEN updated_at
        ELSE NULL
    END,
    points DESC;