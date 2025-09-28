import {Router} from 'express';
import { body, validationResult } from 'express-validator';
import { 
    createCounter,
    deleteCounter,
    getallCounter, 
    updateCounter,getCounterById,
    totalCounter
    
}  from '../Controller/counter.controller.js';



const router = Router();

const validate = (rules) =>[
    ...rules,
    (req,res,next) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(422).json({errors:errors.array()});
        }
        next();
    },
];

router.post(
    "/",
    validate([
    body("name").isString().trim().isLength({min:2,max:100}),
    body("entrance").isString().trim().notEmpty(),
    body("capacity").isInt({min:1}),
    body("status").optional().isIn(["Entry","Exit"]),
     body("load").optional().isInt({ min: 0 }),
    body("staff").optional().isString().trim().isLength({ min: 1, max: 100 }),
    body("isActive").optional().isBoolean(),
]),

createCounter

);


//get total count of counters(created by lahiru)
router.get("/totalCount",totalCounter);

router.get("/",getallCounter);
router.get('/:id', getCounterById);
router.put("/:id",updateCounter);
router.delete("/:id",deleteCounter);





export default router;


