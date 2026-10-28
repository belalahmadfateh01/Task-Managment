import catchAsyncError from "../utils/catchAsyncError.js";
import {createComment, getAllComments, getReportComments, updateComment, deleteComment} from "../services/comment.services.js";

const createCommentController = catchAsyncError(async (req, res) => {
    const comment = await createComment(req.params.reportId, req.employee, req.body);

    res.status(201).json({
        success: true, status: 201, message: comment
    });
});
const getAllCommentsController = catchAsyncError(async (req, res) => {
    const comments = await getAllComments();
    res.status(200).json({
        success: true, status: 200, message: comments
    })
});
const getReportCommentController = catchAsyncError(async (req, res) => {
    const comments = await getReportComments(req.params.reportId, req.employee);
    res.status(200).json({
        success: true, status: 200, message: comments
    })
})
const updateCommentController = catchAsyncError(async (req, res) => {
    const newComment = await updateComment(req.params.id, req.body);
    res.status(200).json({
        success: true, status: 200, message: newComment
    })
});
const deleteCommentController = catchAsyncError(async (req, res) => {
    const result = await deleteComment(req.params.id);
    res.status(200).json({
        success: true, status: 200, message: result
    })
})


export {createCommentController, getAllCommentsController, getReportCommentController, updateCommentController, deleteCommentController};