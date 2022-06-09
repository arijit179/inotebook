const express  =require('express')
const router  =express.Router();
const fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require('express-validator');
const Note = require('../models/Note')

// Route: 1 Get All the Notes using: GET "/api/notes/fetchallnotes" . Login required
router.get('/fetchallnotes',fetchuser, async(req,res)=>{
        const notes = await Note.find({user: req.user.id});
        // if(!notes) return res.status(400);
        return res.status(200).json(notes)
})

// Route: 2 Add a note using: GET "/api/notes/addnote" . Login required
router.post('/addnote', fetchuser ,[
    body('title','Enter a valid title').isLength({ min: 3 }),
    body('description','Description must be at least 5 chracters').isLength({ min: 5 })], async (req,res)=>{
    try {
        const { title,description,tag } = req.body;

        // If there are errors , return bad request and the errors
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
          }
          const note = new Note({
              title, description, tag, user: req.user.id
          })
          const savedNote = await note.save()
          res.json(savedNote);
    } catch (error) {
      console.log(error.message);
      return res.status(500).send("Internal Server error");
    }
})

// Route: 3 Update a note using: PUT "/api/notes/updatenote" . Login required
router.put('/updatenote/:id', fetchuser, async (req,res)=>{
    const { title,description,tag } = req.body;
    try {
    const newNote = {};
    if(title){newNote.title = title}
    if(description){newNote.description = description}
    if(tag){newNote.tag = tag}

    let note = await Note.findById(req.params.id)
    if(!note){
      return res.status(404).send("Not Found")
    }
    if(note.user.toString() !== req.user.id){
      return res.status(401).send("Not Allowed")
    }
    note = await Note.findByIdAndUpdate(req.params.id , {$set: newNote} , {new:true});
    res.json({note});  
  } catch (error) {
    console.log(error.message);
    return res.status(500).send("Internal Server error");
  }
  })
  
 // Route: 3 Delete a note using: PUT "/api/notes/deletenote" . Login required
router.delete('/deletenote/:id', fetchuser, async (req,res)=>{
  try {
  let note = await Note.findById(req.params.id)
  if(!note){
    return res.status(404).send("Not Found")
  }
  if(note.user.toString() !== req.user.id){
    return res.status(401).send("Not Allowed")
  }
  note = await Note.findByIdAndDelete(req.params.id);
  res.json({"Success":"Note has been deleted" , note:note});
} catch (error) {
  console.log(error.message);
  return res.status(500).send("Internal Server error");
}
}) 
module.exports = router;