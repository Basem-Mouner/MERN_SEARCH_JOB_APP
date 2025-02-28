
export const successResponse = ({res, message="Done", data, status } = {}) => {
    return res.status(status||200).json({ successMessage: message, data:{...data} });
}