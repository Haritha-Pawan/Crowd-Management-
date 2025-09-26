import {Router} from 'express';
import { body, validationResult } from 'express-validator';
import { createZone,deleteZone,getallZones, updateZone,getParkingZoneById }  from '../Controller/zone.controller.js';


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
    body("name").isString().trim().isLength({ min: 2, max: 100 }),
    body("location").isString().trim().notEmpty(),
    body("capacity").isInt({ min: 1 }),
    body("type").optional().isString().trim(), // add .isIn([...]) if you use an enum
    body("status").optional().isIn(["active", "inactive"]),
    body("price").optional({ nullable: true }).isFloat({ min: 0 }),
    body("distance").optional({ nullable: true }).isFloat({ min: 0 }),
    body("facilities")
      .optional()
      .custom((v) => Array.isArray(v) || typeof v === "string"),
  ]),
  createZone
);

router.get("/",getallZones);
router.get('/:id', getParkingZoneById);
router.put("/:id",updateZone);
router.delete("/:id",deleteZone)


export default router;


