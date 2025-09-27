import Student from "../models/student.js";

// export function getStudents(req, res) {
//     //read and get all students information from mongoDB
//     Student.find().then(
//         (students) => {
//             res.json(
//                 students
//             );
//         }
//     ).catch(
//         () => {

//         }
//     );
// }

export async function getStudents(req,res){
    try{
        const students = await Student.find();
        res.json(students);
    }catch(err){
        console.error(err);
        res.status(500).json({
            message : "Failed to retrive students"
        });
    }
}

export function createStudent(req, res) {

    if (req.user == null) {
        res.json({
            message : "Please login and try again"
        });
        return
    }

    if(req.user.role != "admin"){
        res.status(403).json({
            message : "You must be an admin to create a student"
        });
        return
    }

    console.log(req.user.role)

    const student = new Student({
        name: req.body.name,
        age: req.body.age,
        city: req.body.city
    });

    student.save().then(
        () => {
            res.status(200).json({
                message: "Student created successfully"
            });
        }
    ).catch(
        () => {
            res.json({
                message: "Failed to create student"
            });
        }
    )
}