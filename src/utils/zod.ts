import zod from 'zod'

export const signSchema = zod.object({
    name            : zod.string().max(20),
    email           : zod.string().email(),
    password        : zod.string().min(8),
    profile_picture : zod.string()
})


export const logSchema = zod.object({
    email    : zod.string().email(),
    password : zod.string().min(8)
})

export const courseSchema = zod.object({
    title       : zod.string(),
    description : zod.string(),
    category    : zod.string(),
    thumbnail   : zod.string(),
    price       : zod.number()
})
